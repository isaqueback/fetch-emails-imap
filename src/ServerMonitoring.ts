import { simpleParser } from 'mailparser'
import { FetchMessageObject, ImapFlow, ImapFlowOptions } from 'imapflow'
import nodemailer from 'nodemailer'
import { env } from './env'
import { MailOptions } from 'nodemailer/lib/sendmail-transport'
import axios, { AxiosRequestConfig } from 'axios'

// Interface for IaaS provider configuration
interface IaasProviderConfig {
  apiUrl: string
  apiId: string
  serverId: number
}

// ServerMonitoring class to handle email monitoring and server actions
export class ServerMonitoring {
  private imapClient: ImapFlow
  private iaasProviderConfig: IaasProviderConfig
  private lastCriticalEmailTime: number | null = null

  constructor(imapConfig: ImapFlowOptions, iaasConfig: IaasProviderConfig) {
    this.imapClient = new ImapFlow(imapConfig)
    this.iaasProviderConfig = iaasConfig
    this.imapClient.on('error', (err) => console.error('IMAP error:', err))
  }

  // Sends an alert email using SMTP settings from environment variables
  private async sendAlertEmail() {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    })

    const alertEmailOptions = {
      from: env.SMTP_USER,
      to: [env.ALERT_RECIPIENT1, env.ALERT_RECIPIENT2].filter(
        (recipient) => recipient !== undefined,
      ),
      subject: 'Alerta de Servidor - Gestix',
      text: 'ALERTA: Servidor 185.132.133.67 não retornou status OK após estado CRÍTICO.',
    } as MailOptions

    try {
      await transporter.sendMail(alertEmailOptions)
    } catch (err) {
      console.error('Error sending alert email:', err)
    }
  }

  // Monitors the inbox for specific email patterns
  public async monitorInbox() {
    try {
      await this.imapClient.connect()
      const lock = await this.imapClient.getMailboxLock('INBOX')

      this.imapClient.on('exists', async () => {
        const mailbox = this.imapClient.mailbox
        if (mailbox && typeof mailbox === 'object' && 'exists' in mailbox) {
          const lastMessage = await this.imapClient.fetchOne(
            mailbox.exists.toString(),
            { source: true },
          )

          if (await this.isCriticalServerMessage(lastMessage)) {
            this.lastCriticalEmailTime = new Date().getTime()

            // Restart the server or other actions
            await this.restartWorldStreamServer()

            setTimeout(
              async () => {
                if (!(await this.checkForOkMessage())) {
                  await this.sendAlertEmail()
                }
              },
              1000 * 60 * 10,
            ) // 10 min
          }
        }
      })

      process.on('SIGINT', async () => {
        console.log('Ending monitoring...')
        lock.release()
        await this.imapClient.logout()
        process.exit(0)
      })
    } catch (err) {
      console.error('Error monitoring inbox:', err)
    }
  }

  // Checks for a specific "OK" message in the inbox
  private async checkForOkMessage() {
    const mailbox = this.imapClient.mailbox
    if (mailbox && typeof mailbox === 'object' && 'exists' in mailbox) {
      for (let i = mailbox.exists; i > 0; i--) {
        const message = await this.imapClient.fetchOne(i.toString(), {
          source: true,
        })
        const parsedEmail = await simpleParser(message.source)

        const email = {
          from: parsedEmail.from?.text ?? '',
          body: parsedEmail.text ?? '',
          date: parsedEmail.date ?? new Date(0),
        }

        const emailTimestamp = email.date.getTime()

        if (
          this.lastCriticalEmailTime &&
          emailTimestamp < this.lastCriticalEmailTime
        )
          break

        if (
          email.from
            .toLowerCase()
            .includes(env.WORLD_STREAM_MONITORING_EMAIL.toLowerCase()) &&
          email.body.toLowerCase().includes('185.132.133.67 is now in ok')
        ) {
          if (
            this.lastCriticalEmailTime &&
            emailTimestamp > this.lastCriticalEmailTime
          ) {
            return true
          }
        }
      }
    }
    return false
  }

  // Checks if the received email matches the critical server status pattern
  private async isCriticalServerMessage(message: FetchMessageObject) {
    const parsedEmail = await simpleParser(message.source)

    const email = {
      from: parsedEmail.from?.text ?? '',
      body: parsedEmail.text ?? '',
    }

    return (
      email.from
        .toLowerCase()
        .includes(env.WORLD_STREAM_MONITORING_EMAIL.toLowerCase()) &&
      email.body.toLowerCase().includes('185.132.133.67 is now in critical')
    )
  }

  private async restartWorldStreamServer() {
    try {
      const { apiId, apiUrl, serverId } = this.iaasProviderConfig

      // Prepare form data for the POST request
      const formData = new URLSearchParams()
      formData.append('method', 'power_control')
      formData.append('api_id', apiId)
      formData.append('server_id', String(serverId))
      formData.append('action', 'reboot')

      const config = {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      } as AxiosRequestConfig

      // Attempt to restart the server twice in case of failure
      for (let i = 0; i < 2; i++) {
        const response = await axios.post(
          `${apiUrl}/api.php#power_control`,
          formData.toString(),
          config,
        )

        // Check if the server restart was successful
        if (response.data.StatusCode === '1') {
          console.log('Server restart requested successfully')
          break
        } else {
          if (i === 0) console.log('Failed to restart, trying again...')
          else console.log('Failed to restart!')
        }
      }
    } catch (err) {
      console.error('Error restarting server:', err)
    }
  }
}
