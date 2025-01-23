import axios from "axios";
import { OnlineCount } from "../types/ogatapi";

export const updateBotAboutMe = async (DISCORD_TOKEN: string, OGAT_API: string) => {
   const epochTime = getEpochTimePlus10Min();
   const onlineCount = await getPlayerCount(OGAT_API);
   const description = `OGAT active status bot.A #MOGA initiative.\nOnline Count: ${onlineCount} \nNext update <t:${epochTime}:R>`;
   const endpoint = "https://discord.com/api/v10/applications/@me";

   const headers = {
      Authorization: `Bot ${DISCORD_TOKEN}`,
      "Content-Type": "application/json",
   };

   const payload = {
      description,
   };

   try {
      await axios.patch(endpoint, payload, { headers });
   } catch (error) {
      console.error("Error updating bot about me");
   }
};

const getEpochTimePlus10Min = (): number => {
   const currentEpochTime = Math.floor(Date.now() / 1000); // Current epoch time in seconds
   const tenMinutesInSeconds = 10 * 60; // 10 minutes in seconds
   return currentEpochTime + tenMinutesInSeconds;
};

export const getPlayerCount = async (OGAT_API: string) => {
   const res = await axios.get<OnlineCount>(OGAT_API!);
   return res.data.online_count.public_lobby;
};
