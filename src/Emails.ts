import { simpleParser } from 'mailparser'
import { ImapFlow } from 'imapflow'
import mailConfig from './config/mail'

interface EmailType {
  from: string
  subject: string
  body: string
}

export class Emails {
  private _emails: EmailType[]
  private client: ImapFlow

  constructor() {
    this.client = new ImapFlow(mailConfig)
    this._emails = []
  }

  public async downloadEmails(
    filterField: 'from' | 'subject' | 'body',
    searchTerm: string,
    totalMessages?: number,
  ) {
    await this.client.connect()
    const lock = await this.client.getMailboxLock('INBOX')
    try {
      if (
        this.client.mailbox &&
        typeof this.client.mailbox === 'object' &&
        'exists' in this.client.mailbox
      ) {
        const maxMessages = totalMessages
          ? Math.min(totalMessages, this.client.mailbox.exists)
          : this.client.mailbox.exists
        for await (const message of this.client.fetch(`1:${maxMessages}`, {
          source: true,
        })) {
          const mail = await simpleParser(message.source)
          const email: EmailType = {
            from: mail.from?.text ?? '',
            subject: mail.subject ?? '',
            body: mail.text ?? '',
          }

          if (
            email[filterField]
              .toLocaleLowerCase()
              .includes(searchTerm.toLocaleLowerCase())
          ) {
            this._emails.push(email)
          }
        }
      }
    } finally {
      lock.release()
    }
    await this.client.logout()
  }

  public get emails() {
    return this._emails
  }
}
