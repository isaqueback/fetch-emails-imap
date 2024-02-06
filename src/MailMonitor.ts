import { simpleParser } from 'mailparser'
import { FetchMessageObject, ImapFlow, ImapFlowOptions } from 'imapflow'
import { env } from './env'
import { ServerActions } from './ServerActions'

interface IsUselessMessageProps {
  message: FetchMessageObject
  data: { from?: string; subject?: string; body?: string }[]
}

export class MailMonitor {
  private imapClient: ImapFlow
  private serverActions: ServerActions
  private lastCriticalEmailTime: number | null = null

  constructor(imapConfig: ImapFlowOptions, serverActions: ServerActions) {
    this.imapClient = new ImapFlow(imapConfig)
    this.serverActions = serverActions
    this.imapClient.on('error', (err) => console.error('IMAP error:', err))
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
            // Restart the server or other actions
            await this.serverActions.restartWorldStreamServer()

            setTimeout(
              async () => {
                if (!(await this.checkForOkMessage())) {
                  await this.serverActions.sendAlertEmail()
                }
              },
              1000 * 60, // 1 min
            )
          } else if (
            await this.isUselessMessage({
              message: lastMessage,
              data: [
                {
                  from: 'someUseLessSender2@example.com',
                  body: 'your useless message',
                },
                {
                  from: 'someUseLessSender2@example.com',
                  subject: 'Some subject',
                  body: 'your useless message',
                },
              ],
            })
          ) {
            await this.deleteMessage(lastMessage.uid)
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
          email.body.toLowerCase().includes('x is now in ok')
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
      date: parsedEmail.date,
    }

    const isCriticalServerMessage =
      email.from
        .toLowerCase()
        .includes(env.WORLD_STREAM_MONITORING_EMAIL.toLowerCase()) &&
      email.body.toLowerCase().includes('ip x is now in critical')

    if (isCriticalServerMessage) {
      this.lastCriticalEmailTime = email.date?.getTime() ?? null

      return true
    }

    return false
  }

  private async isUselessMessage({ data, message }: IsUselessMessageProps) {
    const parsedEmail = await simpleParser(message.source)

    const email = {
      from: parsedEmail.from?.text ?? '',
      subject: parsedEmail.subject ?? '',
      body: parsedEmail.text ?? '',
    }

    return data.some(({ from, subject, body }) => {
      const fromMatch = from
        ? email.from.toLowerCase().includes(from.toLowerCase())
        : true
      const bodyMatch = body
        ? email.body.toLowerCase().includes(body.toLowerCase())
        : true
      const subjectMatch = subject
        ? email.subject.toLowerCase().includes(subject.toLowerCase())
        : true

      return fromMatch && subjectMatch && bodyMatch
    })
  }

  private async deleteMessage(uid: number) {
    try {
      await this.imapClient.messageDelete([uid], { uid: true })
    } catch (err) {
      console.error('Error deleting message:', err)
    }
  }
}
