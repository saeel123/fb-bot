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
                greeting = "Hello " + name + ". ";
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




        let reply1 = {
                      text: "What type of app are you building?",
                      quick_replies: [
                          {
                              "content_type": "text",
                              "title": "Android",
                              "payload": "platform"
                          },
                          {
                              "content_type": "text",
                              "title": "iOS",
                              "payload": "platform"
                          },
                          {
                              "content_type": "text",
                              "title": "Both",
                              "payload": "platform"
                          }
                      ]
                    };

                    let reply2 = {
                                  text: "Do people have to login?",
                                  quick_replies: [
                                      {
                                          "content_type": "text",
                                          "title": "Email",
                                          "payload": "login"
                                      },
                                      {
                                          "content_type": "text",
                                          "title": "Social",
                                          "payload": "login"
                                      },
                                      {
                                          "content_type": "text",
                                          "title": "Phone Number",
                                          "payload": "login"
                                      },
                                      {
                                          "content_type": "text",
                                          "title": "No, not required",
                                          "payload": "login"
                                      }
                                  ]
                                };
                    let reply3 = {
                              text: "Do people create personal profiles?",
                              quick_replies: [
                                  {
                                      "content_type": "text",
                                      "title": "Yes",
                                      "payload": "profile"
                                  },
                                  {
                                      "content_type": "text",
                                      "title": "No",
                                      "payload": "profile"
                                  }
                              ]
                            };
                    let reply4 = {
                                  text: "How will you make money from your app?",
                                  quick_replies: [
                                      {
                                          "content_type": "text",
                                          "title": "Upfront Cost",
                                          "payload": "money"
                                      },
                                      {
                                          "content_type": "text",
                                          "title": "In-App Purchase",
                                          "payload": "money"
                                      },
                                      {
                                          "content_type": "text",
                                          "title": "Free",
                                          "payload": "money"
                                      }
                                  ]
                                };
                      let reply5 = {
                                    text: "Does your app need to connect with your website?",
                                    quick_replies: [
                                        {
                                            "content_type": "text",
                                            "title": "Yes",
                                            "payload": "website"
                                        },
                                        {
                                            "content_type": "text",
                                            "title": "No",
                                            "payload": "website"
                                        }
                                    ]
                                  };
                          let reply6 = {
                          text: "Does your app need a Back-end",
                          quick_replies: [
                                                    {
                                                        "content_type": "text",
                                                        "title": "Yes",
                                                        "payload": "app"
                                                    },
                                                    {
                                                        "content_type": "text",
                                                        "title": "No",
                                                        "payload": "app"
                                                    }
                                                ]
                                              };
                          let reply7           = {
                          text: "Do you need Server and Hosting",
                          quick_replies: [
                                                    {
                                                        "content_type": "text",
                                                        "title": "Yes",
                                                        "payload": "Hosting"
                                                    },
                                                    {
                                                        "content_type": "text",
                                                        "title": "No",
                                                        "payload": "Hosting"
                                                    }
                                                ]
                                              };
                      let reply8           = {
                      text: "How nice should your app look?",
                      quick_replies: [
                                                {
                                                    "content_type": "text",
                                                    "title": "Bare-bones",
                                                    "payload": "look"
                                                },
                                                {
                                                    "content_type": "text",
                                                    "title": "Stock",
                                                    "payload": "look"
                                                },
                                                {
                                                    "content_type": "text",
                                                    "title": "Beautiful",
                                                    "payload": "look"
                                                }
                                            ]
                                          };
            let reply9          = {
            text: "Do you need an app icon?",
            quick_replies: [
                                      {
                                          "content_type": "text",
                                          "title": "Yes, I need an app icon",
                                          "payload": "icon"
                                      },
                                      {
                                          "content_type": "text",
                                          "title": "No, I don't need an app icon",
                                          "payload": "icon"
                                      }
                                  ]
                                };
            let reply10           = {
            text: "Do you want your app to show advertisements?",
            quick_replies: [
                                      {
                                          "content_type": "text",
                                          "title": "Yes",
                                          "payload": "advertisements"
                                      },
                                      {
                                          "content_type": "text",
                                          "title": "No",
                                          "payload": "advertisements"
                                      }
                                  ]
                                };
              let reply11           = {
              text: "What languages does this need to support?",
              quick_replies: [
                                        {
                                            "content_type": "text",
                                            "title": "English (US)",
                                            "payload": "support"
                                        },
                                        {
                                            "content_type": "text",
                                            "title": "Indique Language",
                                            "payload": "support"
                                        },
                                        {
                                            "content_type": "text",
                                            "title": "English (US) + Indique Language/Languages",
                                            "payload": "support"
                                        }
                                    ]
                                  };
              let reply12           = {
              text: "What devices do you want it to support?",
              quick_replies: [
                                        {
                                            "content_type": "text",
                                            "title": "Phone",
                                            "payload": "devices"
                                        },
                                        {
                                            "content_type": "text",
                                            "title": "Tablet",
                                            "payload": "devices"
                                        },
                                        {
                                            "content_type": "text",
                                            "title": "Both",
                                            "payload": "devices"
                                        }
                                    ]
                                  };
          let reply13           = {
          text: "Should your app be displayed in Portrait or Landscape form?",
          quick_replies: [
                                    {
                                        "content_type": "text",
                                        "title": "Portrait",
                                        "payload": "form"
                                    },
                                    {
                                        "content_type": "text",
                                        "title": "Landscape",
                                        "payload": "form"
                                    },
                                    {
                                        "content_type": "text",
                                        "title": "Both",
                                        "payload": "form"
                                    }
                                ]
                              };
                              let reply14           = {
                              text: "Do you have an existing website? ",
                              quick_replies: [
                                                        {
                                                            "content_type": "text",
                                                            "title": "Yes",
                                                            "payload": "e_website"
                                                        },
                                                        {
                                                            "content_type": "text",
                                                            "title": "No",
                                                            "payload": "e_website"
                                                        }
                                                    ]
                                                  };

                  let reply15           = {
                  text: "What stage is your Project in?",
                  quick_replies: [
                                          {
                                              "content_type": "text",
                                              "title": "Idea",
                                              "payload": "stage"
                                          },
                                          {
                                              "content_type": "text",
                                              "title": "Sketches",
                                              "payload": "stage"
                                          },
                                          {
                                                "content_type": "text",
                                                "title": "Development",
                                                "payload": "stage"
                                            },
                                            {
                                                "content_type": "text",
                                                "title": "Prototype",
                                                "payload": "stage"
                                            }
                                      ]
                                    };

              let reply16           = {
              text: "What is your budget for the app?",
              quick_replies: [
                                      {
                                          "content_type": "text",
                                          "title": "Less than US$20000",
                                          "payload": "budget"
                                      },
                                      {
                                          "content_type": "text",
                                          "title": "US$20000 - US$50000",
                                          "payload": "budget"
                                      },
                                      {
                                            "content_type": "text",
                                            "title": "US$50000-US$100000",
                                            "payload": "budget"
                                        },
                                        {
                                            "content_type": "text",
                                            "title": "More than US$100000",
                                            "payload": "budget"
                                        }
                                  ]
                                };



                    let reply17           = {
                    text: "What is the time frame for this app?",
                    quick_replies: [
                                            {
                                                "content_type": "text",
                                                "title": "Less than 1 Month",
                                                "payload": "frame"
                                            },
                                            {
                                                "content_type": "text",
                                                "title": "1-2 Months",
                                                "payload": "frame"
                                            },
                                            {
                                                  "content_type": "text",
                                                  "title": "2-3 Months",
                                                  "payload": "frame"
                                              },
                                              {
                                                  "content_type": "text",
                                                  "title": "More than 3 months",
                                                  "payload": "frame"
                                              }
                                        ]
                                      };
                  if (message.text) {
						var formattedMsg = message.text.toLowerCase().trim();

						if (formattedMsg === "hi"  ) {
							getMessengerName(senderId, function (res) {
								sendMessage(senderId, reply1);
							});
						} else {

              var quickMessage = message.quick_reply;
var pay_load = quickMessage.payload;


              switch (pay_load) {
                case "platform":
              sendMessage(senderId,reply2);
                  break;
                case "login":
           sendMessage(senderId,reply3);
                  break;
                  case "profile":
                sendMessage(senderId,reply4);
                    break;
                  case "money":
                sendMessage(senderId,reply5);
                    break;
                    case "website":
                  sendMessage(senderId,reply6);
                      break;
                    case "app":
               sendMessage(senderId,reply7);
                      break;
                      case "Hosting":
                    sendMessage(senderId,reply8);
                        break;
                      case "look":
                    sendMessage(senderId,reply9);
                        break;
                        case "icon":
                      sendMessage(senderId,reply10);
                          break;
                        case "advertisements":
                    sendMessage(senderId,reply11);
                          break;
                          case "support":
                        sendMessage(senderId,reply12);
                            break;
                          case "devices":
                        sendMessage(senderId,reply13);
                            break;
                            case "form":
                          sendMessage(senderId,reply14);
                              break;
                            case "e_website":
                       sendMessage(senderId,reply15);
                              break;
                              case "stage":
                            sendMessage(senderId,reply16);
                                break;
                              case "budget":
                            sendMessage(senderId,reply17);
                                break;
                                case "frame":
                              sendMessage(senderId,{text: "Please submit your email Id. We'll get back to you soon"});
                                  break;

                default:
                sendMessage(senderId, {text: "Will get back to you soon"});
              }

              // if (formattedMsg === "platform") {
              //   sendMessage(senderId,reply2);
              // } else if (formattedMsg === "careers") {
              //   sendMessage(senderId,reply1);
              // } else if (formattedMsg === "platform") {
              //   sendMessage(senderId,reply2);
              // } else {
              //   sendMessage(senderId, {text: "Will get back to you soon"});
              // }
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
