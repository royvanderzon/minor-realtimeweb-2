var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var multer = require('multer');
var path = require('path');
var nodemailer = require('nodemailer');
var User = require('../models/user.js');
var websiteSettings = require('../models/generalSettings');
var WebSocket = require('ws');
var rtw = require('../rtw');
var request = require('request');
var menus = require('./components/menus');

//make engines array global
global.slackEngines = []

//define io here
var io;
var realtime = {
    init: function(referenceIo) {
        if (referenceIo) {
            io = referenceIo
        }

        //launch all slack engines
        realtime.initslackEngines()
    },
    getUserBot: function(_id) {
        var userEngine = false
        global.slackEngines.map(function(engine) {
            if (String(engine.user._id) == String(_id)) {
                userEngine = engine
            }
        })
        return userEngine
    },
    emitToNamespace: function(namespace, data) {
        io.of('/' + namespace).emit('event_1', data)
    },
    getSlackEngines: function() {
        return global.slackEngines
    },
    startSingleSlackEngine: function(token,user) {
        var data = {
            url: 'https://slack.com/api/' + 'rtm.start',
            form: {
                token: token
            }
        };
        //start engine
        var slackEngine = new realtime.slackEngine(user, data)
        slackEngine.start()
        global.slackEngines.push(slackEngine)
    },
    initslackEngines: function() {
        //get all users
        rtw.getUsers(function(err, result) {
            //for each user
            result.forEach(function(user, index) {
                //for each user where slack access_token is found
                if (user.slack) {
                    if (user.slack.handshake.access_token) {
                        console.log(user.local.email)
                        var data = {
                            url: 'https://slack.com/api/' + 'rtm.start',
                            form: {
                                token: user.slack.handshake.access_token
                            }
                        };
                        //start engine
                        var slackEngine = new realtime.slackEngine(user, data)
                        slackEngine.start()
                        global.slackEngines.push(slackEngine)
                    }
                }

            })
        })

    },
    slackEngine: function(user, data) {

        var self = this;
        self.start = function() {
            //start object
            self.getSocketUrl()
        }
        self.getSocketUrl = function() {
            //get the url from slack to open websocket
            request.post(data, function(err, request, body) {
                //make post request to slack api 'rtm.start'
                if (err) {
                    reject(err);
                    return false;
                }
                try {
                    //parse body reaction from slack
                    body = JSON.parse(body);
                    //if body contains data
                    if (body.ok) {
                        self.openSocket(body)
                            //open the websocket
                    } else {
                        console.log(body);
                    }
                } catch (e) {
                    console.log(e);
                }
            });
        }
        self.messages = []
        self.openSocket = function(body) {
            //open websocket with url obtained from slack response
            var ws = new WebSocket(body.url);
            //listen on message from anyone from a connected slack channel
            ws.on('message', function(data) {
                var data = JSON.parse(data)
                    // this.emit('message', data);
                    //check if message is data
                if (typeof data.text === 'string') {

                    data.time = rtw.dateNow()
                    data.direction = 'input'

                    //check if message is to this user
                    if (data.text.includes('@' + user.slack.handshake.user_id)) {

                        console.log('user._id')
                        console.log(user._id)

                        realtime.emitToNamespace(user._id, data)
                        self.messages.push(data)

                        rtw.searchUser({
                            key: '_id',
                            value: user._id
                        }, function(err, user, result) {
                            console.log('///////////////////////// result command')

                            var commands = result[0].command
                            commands.forEach(function(command) {

                                if (data.text.includes(command.input)) {
                                    console.log('Responded with: ' + command.respond)
                                    var responseMessage = {
                                        "id": Date.now(),
                                        "type": "message",
                                        "channel": data.channel,
                                        "text": command.respond
                                    }

                                    var responseData = responseMessage
                                    responseData.time = rtw.dateNow()
                                    responseData.direction = 'response'

                                    realtime.emitToNamespace(user._id, responseData)
                                    self.messages.push(responseData)

                                    ws.send(JSON.stringify(responseMessage));
                                }

                            })

                        })

                    }
                }
            }.bind(this));
        }
        self.autoResponse = function() {

        }
        self.user = user
        self.data = data

    }
}

module.exports = realtime;
