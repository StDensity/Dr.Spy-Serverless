import { DiscordHono, _channels_$, _channels_$_messages } from "discord-hono";
import { get_player_count } from "./commands/get_player_count";
import { getPlayerCount, updateBotAboutMe } from "./utils/utils";

const app = new DiscordHono()
   .command("get-player-count", (c) => get_player_count(c))
   .command("configure", (c) => {
      return c.res({
         content: "Update Channel ID: " + c.env?.DISCORD_UPDATE_CHANNEL,
      });
   })
   .cron("*/10 * * * *", async (c) => {
      // Updates Bot About Me
      await updateBotAboutMe(c);

      const onlineCount = await getPlayerCount(c.env?.OGAT_API as string);
      try {
         await c.rest.patch(
            _channels_$,

            [c.env?.DISCORD_UPDATE_CHANNEL as string],
            { name: "Players: " + onlineCount }
         );
      } catch (error) {
         console.log("Could not update channel name");
      }
   });

export default app;
