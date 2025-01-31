import { Command } from "discord-hono";
import { factory } from "../init";
import { InteractionContextType } from "discord-api-types/v10";
import { formatDistanceToNow } from 'date-fns';

export const getActivityChart = factory.command(
   new Command("get-activity-chart", "Shows the activity chart.").contexts(
      InteractionContextType.Guild //Makes the command guild only
   ),

   async (c) => {
      const { results } = await c.env.DrspyServerless.prepare(
         "SELECT * FROM activity ORDER BY timestamp ASC LIMIT 200;"
      ).all();

      const relative_time =  results.map((entry) => {
        const date = new Date(entry.timestamp as string);
        return formatDistanceToNow(date, { addSuffix: true })
      } );
      console.log("relative_time", relative_time);
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

      //   console.log(results);
      return c.res({
         content: content,
      });
   }
);
