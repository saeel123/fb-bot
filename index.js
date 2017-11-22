var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");


var Pincode = require('./models/pincode');
var db = mongoose.connect(process.env.MONGODB_URI);

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
var PORT = process.env.PORT || 5000;

// Server index page
app.get("/", function (req, res) {
  res.send("Deployed!");
});

// Facebook Webhook
// Used for verification
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});



// All callbacks for Messenger will be POST-ed here
app.post("/webhook", function (req, res) {
    // Make sure this is a page subscription
    if (req.body.object == "page") {
        // Iterate over each entry
        // There may be multiple entries if batched
        req.body.entry.forEach(function(entry) {
            // Iterate over each messaging event
            entry.messaging.forEach(function(event) {
                if (event.postback) {
                    processPostback(event);
                } else if (event.message) {
                    processMessage(event);
                }
            });
        });

        res.sendStatus(200);
    }
});


function processPostback(event) {
    var senderId = event.sender.id;
    var payload = event.postback.payload;

    if (payload === "Greeting") {
        // Get user's first name from the User Profile API
        // and include it in the greeting
        request({
            url: "https://graph.facebook.com/v2.6/" + senderId,
            qs: {
                access_token: process.env.PAGE_ACCESS_TOKEN,
                fields: "first_name"
            },
            method: "GET"
        }, function(error, response, body) {
            var greeting = "";
            if (error) {
                console.log("Error getting user's name: " +  error);
            } else {
                var bodyObj = JSON.parse(body);
                name = bodyObj.first_name;
                greeting = "Hi " + name + ". ";
            }
            var message = greeting + "Welcome to Helix Tech BOT";
            sendMessage(senderId, {text: message});
        });
    } else if (payload === "Correct") {
        sendMessage(senderId, {text: "Awesome! How we can help You"});
    } else if (payload === "Incorrect") {
        sendMessage(senderId, {text: "Oops! Sorry about that."});
    }
}

function getMessengerName(senderId, callback) {

	request({
			url: "https://graph.facebook.com/v2.6/" + senderId,
			qs: {
					access_token: process.env.PAGE_ACCESS_TOKEN,
					fields: "first_name"
			},
			method: "GET"
	}, function(error, response, body) {
			var greeting = "";
			if (error) {
					console.log("Error getting user's name: " +  error);
			} else {
					var bodyObj = JSON.parse(body);
					name = bodyObj.first_name;
			}

			return callback(name);
	});
}

function processMessage(event) {
    if (!event.message.is_echo) {
        var message = event.message;
        var senderId = event.sender.id;

        let me = {
                      text: "Are you looking for",
                      quick_replies: [
                          {
                              "content_type": "text",
                              "title": "Bussiness",
                              "payload": "bussiness"
                          },
                          {
                              "content_type": "text",
                              "title": "Careers",
                              "payload": "careers"
                          },
                          {
                              "content_type": "text",
                              "title": "Browse",
                              "payload": "browse"
                          }
                      ]
                    };

        console.log("Received message from senderId: " + senderId);
        console.log("Message is: " + JSON.stringify(message));

        if (message.text) {
						var formattedMsg = message.text.toLowerCase().trim();

						if (formattedMsg === "hi"  ) {
							getMessengerName(senderId, function (res) {
								sendMessage(senderId, me);
							});

						} else {

              if (formattedMsg === "bussiness") {
                sendMessage(senderId, {text: "Send us an email on startups@helixtech.co"});
              } else if (formattedMsg === "careers") {
                sendMessage(senderId, {text: "Drop your CV at careers@helixtech.co"});
              } else if (formattedMsg === "browse") {
                sendMessage(senderId, {text: "Happy Browsing"});
              } else {
                sendMessage(senderId, me);
              }

              //sendMessage(senderId, {text: "find Pincode"});

            //   switch(formattedMsg)
            //   {     case "browse":
            //                   getMessengerName(senderId, function (res){
            //                   sendMessage(senderId, me);
            //                 });
            //                 break;
            //
            //         case "careers":
            //                   getMessengerName(senderId, function (res){
            //                   sendMessage(senderId, me);
            //                 });
            //                 break;
            //
            //         case "bussiness":
            //                   getMessengerName(senderId, function (res){
            //                   sendMessage(senderId, me);
            //                 });
            //                 break;
            //
            //         default:
            //                 getMessengerName(senderId, function (res){
            //                 sendMessage(senderId, me);
            //   }
            // }

              // Pincode.findByPincode(formattedMsg, function (err, address) {
              //
							// 	if (err) {
							// 		sendMessage(senderId, {text: "error occured while search"});
							// 	} else if (address === null){
              //
              //     //save the requested pincode in db
							// 		let newPincode = new Pincode({
							// 			pincode: formattedMsg
							// 		});
              //
							// 		Pincode.addPincode(newPincode, function (newPincode, err) {
							// 			if (!err) {
							// 				sendMessage(senderId, {text: "some error occured while proccesing your request"});
							// 			} else {
							// 				sendMessage(senderId, {text: "we dint find that pin in our db. we proccssed your request"});
							// 			}
							// 		});
							// 	} else {
              //     //requested pincode is already there but no address
							// 		//sendMessage(senderId, {text: question['question']});
							// 		if (!address['address']) {
							// 			sendMessage(senderId, {text: "we dont have address for this pin in our db"});
							// 		} else {
							// 			sendMessage(senderId, {text: address['address']});
							// 		}
							// 	}
							// });

						}
        } else if (message.attachments) {
            sendMessage(senderId, {text: "Sorry, I don't understand your request."});
        }
    }
}


function getPincodeAddress(userId, pincode) {

    Pincode.findByPincode(pincode, function(err, address) {
        if(err) {
            sendMessage(userId, {text: "Something went wrong. Try again"});
        } else {
            sendMessage(userId, {text: address});
        }
    });

}






// sends message to user
function sendMessage(recipientId, message) {
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: "POST",
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log("Error sending message: " + response.error);
        }
    });
}



// Spin up the server
app.listen(PORT, function() {
	console.log('running on port', PORT);
})
