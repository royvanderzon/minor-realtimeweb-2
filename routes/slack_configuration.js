var express = require('express');
var mongoose = require('mongoose');
var Bot = require('slackbots');
var rtw = require('../rtw');
var realtime = require('../rtw/realtime.js');
var moment = require('moment');
var request = require("request");
var router = express.Router();

router.get('/', rtw.isLoggedIn, function(req, res) {
    res.render('slack_configuration', {
        page: {
            title: 'Bot Configuration',
            pageSettings: rtw.pageSettings,
            nav: rtw.createNav(req, res)
        },
        user: req.user,
        flashMessage: req.flash('flashMessage')
    });
});

router.post('/save', rtw.isLoggedIn, function(req, res) {

    // command: [{
    //     iterator: String,
    //     input: String,
    //     respond: String
    // }]

    var obj = req.body

    var commands = []

    Object.keys(obj).forEach(function(key) {

        var thisKey = String(key).split('_')
        var iterator = Number(thisKey[1]) - 1

        if (key.includes('iterator')) {
            commands[iterator] = {}
            commands[iterator].iterator = obj[key]
        }
        if (key.includes('input')) {
            commands[iterator].input = obj[key]
        }
        if (key.includes('respond')) {
            commands[iterator].respond = obj[key]
        }

    });

    var changeObj = {
        'command': commands,
    }

    rtw.updateUserOne({
        key: "_id",
        value: req.user._id,
        change: changeObj
    }, function(err, user, result) {
        if (err) {
            res.send('MONGODB: Ooops something went wrong..')
            console.log(err);
        } else {
            req.flash('flashMessage', '<h3 class="err good">Commands saved</h3>')
            res.redirect('/slack_configuration')
        }
    })

})

router.get('/redirect', rtw.isLoggedIn, function(req, res) {

    // https://slack.com/api/oauth.access?client_id=138372543094.172098618502&client_secret=589e90251fbfcf4c702eae8ae3b69248&code=138372543094.171346131540.f4cbf3a103÷

    var url = "https://slack.com/api/oauth.access?client_id=" + process.env.SLACK_CLIENT_ID + "&client_secret=" + process.env.SLACK_CLIENT_SECRET + "&code=" + req.query.code

    request({
        url: url,
        json: true
    }, function(error, response, body) {

        if (!error && response.statusCode === 200) {

            console.log(body) // Print the json response
            var changeObj = {
                slack: {
                    code: req.query.code,
                    handshake: body
                }
            }

            rtw.updateUserOne({
                key: "_id",
                value: req.user._id,
                change: changeObj
            }, function(err, user, result) {
                if (err) {
                    res.send('MONGODB: Ooops something went wrong..')
                    console.log(err);
                } else {
                    rtw.searchUser({
                        key: "_id",
                        value: req.user._id
                    }, function(err, insert_user, user) {
                        // realtime.startSingleSlackEngine(user[0].slack.handshake.access_token,user[0])
                        user = user[0]
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
                    req.flash('flashMessage', '<h3 class="err good">Slack connected</h3>')
                    res.redirect('/slack_configuration')
                }
            })
        }
    })


});

module.exports = router;
