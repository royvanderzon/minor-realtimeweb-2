var express = require('express');
var mongoose = require('mongoose');
var Bot = require('slackbots');
var rtw = require('../rtw');
var moment = require('moment');
var WebSocket = require('ws');
var request = require('request');
var router = express.Router();

var realtime = require('../rtw/realtime');

router.get('/', rtw.isLoggedIn, function(req, res) {

    var messages = []

    var userEngine = realtime.getUserBot(req.user._id)
    if(userEngine){
        messages = userEngine.messages
    }

    res.render('bot/dashboard', {
        page: {
            title: 'Bot Dashboard',
            pageSettings: rtw.pageSettings,
            nav: rtw.createNav(req, res)
        },
        user: req.user,
        flashMessage: req.flash('flashMessage'),
        messages : JSON.stringify(messages)
    });

    // console.log((realtime.getSlackEngines()).length)

    // realtime.getSlackEngines().forEach(function(engine){
    //     //find the user in the engines
    //     if(String(engine.user._id) == String(req.user._id)){
    //         console.log('MATCHHH')

    //     }
    //     return
    // })

    // var data = {
    //     url: 'https://slack.com/api/' + 'rtm.start',
    //     form: {
    //         // token : 'xoxp-138372543094-136986511584-171298984610-af0dcf30c87adc52162ea7a6f91ed320'
    //         token: req.user.slack.handshake.access_token
    //     }
    // };

    // var slackEngine = new realtime.slackEngine(req.user,data)
    // slackEngine.start()

})

module.exports = router;
