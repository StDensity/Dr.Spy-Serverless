import { Command, Option, Embed } from "discord-hono";
import { factory } from "../init";
import { InteractionContextType } from "discord-api-types/v10";
import { formatDistanceToNow, formatDistanceToNowStrict } from "date-fns";

type Var = { duration: string };

export const getActivityChart = factory.command<Var>(
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
      // Configuration object to define limits and modifiers for different durations
      const config = {
         // Configuration for "1-hour" duration: 6 data points, modifier 1
         // limit: Number of data points to retrieve for the chart
         // mod:  Modifier for SQL query to sample data, e.g., mod: 1 means take every 1st row
         "1-hour": {
            limit: 6,
            mod: 1,
         },
         // Configuration for "6-hours" duration: 36 data points, modifier 1
         "6-hours": {
            limit: 36,
            mod: 1,
         },
         // Configuration for "24-hours" duration: 144 data points, modifier 1
         "24-hours": {
            limit: 144,
            mod: 1,
         },
         // Configuration for "7-days" duration (TODO: Implementation needed)
         // Every 2 hours in 7 days
         //  TODO: Plan how to implement. 1. Take average of the whole day. 2. Take the highest value of the day.
         //  "7-days": {
         //     limit: 144,
         //     mod: 7,
         //  },
      };
      // Get the duration from command variables or default to "1-hour"
      const duration = (c.var.duration as keyof typeof config) || "1-hour";

      // SQL query to fetch activity data from the database
      // It uses a CTE (Common Table Expression) called OrderedRows to add a row number to each record
      // Then, it selects records based on the modulo of the row number to sample data points
      const { results } = await c.env.DrspyServerless.prepare(
         `WITH OrderedRows AS (
            SELECT *, ROW_NUMBER() OVER (ORDER BY timestamp DESC) AS row_num
            FROM activity
        )
        SELECT * FROM OrderedRows WHERE (row_num - 1) % ? = 0 LIMIT ?;` // row_num -1 cause to get the first row. ie. (1-0) / number = 0
      )
         .bind(config[duration].mod, config[duration].limit)
         .all();

      //  Reverse the results to show the latest data on the right side of the chart (latest data on the right)
      const flippedResults = results.reverse();

      const relative_time_in_minutes = flippedResults.map((entry) => {
         const date = new Date(entry.timestamp as string); 
         return formatDistanceToNowStrict(date, {
            unit: "minute", 
         }).split(" ")[0]; // Returns the relative time from now in minutes in this format "1222 minutes". Then we split it to get the number.
      });

      // Convert relative times in minutes to a more human-readable format (e.g., "Xh Ym ago")
      const relative_time_in_hours = relative_time_in_minutes.map((time) => {
         const hour = Math.floor(parseInt(time) / 60); // Calculate hours
         const minute = parseInt(time) % 60; // Calculate remaining minutes
         return `${hour}h ${minute}m ago`; // Format the relative time string
      });

      // Configuration for QuickChart.io to generate the activity chart
      // Documentation: https://quickchart.io/documentation/
      const chartConfig = `{
  type: 'line', // Chart type: line chart
  data: {
    labels: ${JSON.stringify(
       relative_time_in_hours
    )}, // Labels for the chart (relative times in "Xh Ym ago" format)
    datasets: [{
      label: 'Active Players', // Label for the dataset
      data: ${JSON.stringify(
         flippedResults.map((entry) => entry.active_players) // Data for the chart (active player counts from database results)
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
      // The embed image uses the attachment://chart.webp from the blob that we sent.
      return c.res(
         {
            embeds: [
               new Embed()
                  .title("A #MOGA Initiative")
                  .description(
                     `Powered by #MOGA Analytics. \nThe chart shows the active players in the last ${duration}.`
                  )
                  .author({
                     name: "Dr.Spy",
                     icon_url:
                        "https://media.discordapp.net/attachments/1241090998197686435/1241091020008198216/avatar.png?ex=664ae9d5&is=66499855&hm=8a09a8dd217dc8cddaebfa9b4bd223fa48049948fe9fedaacd0332b8e76d561d&=&format=webp&quality=lossless",
                  })
                  .image({ url: `attachment://chart.webp` })
                  .footer({
                     text: '"Hey, the online count may include players in private lobbies"',
                     icon_url:
                        "https://media.discordapp.net/attachments/1241090998197686435/1241808909069451304/AVATAR_007_idle_source_gat_engineer.png?ex=664b8c2b&is=664a3aab&hm=3e6f28",
                  }),
            ],
         },
         { blob, name: "chart.webp" }
      );
   }
);
