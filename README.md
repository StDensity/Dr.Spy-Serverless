# DrSpy Serverless - A Discord Bot for OGAT Player Count

DrSpy Serverless is a Discord bot built using Cloudflare Workers and the `discord-hono` library. It provides commands to fetch and display the online player count for the OGAT game.
Special thanks to [discord-hono](https://github.com/luisfun/discord-hono) for the library and [cominu](https://github.com/cominu) for the api.

## Setup and Installation

Follow these steps to deploy your own instance of DrSpy Serverless:

### Steps

1. **Clone the Repository:**

   ```bash
   git clone <repository_url>
   cd drspy-serverless
   ```

2. **Install Dependencies:**

   ```bash
   bun install
   ```

3. **Configure Environment Variables:**

   Create two `.vars` files: `.dev.vars` for local development and `.prod.vars` for production deployment. These files will store your secrets and configuration values.

   **Example `.dev.vars` and `.prod.vars`:**

   ```
   DISCORD_APPLICATION_ID=<YOUR_DISCORD_APPLICATION_ID>
   DISCORD_TOKEN=<YOUR_DISCORD_BOT_TOKEN>
   DISCORD_PUBLIC_KEY=<DISCORD_BOT_PUBLIC_KEY>
   OGAT_API=<YOUR_OGAT_API_ENDPOINT>
   DISCORD_UPDATE_CHANNEL=<YOUR_DISCORD_CHANNEL_ID>
   ```

   Replace the placeholder values with your actual Discord Application ID, bot token, OGAT API endpoint, and the Discord channel ID where bot's status will be updated.

4. **Register the Discord Commands:**

   This step registers the bot commands (`/get-player-count`, `/configure`) with Discord. You need to run this only when the commands change or for the first time.

   -  **For Development:**

      ```bash
      bun run register:dev
      ```

   -  **For Production:**

      ```bash
      bun run register:prod
      ```

5. **Deploy to Cloudflare Workers:**

   **Set Secrets using Wrangler:**

   You'll need to set these secrets for both your `dev` and `prod` environments using the Wrangler CLI. This encrypts the values and stores them securely.
   Make sure you have Wrangler cli installed and logged into your account.

   -  **For Development:**

      ```bash
      wrangler secret put DISCORD_APPLICATION_ID --env dev
      wrangler secret put DISCORD_TOKEN --env dev
      wrangler secret put DISCORD_PUBLIC_KEY --env dev
      wrangler secret put OGAT_API --env dev
      wrangler secret put DISCORD_UPDATE_CHANNEL --env dev
      ```

      Follow the prompts to enter each secret value.

   -  **For Production:**

      ```bash
      wrangler secret put DISCORD_APPLICATION_ID --env prod
      wrangler secret put DISCORD_TOKEN --env prod
      wrangler secret put DISCORD_PUBLIC_KEY --env prod
      wrangler secret put OGAT_API --env prod
      wrangler secret put DISCORD_UPDATE_CHANNEL --env prod
      ```

      Follow the prompts to enter each secret value. **Important:** Make sure you use the production values for your production deployment.

   -  **For Development:**

      ```bash
      bun run deploy:dev
      ```

      This will deploy to your Cloudflare Workers environment using the `.dev.vars` file.

   -  **For Production:**

      ```bash
      bun run deploy:prod
      ```

      This will deploy to your Cloudflare Workers environment using the `.prod.vars` file.

6. **Enable and Invite the Bot:**

   -  Go to the Discord Developer Portal.
   -  Enter the cloudflare worker endpoint to the [INTERACTIONS ENDPOINT URL](https://discord.com/developers/applications).

    -  Create an invite URL from [Dashboard](https://discord.com/developers/applications). `YOUR_APP` > `OAuth2` tab > `OAuth2 URL Generator` > Check SCOPES: `bot` > URL `Copy` Paste the URL into the browser.


# Local Development 

- For local development you can use `bun run dev`, it will use the variables in `.dev.vars`. 
- You might want to proxy with `ngrok` to get a `https` endpoint.
    - Install `ngrok` and run `ngrok http <port>`
    - Now copy and paste the endpoint to the [INTERACTIONS ENDPOINT URL](https://discord.com/developers/applications).