import { ImapFlowOptions } from 'imapflow'
import 'dotenv/config'
import { env } from '@/env'

export default {
  host: env.MONITORING_EMAIL_HOST,
  port: env.MONITORING_EMAIL_PORT,
  secure: true,
  auth: {
    user: env.MONITORING_EMAIL_USER,
    pass: env.MONITORING_EMAIL_PASSWORD,
  },
  logger: false,
} as ImapFlowOptions
