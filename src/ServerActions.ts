import { MailOptions } from 'nodemailer/lib/sendmail-transport'
import { env } from './env'
import nodemailer from 'nodemailer'
import axios, { AxiosRequestConfig } from 'axios'

// Interface for IaaS provider configuration
interface IaasProviderConfig {
  apiUrl: string
  apiId: string
  serverId: number
}

export class ServerActions {
  private iaasProviderConfig: IaasProviderConfig

  constructor(iaasConfig: IaasProviderConfig) {
    this.iaasProviderConfig = iaasConfig
  }

  // Sends an alert email using SMTP settings from environment variables
  public async sendAlertEmail() {
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
      subject: 'Server Alert - Company',
      text: 'warning',
    } as MailOptions

    try {
      await transporter.sendMail(alertEmailOptions)
    } catch (err) {
      console.error('Error sending alert email:', err)
    }
  }

  public async restartWorldStreamServer() {
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
