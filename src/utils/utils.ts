import axios from "axios";
import { OnlineCount } from "../types/ogatapi";
import { _applications_me, CronContext } from "discord-hono";

export const updateBotAboutMe = async (c: CronContext) => {
   const { OGAT_API } = c.env!;
   const epochTime = getEpochTimePlus10Min();
   const onlineCount = await getPlayerCount(OGAT_API);
   const description = `OGAT active status bot. A #MOGA initiative.\nOnline Count: ${onlineCount} \nNext update <t:${epochTime}:R>`;
   try {
      await c.rest.patch(_applications_me, [], {
         description: description,
      });
   } catch (error) {
      console.error("Error updating bot about me", error);
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
