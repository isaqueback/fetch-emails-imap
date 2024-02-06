import { MailMonitor } from './MailMonitor'
import { ServerActions } from './ServerActions'
import monitoringMailConfig from './config/monitoringMail'
import iaasConfig from './config/worldStream'

async function main() {
  const serverMonitoring = new MailMonitor(
    monitoringMailConfig,
    new ServerActions(iaasConfig),
  )

  await serverMonitoring.monitorInbox()
}

try {
  main()
} catch (err) {
  console.error(err)
}
