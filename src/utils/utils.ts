import axios from "axios";
import { OnlineCount } from "../types/ogatapi";
import { _applications_me, CronContext } from "discord-hono";
import assert from "assert";

export const updateBotAboutMe = async (c: CronContext) => {
   const { OGAT_API } = c.env!;
   const epochTime = getEpochTimePlus10Min();
   const onlineCount = await fetchOnlinePlayerCount(OGAT_API);
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

export const fetchOnlinePlayerCount = async (OGAT_API: string) => {
   const res = await axios.get<OnlineCount>(OGAT_API!);
   return res.data.online_count.public_lobby;
};

export const pickRandomItem = <T>(arr: T[]): T  => {
   assert(Array.isArray(arr), "Input must be an array");
   assert(arr.length > 0, "Array must not be empty");
   const randomIndex = Math.floor(Math.random() * arr.length);
   return arr[randomIndex];
};
