import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  // Monitoring Email
  MONITORING_EMAIL_USER: z.string().email(),
  MONITORING_EMAIL_PASSWORD: z.string(),
  MONITORING_EMAIL_HOST: z.string().min(1),
  MONITORING_EMAIL_PORT: z.coerce.number().int().min(0),

  // Alert Sending Email
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().min(0),

  // Alert Receipt Email 1
  ALERT_RECIPIENT1: z.string().email(),

  // Alert Receipt Email 2
  ALERT_RECIPIENT2: z.string().email().optional(),

  // World Stream API
  WORLD_STREAM_API_URL: z.string().url().min(1),
  WORLD_STREAM_API_ID: z.string().min(1),
  WORLD_STREAM_SERVER_ID: z.coerce.number().int().min(0),
  WORLD_STREAM_MONITORING_EMAIL: z.string().email(),
})

function validateEnv() {
  const envData = { ...process.env }
  const result = envSchema.safeParse(envData)

  if (!result.success) {
    console.error('Validation error in environment variables:')
    console.error(result.error)

    process.exit(1) // End the program.
  }

  return result.data
}

export const env = validateEnv()
