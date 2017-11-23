'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_token_is_this') {
		res.send(req.query['hub.challenge'])
	} else {
		res.send('Error, wrong token')
	}
})

// to post data
app.post('/webhook/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			if (text === 'Generic'){
				console.log("welcome to chatbot")
			sendGenericMessage(sender);
				continue
			}
			//sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
      sendGenericMessage(sender);

		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.FB_PAGE_ACCESS_TOKEN
const token = "EAACJwFaZBvnUBAJZByeXyxKgGbt4khASZAnaMfyd4E3lTZANvZBhGeA8jjhF2UkEANmn4fJ46XuXHEhyZA1RdBZC6uRH41Ii5zbjaWFMIrsWpFIByJBA2IdZAVITngdjvm9o7rdjtc0QBwfBYbtHRYjQQdyQ1IOthHKdWDZCsc4iPrgZDZD"

function sendTextMessage(sender, text) {
	let messageData = { text:text }

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function sendGenericMessage(sender) {
	let messageData = {
    "persistent_menu":[
        {
          "locale":"default",
          "composer_input_disabled":true,
          "call_to_actions":[
            {
              "title":"Home",
              "type":"postback",
              "payload":"HOME"
            },
            {
              "title":"Nested Menu Example",
              "type":"nested",
              "call_to_actions":[
                {
                  "title":"Who am I",
                  "type":"postback",
                  "payload":"WHO"
                },
                {
                  "title":"Joke",
                  "type":"postback",
                  "payload":"joke"
                },
                {
                  "title":"Contact Info",
                  "type":"postback",
                  "payload":"CONTACT"
                }
              ]
            },
            {
              "type":"web_url",
              "title":"Latest News",
              "url":"http://foxnews.com",
              "webview_height_ratio":"full"
            }
          ]
        },
        {
          "locale":"zh_CN",
          "composer_input_disabled":false
        }
]
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
