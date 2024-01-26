import { ImapFlowOptions } from 'imapflow'
import 'dotenv/config'
import { env } from '@/env'

export default {
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
  logger: false,
} as ImapFlowOptions
