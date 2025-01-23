import { CommandContext, Embed } from "discord-hono";
import axios from "axios";
import { OnlineCount } from "../types/ogatapi";
import { getPlayerCount } from "../utils/utils";

export const get_player_count = async (c: CommandContext) => {
   try {
      const onlineCount = await getPlayerCount(c.env.OGAT_API!);
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
   } catch (error) {
      return c.res("An error occurred while fetching the player count.");
   }
};
