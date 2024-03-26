import { z } from 'zod'

const envVariables = z.object({
  PORT: z.coerce.number().default(3000),
  AUTH_TOKEN: z.string().min(128),
  IG_THREAD_ID: z.string(),
  IG_USERNAME: z.string(),
  IG_PASSWORD: z.string(),
  PERSISTED_VOLUME_PATH: z.string().optional(),
})

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}

envVariables.parse(process.env)
