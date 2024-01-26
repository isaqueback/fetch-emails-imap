import { simpleParser } from 'mailparser'
import { FetchMessageObject, ImapFlow, ImapFlowOptions } from 'imapflow'
import axios, { AxiosRequestConfig } from 'axios'

interface IaasProviderInfo {
  apiUrl: string
  apiId: string
  serverId: number
}

export class Email {
  private imapClient: ImapFlow
  private iaasProvider: IaasProviderInfo

  constructor(mailConfig: ImapFlowOptions, iaasProvider: IaasProviderInfo) {
    this.imapClient = new ImapFlow(mailConfig)
    this.iaasProvider = iaasProvider

    // Handle IMAP connection errors
    this.imapClient.on('error', (err) => {
      console.error('IMAP error:', err)
    })
  }

  public async monitorInbox() {
    try {
      await this.imapClient.connect() // Connect to the IMAP server

      // Get exclusive access to the inbox
      const lock = await this.imapClient.getMailboxLock('INBOX')

      // Set up 'exists' event listener, triggered when new emails arrive
      this.imapClient.on('exists', async () => {
        const mailbox = this.imapClient.mailbox

        // Check if the mailbox object is defined and has an 'exists' property
        if (mailbox && typeof mailbox === 'object' && 'exists' in mailbox) {
          // Fetch the last message based on the number of existing messages
          const lastMessage = await this.imapClient.fetchOne(
            mailbox.exists.toString(),
            { source: true },
          )

          // Check if the message matches the criteria
          if (await this.isMatchingMessage(lastMessage)) {
            console.log('New e-mail received!')
            // Delete the message
            await this.imapClient.messageDelete([lastMessage.uid], {
              uid: true,
            })

            // Restart the WorldStream server
            await this.restartWorldStreamServer()
          }
        }
      })

      // Handle program termination (e.g., Ctrl + C)
      process.on('SIGINT', async () => {
        console.log('Ending monitoring...')

        // Release the lock on the inbox
        lock.release()

        // Disconnect from the IMAP server
        await this.imapClient.logout()

        // Exit the program with success code (0)
        process.exit(0)
      })
    } catch (err) {
      console.error(err)
    }
  }

  private async isMatchingMessage(message: FetchMessageObject) {
    const parsedEmail = await simpleParser(message.source)

    const email = {
      from: parsedEmail.from?.text ?? '',
      body: parsedEmail.text ?? '',
    }

    // Define the criteria for matching sender and body
    const MATCHING_SENDER = 'monitoring@worldstream.nl'
    const MATCHING_BODY = '185.132.133.67 is now in critical'

    // Check if the email matches the criteria
    const isMatchingSender = email.from
      .toLowerCase()
      .includes(MATCHING_SENDER.toLowerCase())
    const isMatchingBody = email.body
      .toLowerCase()
      .includes(MATCHING_BODY.toLowerCase())

    return isMatchingSender && isMatchingBody
  }

  private async restartWorldStreamServer() {
    try {
      const { apiId, apiUrl, serverId } = this.iaasProvider

      // Prepare form data for the POST request
      const formData = new URLSearchParams()
      formData.append('method', 'power_control')
      formData.append('api_id', apiId)
      formData.append('serverId', String(serverId))
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
