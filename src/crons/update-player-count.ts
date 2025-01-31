import { _channels_$ } from "discord-hono";
import { factory } from "../init";
import { fetchOnlinePlayerCount, updateBotAboutMe } from "../utils/utils";

export const updatePlayerCount = factory.cron("*/10 * * * *", async (c) => {
   // Updates Bot About Me
   await updateBotAboutMe(c);

   const onlineCount = await fetchOnlinePlayerCount(c.env.OGAT_API);

   await c.env.DrspyServerless.prepare(
      "INSERT INTO activity (active_players) VALUES (?);"
   )
      .bind(onlineCount) // Bind the player count dynamically
      .run();
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
