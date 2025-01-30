import { register } from "discord-hono";
import * as interactions from "./commands/index.js";

const commands = Object.values(interactions)
   .filter((e) => "command" in e)
   .map((e) => e.command);

register(
   commands,
   process.env.DISCORD_APPLICATION_ID,
   process.env.DISCORD_TOKEN
   //process.env.DISCORD_TEST_GUILD_ID,
);
