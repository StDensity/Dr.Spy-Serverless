import { Command, Embed } from "discord-hono";
import { factory } from "../init.js";
import { InteractionContextType } from "discord-api-types/v10";
import { fetchOnlinePlayerCount } from "../utils/utils.js";

export const getPlayerCount = factory.command(
   new Command(
      "get_player_count",
      "Returns the no. of players in the game."
   ).contexts(InteractionContextType.Guild), // Makes the command guild only
   async (c) => {
      const onlineCount = await fetchOnlinePlayerCount(c.env.OGAT_API);
      return c.res({
         embeds: [
            new Embed()
               .title("A #MOGA Initiative")
               .description(`Online: ${onlineCount}`)
               .author({
                  name: "Dr.Spy",
                  icon_url:
                     "https://media.discordapp.net/attachments/1241090998197686435/1241091020008198216/avatar.png?ex=664ae9d5&is=66499855&hm=8a09a8dd217dc8cddaebfa9b4bd223fa48049948fe9fedaacd0332b8e76d561d&=&format=webp&quality=lossless",
               })
               .footer({
                  text: '"Hey, the online count may include players in private lobbies"',
                  icon_url:
                     "https://media.discordapp.net/attachments/1241090998197686435/1241808909069451304/AVATAR_007_idle_source_gat_engineer.png?ex=664b8c2b&is=664a3aab&hm=3e6f28",
               }),
         ],
      });
   }
);
