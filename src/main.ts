import { ServerMonitoring } from './ServerMonitoring'
import monitoringMailConfig from './config/monitoringMail'
import worldStreamConfig from './config/worldStream'

async function main() {
  const serverMonitoring = new ServerMonitoring(
    monitoringMailConfig,
    worldStreamConfig,
  )

  await serverMonitoring.monitorInbox()
}

try {
  main()
} catch (err) {
  console.error(err)
}
