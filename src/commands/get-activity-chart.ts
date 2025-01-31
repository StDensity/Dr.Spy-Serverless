import { Command, Option } from "discord-hono";
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
               { name: "last-24-hours", value: "24-hours" },
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
        SELECT * FROM OrderedRows WHERE row_num % ? = 0 LIMIT ?;`
      )
         .bind(config[duration].mod, config[duration].limit)
         .all();

      const relative_time = results.map((entry) => {
         const date = new Date(entry.timestamp as string);
         return formatDistanceToNow(date, { addSuffix: true });
      });

      const chartConfig = `{
  type: 'line',
  data: {
    labels: ${JSON.stringify(relative_time)},
    datasets: [{
      label: 'Active Players',
      data: ${JSON.stringify(results.map((entry) => entry.active_players))}
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

      return c.res({}, fileData);
   }
);
