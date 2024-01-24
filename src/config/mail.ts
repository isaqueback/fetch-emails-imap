import { ImapFlowOptions } from 'imapflow'
import 'dotenv/config'

export default {
  host: process.env.HOST as string,
  port: 993,
  secure: true,
  auth: {
    user: process.env.USER as string,
    pass: process.env.PASSWORD,
  },
  logger: false,
} as ImapFlowOptions
