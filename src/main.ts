import { Email } from './Email'
import mailConfig from './config/mail'
import worldStreamConfig from './config/worldStream'

async function main() {
  const email = new Email(mailConfig, worldStreamConfig)

  await email.monitorInbox()
}

try {
  main()
} catch (err) {
  console.error(err)
}
