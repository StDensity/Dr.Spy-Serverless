import { createFactory } from "discord-hono";

export type Env = {
   Bindings: {
      OGAT_API: string;
      DISCORD_UPDATE_CHANNEL: string;
      DISCORD_TOKEN: string;
      DISCORD_PUBLIC_KEY: string;
      DISCORD_APPLICATION_ID: string;
   };
};

export const factory = createFactory<Env>();
