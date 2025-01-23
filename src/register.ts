import { InteractionContextType } from "discord-api-types/v10";
import { Command, Option, register } from "discord-hono";

const commands = [
   new Command(
      "get-player-count",
      "Returns the no. of players in the game."
   ).contexts(InteractionContextType.Guild),
   new Command("configure", "Shows the configuration values.")
      .contexts(InteractionContextType.Guild)
      .default_member_permissions("8"),
   //  new Command("help", "response help")
   //     .options(new Option("text", "with text"))
   //     .contexts(InteractionContextType.Guild),
];

register(
   commands,
   process.env.DISCORD_APPLICATION_ID,
   process.env.DISCORD_TOKEN
   //process.env.DISCORD_TEST_GUILD_ID,
);
