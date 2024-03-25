import { z } from 'zod'

const envVariables = z.object({
  AUTH_TOKEN: z.string().min(256),
  IG_THREAD_ID: z.string(),
  IG_USERNAME: z.string(),
  IG_PASSWORD: z.string(),
  AUTH_STATE_PATH: z.string().optional(),
})

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}

envVariables.parse(process.env)
