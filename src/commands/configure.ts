import { Command } from "discord-hono";
import { factory } from "../init";
import { InteractionContextType } from "discord-api-types/v10";

export const configure = factory.command(
   new Command("configure", "Shows the configuration values.")
      .contexts(InteractionContextType.Guild) //Makes the command guild only
      .default_member_permissions("8"), // Admin only
   (c) => {
      return c.res({
         content: "Update Channel ID: " + c.env.DISCORD_UPDATE_CHANNEL,
      });
   }
);
