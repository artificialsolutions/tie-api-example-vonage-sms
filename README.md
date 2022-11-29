# tie-api-example-nexmo-sms
The Nexmo SMS connector enables a Teneo bot to communicate with users by receiving and sending SMS messages. This Node.js connector acts as middleware between Nexmo SMS API and a Teneo bot to implement SMS communication with persisting state and conversational position. Visit [Nexmo](https://developer.nexmo.com/api/sms) for more information.

## Prerequisites
### Teneo Engine
Your bot needs to be published and you need to know the engine url.

### Nexmo SMS API
A [Nexmo](https://dashboard.nexmo.com/sign-up) account with a 'Virtual Phone Number' configured in it.
The steps to setup the account, configure Billing, and buying a virtual number are described ahead.

_Important:_ Adding funds is required to buy a 'Virtual Phone Number'. €10 will suffice to purchase a number and send many SMS messages.

### HTTPS

**Note: Starting November 28, 2022, free Heroku Dynos, free Heroku Postgres, and free Heroku Data for Redis® plans will no longer be available.**

A [Heroku](https://www.heroku.com/home) account is required to deploy the connector online.

Or, to run the connector locally, [ngrok](https://ngrok.com/) is preferred to make the connector available via HTTPS.

## Nexmo Setup Instructions
To setup communication by SMS between a Teneo bot and Nexmo's SMS API follow these steps:
1. Register an account [here](https://dashboard.nexmo.com/sign-up).
2. Set up Billing
    From your new account's dashboard, open [Billing and Payment](https://dashboard.nexmo.com/billing-and-payments).
    Set up a payment method and add €10 to your funds. This should be enough to purchase a virtual SMS phone number for around 2€ or €4, and send many SMS messages for a few cents each. [Pricing](https://dashboard.nexmo.com/pricing) varies per country.
3. Buy a 'Virtual Phone Number'
    Open the [Buy Number](https://dashboard.nexmo.com/buy-numbers) section your Nexmo dashboard.
    Select your country to obtain cheaper rates, set 'Features' to `SMS`, set Type to `Mobile`, and click 'Search'.
    Choose a number from the list, click `Buy`. Note: The process of buying virtual phone numbers may vary across countries.
4. Ensure that the `HTTP Method` in Nexmo's [Default SMS Settings](https://dashboard.nexmo.com/settings) is set to 'POST'.
  

## Connector Setup Instructions
Two ways of running this connector are described ahead. The first way, is by [running the connector online with Heroku](#running-the-connector-on-heroku). This is the easiest to get the connector running for non-developers since it does not require you to run Node.js or download or modify any code.

The second way is to [run the connector locally](#running-the-connector-locally) or to deploy it on a server of your choice. This is preferred if you're familiar with node.js development and want to have a closer look at the code, or implement modifications and enhancements.

### Running the connector on Heroku
1. Click the button below to deploy the connector to Heroku:

    [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/artificialsolutions/tie-api-example-nexmo-sms)

2. In the 'Config Vars' section, add the following:
    * **NEXMO_API_KEY** Use the `API key value` of your Nexmo account, found in [Settings](https://dashboard.nexmo.com/settings).
    * **NEXMO_API_SECRET** Use the `API Secret 1`, also found in [Settings](https://dashboard.nexmo.com/settings).
    * **NEXMO_NUMBER** Use the Virtual Phone Number found [here](https://dashboard.nexmo.com/your-numbers) purchased previously, in E.164 format. 
    * **TENEO_ENGINE_URL:** The engine url of your bot.
3. Click on 'Deploy App', and wait for Heroku to complete the deployment. Click 'View' to see your new Heroku's app URL. Copy it, we will use it as a `Incoming Webhook URL` in the next step.
4. In your Nexmo account's dashboard, [navigate](https://dashboard.nexmo.com/your-numbers) to the Virtual Phone Number you purchased in the previous step, and click on `Manage`. Paste the url of your heroku app in the `Inbound Webhook URL` field and append it will `/teneochat`. The final url should look something like: https://yourherokuapp.herokuapp.com/teneochat.

That's it! Text your Virtual Phone Number with a mobile phone, and the Teneo bot will send an SMS reply!

### Running the connector locally
The local deployment of this connector allows you to enhance and modify its functionality. To run the connector locally, follow these steps:

1. Download or clone the connector source code:
    ```
    git clone https://github.com/artificialsolutions/tie-api-example-nexmo-sms.git && cd tie-api-example-nexmo-sms
    ```
2. Install dependencies by running the following command in the folder where you stored the source:
    ```
    npm install
    ``` 
3. Create a file called `.env` in the `tie-api-example-nexmo-sms` folder. Replace the dummy URL with Teneo Engine URL of your bot. "API key" and "API Secret" are found in [Settings](https://dashboard.nexmo.com/settings)
    ```
    TENEO_ENGINE_URL=<your_engine_url>
    NEXMO_API_KEY=<your API key>
    NEXMO_API_SECRET=<your API Secret 1>
    NEXMO_NUMBER=<Virtual Phone Number in E.164 format>
    ```
4. Start the connector:
    ```
    node server.js
    ```

Next, we need to make the connector available via https. We'll use [ngrok](https://ngrok.com) for this.

1. Start ngrok. The connector runs on port 1337 by default, so we need to start ngrok like this:
    ```
    ngrok http 1337
    ```
2. Running the command above will display a public https URL. Copy it, we will use it as a `Incoming Webhook URL` in the final step below.
3. Inside your Nexmo account's dashboard, [navigate](https://dashboard.nexmo.com/your-numbers) to the Virtual Phone Number you purchased in the previous step, and click on `Manage`. Paste the public https URL provided by ngrok in the `Inbound Webhook URL` field and append it will `/teneochat`. It should look something like this: https://abcd1234.ngrok.io/teneochat. 

That's it! Text your Virtual Phone Number with a mobile phone, and the Teneo bot will send an SMS reply!
