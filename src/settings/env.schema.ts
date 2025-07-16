import { z } from "zod";

export const envSchema = z.object({
    BOT_TOKEN: z.string("Discord Bot Token is required").min(1),
    MONGO_URI: z.string("MongoDb URI is required").min(1),
    WEBHOOK_LOGS_URL: z.url("Webhok for logs is required").min(1)
});