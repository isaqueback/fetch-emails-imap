import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  EMAIL_USER: z.string().email(),
  EMAIL_PASSWORD: z.string(),
  EMAIL_HOST: z.string().min(1),
  EMAIL_PORT: z.coerce.number().int().min(0),

  WORLD_STREAM_API_URL: z.string().url().min(1),
  WORLD_STREAM_API_ID: z.string().min(1),
  WORLD_STREAM_SERVER_ID: z.coerce.number().int().min(0),
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
