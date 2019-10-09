/**
 * Copyright 2019 Artificial Solutions. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const http = require('http');
const express = require('express');
const qs = require('querystring');
const TIE = require('@artificialsolutions/tie-api-client');
const nexmoSMSRequest = require('request');
require('dotenv').config();


const config = {
  teneoURL: process.env.TENEO_ENGINE_URL,
  nexmoNumber: process.env.NEXMO_NUMBER,
  nexmoApiKey: process.env.NEXMO_API_KEY,
  nexmoApiSecret: process.env.NEXMO_API_SECRET,
  port: process.env.PORT
};


const port = config.port || 1337;
const teneoApi = TIE.init(config.teneoURL);

// Initialise session handler, to store mapping between a Nexmo number and an engine session id
const sessionHandler = SessionHandler();

// Initialize an Express application
const app = express();
const router = express.Router()

// Tell express to use this router with /api before.
app.use("/", router);

// Nexmo message comes in
router.post("/teneochat", teneoChat(sessionHandler));

// Send a Nexmo SMS
router.post("/sendsms", sendNexmoSMSMessage());

// Send a SMS - standlone API call for SMS sends during Teneo dialogue
function sendNexmoSMSMessage() {

  return (req, res) => {

    let body = '';
    req.on('data', function (data) {
      body += data;
    });

    req.on('end', async function () {

      var post = JSON.parse(body);

      // Send text response to user via Nexmo SMS
      sendSMS(post.phoneNumber, post.message);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{}');
    });
  }
}


// Send a SMS
function sendSMS(phoneNumber, message) {

	nexmoSMSRequest.post('https://rest.nexmo.com/sms/json', {
		json: {
			from: config.nexmoNumber,
			to: phoneNumber,
			api_key: config.nexmoApiKey,
			api_secret: config.nexmoApiSecret,
			text: message
		}
	}, (error, response, body) => {
		if (error) {
			console.error(error)
			return
		}
		console.log('Status code from Nexmo SMS Send: ${response.statusCode}')
		console.log('Sent message <<' + message + '>> to number <<' + phoneNumber + '>>');
	});
}


// Handle incoming Nexmo message
function teneoChat(sessionHandler) {

  return (req, res) => {

    let body = '';
    req.on('data', function (data) {
      body += data;
    });

    req.on('end', async function () {

      var post = qs.parse(body);
      const callingPhoneNumber = post.msisdn;
      const input = post.text;

      console.log("SMS from " + callingPhoneNumber + " was: " + input);

      // Check if we have stored an engine sessionid for this caller
      const teneoSessionId = sessionHandler.getSession(callingPhoneNumber);

      // Send the user's input from the SMS to Teneo, and obtain a response
      const teneoResponse = await teneoApi.sendInput(teneoSessionId, { 'text': input, 'channel': 'nexmo-sms', 'phoneNumber': callingPhoneNumber});

      // Stored engine sessionid for this caller
      sessionHandler.setSession(callingPhoneNumber, teneoResponse.sessionId);

      // Send text response to user via Nexmo SMS
      sendSMS(callingPhoneNumber, teneoResponse.output.text)

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('');
    });
  }
}

/***
 * SESSION HANDLER
 ***/

function SessionHandler() {

  // Map the Nexmo Phone Number to the Teneo Engine Session ID.
  // This code keeps the map in memory, which is ok for demo purposes
  // For production usage it is advised to make use of more resilient storage mechanisms like redis
  const sessionMap = new Map();

  return {
    getSession: (userId) => {
      if (sessionMap.size > 0) {
        return sessionMap.get(userId);
      }
      else {
        return "";
      }
    },
    setSession: (userId, sessionId) => {
      sessionMap.set(userId, sessionId)
    }
  };
}

// start the express application
http.createServer(app).listen(port, () => {
  console.log(`Listening on port: ${config.port}`);
});