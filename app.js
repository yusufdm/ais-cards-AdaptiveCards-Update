// This loads the environment variables from the .env file
require('dotenv-extended').load();

var util = require('util');
var builder = require('botbuilder');
var restify = require('restify');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot and listen to messages
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

var inMemoryStorage = new builder.MemoryBotStorage();

// This is a Disaster Management bot that uses Adaptive cards approach.
var bot = new builder.UniversalBot(connector, function (session) {

    if (session.message && session.message.value) {
        // A Card's Submit Action obj was received
        processSubmitAction(session, session.message.value);
        return;
    }

    // Display card
    var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'content': {
            '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
            'type': 'AdaptiveCard',
            'version': '1.0',
            'body': [
                {
                    'type': 'Container',
                    'speak': '<s>Welcome Disaster Management Centre</s>',
                    'items': [
                        {
                            'type': 'ColumnSet',
                            'columns': [
                                {
                                    'type': 'Column',
                                    'size': 'auto',
                                    'items': [
                                        {
                                            'type': 'Image',
                                            'url': 'https://placeholdit.imgix.net/~text?txtsize=65&txt=Adaptive+Cards&w=300&h=300',
                                            'size': 'medium',
                                            'style': 'person'
                                        }
                                    ]
                                },
                                {
                                    'type': 'Column',
                                    'size': 'stretch',
                                    'items': [
                                        {
                                            'type': 'TextBlock',
                                            'text': 'Hello!',
                                            'weight': 'bolder',
                                            'isSubtle': true
                                        },
                                        {
                                            'type': 'TextBlock',
                                            'text': 'Welcome Disaster Management Centre.',
                                            'wrap': true
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            'actions': [
                {
                    'type': 'Action.ShowCard',
                    'title': 'Click here to provide data',
                    'speak': '<s>Males</s>',
                    'card': {
                        'type': 'AdaptiveCard',
                        'body': [
                            
                            {
                                'type': 'TextBlock',
                                'text': 'Location:'
                            },
                            {
                                'type': 'Input.Text',
                                'id': 'disaterLocation',
                                'placeholder': 'input location here',
                                'style': 'text'
                            },
                            {
                                'type': 'TextBlock',
                                'text': 'Please enter count dead/injured - Male:'
                            },
                            {
                                'type': 'Input.Text',
                                'id': 'maleCount',
                                'placeholder': '0',
                                'style': 'text'
                            },
                            {
                                'type': 'TextBlock',
                                'text': 'Please enter count dead/injured - Female:'
                            },
                            {
                                'type': 'Input.Text',
                                'id': 'femaleCount',
                                'placeholder': '0'
                            },
                            {
                                "type": "TextBlock",
                                "text": "What are your major needs now?"
                            },
                            {
                                "type": "Input.ChoiceSet",
                                "id": "majorNeedsChoice",
                                "isMultiSelect": true,
                                "value": "1",
                                "style": "expanded",
                                "choices": [
                                    {
                                        "title": "Food, Water and Clothing",
                                        "value": " Food, Water and Clothing"
                                    },
                                    {
                                        "title": "First-aid kits and Medication",
                                        "value": " First-aid kits and Medication"
                                    },
                                    {
                                        "title": "Tools and supplies",
                                        "value": " Tools and supplies"
                                    }
                                ]
                            }
                        ],
                        'actions': [
                            {
                                'type': 'Action.Submit',
                                'title': 'Submit',
                                'speak': '<s>Submit</s>',
                                'data': {
                                    'type': 'submitData'
                                }
                            }
                        ]
                    }
                },
            ]
        }
    };

    var msg = new builder.Message(session)
        .addAttachment(card);
    session.send(msg);
}).set('storage', inMemoryStorage); // Register in memory storage


function processSubmitAction(session, value) {
    switch (value.type) {
        case 'submitData':
            session.send(`Disaster data collected. \nFollowing are the details: <br/>Location: ${value.disaterLocation} <br/>Dead/Injured: Male - ${value.maleCount}, Female - ${value.femaleCount} <br/>Current major needs - ${value.majorNeedsChoice}`);
            break;
    }
}
