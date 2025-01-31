import { Command, Embed, Option } from "discord-hono";
import { factory } from "../init";
import { InteractionContextType } from "discord-api-types/v10";
import { formatDistanceToNow } from "date-fns";

export const getActivityChart = factory.command(
   new Command("get-activity-chart", "Shows the activity chart.")
      .contexts(
         InteractionContextType.Guild //Makes the command guild only
      )
      .options(
         new Option(
            "duration",
            "Returns the activity chart for the last specific duration.",
            "String"
         )
            .choices(
               { name: "last-1-hour", value: "1-hour" },
               { name: "last-6-hours", value: "6-hours" },
               { name: "last-24-hours", value: "24-hours" }
               //    { name: "last-7-days", value: "7-days" }
            )
            .required(true)
      ),

   async (c) => {
      const config = {
         // Every 10 minutes in an hour
         "1-hour": {
            limit: 6,
            mod: 1,
         },
         // Every 20 minutes in 6 hours
         "6-hours": {
            limit: 23,
            mod: 2,
         },
         // Every 30 minutes in 24 hours
         "24-hours": {
            limit: 48,
            mod: 3,
         },
         // Every 2 hours in 7 days
         //  TODO: Plan how to implement. 1. Take average of the whole day. 2. Take the highest value of the day.
         //  "7-days": {
         //     limit: 144,
         //     mod: 7,
         //  },
      };
      const duration = (c.var.duration as keyof typeof config) || "1-hour";

      const { results } = await c.env.DrspyServerless.prepare(
         `WITH OrderedRows AS (
            SELECT *, ROW_NUMBER() OVER (ORDER BY timestamp DESC) AS row_num
            FROM activity
        )
        SELECT * FROM OrderedRows WHERE (row_num - 1) % ? = 0 LIMIT ?;` // row_num -1 cause to get the first row. ie. (1-0) / number = 0
      )
         .bind(config[duration].mod, config[duration].limit)
         .all();

      //  Reverse the results to show the latest data on the right side.
      const flippedResults = results.reverse();

      const relative_time = flippedResults.map((entry) => {
         const date = new Date(entry.timestamp as string);
         return formatDistanceToNow(date, { addSuffix: true });
      });

      const chartConfig = `{
  type: 'line',
  data: {
    labels: ${JSON.stringify(relative_time)},
    datasets: [{
      label: 'Active Players',
      data: ${JSON.stringify(
         flippedResults.map((entry) => entry.active_players)
      )}
    }]
  },
  
}`;

      const content = `https://quickchart.io/chart?c=${encodeURIComponent(
         chartConfig
      )}`;

      const imageResponse = await fetch(content);
      if (!imageResponse.ok) {
         throw new Error("Failed to generate chart");
      }

      const imageBuffer = await imageResponse.arrayBuffer();

      const blob = new Blob([imageBuffer], { type: "image/png" });

      // Create the FileUnit object
      const fileData = {
         blob,
         name: "chart.png",
      };

      //   return c.res({}, fileData);
      return c.res({
         embeds: [
            new Embed()
               .title("A #MOGA Initiative")
               .description("Powered by #MOGA Analytics")
               .author({
                  name: "Dr.Spy",
                  icon_url:
                     "https://media.discordapp.net/attachments/1241090998197686435/1241091020008198216/avatar.png?ex=664ae9d5&is=66499855&hm=8a09a8dd217dc8cddaebfa9b4bd223fa48049948fe9fedaacd0332b8e76d561d&=&format=webp&quality=lossless",
               })
               .image({ url: content })
               .footer({
                  text: '"Hey, the online count may include players in private lobbies"',
                  icon_url:
                     "https://media.discordapp.net/attachments/1241090998197686435/1241808909069451304/AVATAR_007_idle_source_gat_engineer.png?ex=664b8c2b&is=664a3aab&hm=3e6f28",
               }),
         ],
      });
   }
);
