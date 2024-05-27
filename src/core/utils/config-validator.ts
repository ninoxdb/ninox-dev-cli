import {z} from 'zod'

const environmentSchema = z.object({
  apiKey: z.string(),
  domain: z.string().url(),
  workspaceId: z.string(),
})

export const configSchema = z.object({
  environments: z.record(environmentSchema),
})
