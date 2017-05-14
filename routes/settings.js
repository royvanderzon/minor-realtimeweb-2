var express = require('express');
var mongoose = require('mongoose');
var rtw = require('../rtw');
var router = express.Router();

// console.log(rtw.pageSettings.signupActive())

//##GET ADMIN HOME PAGE
router.get('/', rtw.isLoggedIn, rtw.checkLevel([10]), function(req, res) {
    rtw.findSetting(false, function(err, setting, result) {
        // console.log(result);
        res.render('settings/index.ejs', {
            page: {
                title: 'Settings',
                pageSettings: rtw.pageSettings,
                nav: rtw.createNav(req, res)
            },
            user: req.user,
            settingsOptions: result,
            flashMessage: req.flash('flashMessage')
        });
    });
});

//##POST TO CHANGE SETTINGS (AJAX CALL FROM CLIENT)
router.post('/changeSetting', rtw.isLoggedIn, rtw.checkLevel([10]), function(req, res) {
    //get json from page
    var dataObj = req.body;
    //update settings from ajax call from client
    var change = {};
    // change['userSettings.'+dataObj.settingChange.name] = dataObj.settingChange.state;
    rtw.updateSetting({
        key: 'userSettings.' + dataObj.settingChange.name,
        value: dataObj.settingChange.state
    }, function(err, settng, result) {
        if (err) {
            console.log('something went wrong..');
            res.end('something went wrong..');
        } else {
            //set server variable in :ss/index.js | this is backupped in mongodb to
            rtw.pageSettings[dataObj.settingChange.name] = dataObj.settingChange.state;
            res.end('ok');
        }
        // console.log(rtw.pageSettings[dataObj.settingChange.name]);
    });
});

//##GET USER PAGE IN ADMIN (LOAD AL USERS)
router.get('/users', rtw.isLoggedIn, rtw.checkLevel([10]), function(req, res) {
    //Titles of tables
    var tableTitles = [
        { title: "ID" },
        { title: "Email" },
        { title: "Level" },
        { title: "First Name" },
        { title: "Last Name" },
        { title: "Birth Date" },
        { title: "Gender" },
        { title: "Country" },
        { title: "City" },
        { title: "Number" },
        { title: "Adress" },
        { title: "Zip" }
    ];
    //get al user to make user table
    rtw.searchUser(false, function(err, user, result) {
        res.render('settings/users.ejs', {
            page: {
                title: 'Settings',
                pageSettings: rtw.pageSettings,
                nav: rtw.createNav(req, res),
            },
            //user result
            users: JSON.stringify(result),
            tableSettings: {
                //titles of tables
                titles: tableTitles,
                parseTitles: JSON.stringify(tableTitles)
            },
            user: req.user,
            flashMessage: req.flash('flashMessage')
        });
    })
});

//##POST TO EDIT USER
router.post('/editUser', rtw.isLoggedIn, rtw.checkLevel([10]), function(req, res) {
    //update user
    rtw.updateUserOne({
        key: "_id",
        value: String(req.body.inputId),
        change: {
            //change user in mongodb
            'local.level': String(req.body.inputLevel),
            'local.email': String(req.body.inputEmail),
            'data.firstName': (req.body.firstName || ''),
            'data.lastName': (req.body.lastName || ''),
            'data.birthDate': (req.body.birthDate || ''),
            'data.gender': (req.body.gender || ''),
            'data.country': (req.body.country || ''),
            'data.city': (req.body.city || ''),
            'data.number': (req.body.number || ''),
            'data.adress': (req.body.adress || ''),
            'data.zip': (req.body.zip || '')
        }
    }, function(err, user, result) {
        if (err) {
            console.log(err);
            res.send('sorry wrong command...');
        } else {
            res.redirect('/settings/users');
        }
    })
});

//##GET INVITE PAGE IN ADMIN SETTINGS
router.get('/invite', rtw.isLoggedIn, rtw.checkLevel([10]), function(req, res) {
    rtw.searchUser({
        key: 'mailInvite.active',
        value: 'false'
    }, function(err, user, result) {
        // console.log(result);
        // console.log('//////////////////////////////////');
        if (err) return handleError(err);
        res.render('settings/invite.ejs', {
            page: {
                title: 'Invite user',
                pageSettings: rtw.pageSettings,
                nav: rtw.createNav(req, res),
            },
            user: req.user,
            message: req.flash('inviteMessage'),
            errorMessage: req.flash('errorInviteMessage'),
            notActiveUsers: result,
            flashMessage: req.flash('flashMessage')
        });
    });
});

//##POST INVITE (NEW USER) TO SEND INVITE TO EMAIL
router.post('/invite', rtw.isLoggedIn, rtw.checkLevel([10]), function(req, res) {
    var emailOne = req.body.emailOne;
    var emailTwo = req.body.emailTwo;
    //#check if passwords are same
    if (String(emailOne) == String(emailTwo)) {

        //#check if email user already exists
        rtw.searchUser({
            key: 'local.email',
            value: emailOne
        }, function(err, user, result) {
            if (err) return handleError(err);
            var exEmail = result;
            //#are there any known emails
            if (exEmail.length > 0) {
                //email adress already exists
                req.flash('errorInviteMessage', "This email already exists");
                res.redirect('/settings/invite');
            } else {
                //email adress don't exists
                //#make new user
                rtw.newInviteUser({
                    local: {
                        email: emailOne,
                        password: Math.floor(Math.random() * 1000000000),
                        level: 2
                    },
                    mailInvite: {
                        active: 'false',
                        token: (String(Date.now()) + Math.floor(Math.random() * 1000000000000)),
                        release: String(Date.now())
                    }
                }, function(thisNewData) {

                    // console.log(thisNewData);
                    //#build mail with token to new user
                    var mailOptions = {
                            from: 'Social Scout Agency',
                            to: thisNewData.local.email,
                            subject: 'Welcome to the Social Scout Community |EXCLUSIVE INVITE|',
                            text: 'Dear new user, visit the following link to register your account: ' + rtw.pageSettings.rootWebsiteLink + '/invite/register/' + thisNewData.mailInvite.token,
                            html: '<h2>We are happy you want to join us!</h2><p>Dear new user, visit the following link to register your account:</p><a href="' + rtw.pageSettings.rootWebsiteLink + '/invite/register/' + thisNewData.mailInvite.token + '" target="_blank">' + rtw.pageSettings.rootWebsiteLink + '/invite/register/' + thisNewData.mailInvite.token + '</a>'
                        }
                        //# send mail to new user
                    rtw.sendMail(mailOptions, function(error, response) {
                        if (error) {
                            console.log(error);
                        }
                        req.flash('inviteMessage', 'Email sent to ' + emailOne + '!');
                        res.redirect('/settings/invite');
                    });

                });
            }
        });
    } else {
        req.flash('errorInviteMessage', "The email adresses don't match");
    }
});

//##POST DELETE USER
router.post('/deleteUser', rtw.isLoggedIn, rtw.checkLevel([10]), function(req, res) {

    rtw.deleteUser({
        key: '_id',
        value: req.body.inputId
    }, function(err, user, result) {
        if (err) return handleError(err);
        res.redirect('/settings/invite');
    });

});

//##POST DELETE USER
router.post('/extendInvite', rtw.isLoggedIn, rtw.checkLevel([10]), function(req, res) {

    rtw.updateUserOne({
        key: "_id",
        value: req.body.inputId,
        change: {
            'mailInvite.release': String(Date.now())
        }
    }, function(err, user, result) {
        if (err) return handleError(err);
        res.redirect('/settings/invite');
    })

});

module.exports = router;
