var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var multer = require('multer');
var path = require('path');
var rtw = require('../rtw');
var router = express.Router();

router.get('/', rtw.isAlreadyLoggedIn, function(req, res) {
    res.render('auth/forgetpassword', {
        page: {
            title: 'Forget Password',
            pageSettings: rtw.pageSettings,
            nav: rtw.createNav(req, res)
        },
        messageNotFound: req.flash('emailNotFoundMessage'),
        messageFound: req.flash('emailFoundMessage'),
        flashMessage: req.flash('flashMessage')
    });
})

router.post('/', rtw.isAlreadyLoggedIn, function(req, res) {

    rtw.searchUser({
        key: 'local.email',
        value: req.body.email
    }, function(err, user, result) {
        if (result.length < 1) {
            req.flash('emailFoundMessage', false);
            req.flash('emailNotFoundMessage', "Sorry, we can't find a matching email");
            res.redirect('/forgetpassword');
        } else {
            req.flash('emailNotFoundMessage', false);
            req.flash('emailFoundMessage', "We have send you a mail to recover your password!");
            var thisUser = result[0];
            var dateNow = Date.now();
            var newLink = String(dateNow) + String(thisUser._id) + '-' + Math.floor(Math.random() * 10000000);
            rtw.updateUserOne({
                key: "_id",
                value: thisUser._id,
                change: {
                    // 'changePass.token': 'sdfsdfsdfsdfsdf',
                    'changePass.token': newLink,
                    'changePass.release': Number(dateNow)
                }
            }, function(err, user, result) {
                var mailOptions = {
                    from: 'Social Scout Agency',
                    to: thisUser.local.email,
                    subject: 'Dear ' + thisUser.data.firstName + ', you forgot your password!',
                    text: 'Click here to reset your password: ' + rtw.pageSettings.rootWebsiteLink,
                    html: '<h2>Did you forget your password?</h2><p>Click the link to reset your password:</p><a href="' + rtw.pageSettings.rootWebsiteLink + '/forgetpassword/link/' + newLink + '" target="_blank">' + rtw.pageSettings.rootWebsiteLink + '/forgetpassword/link/' + newLink + '</a>'
                }

                rtw.sendMail(mailOptions, function(error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                        res.redirect('/forgetpassword');
                    }
                });
            })
        }
    });

});

router.post('/reset/:id', function(req, res) {
    var pas1 = (String(req.body.passwordOne).replace(/[\\"'/]/g, ""));
    var pas2 = (String(req.body.passwordTwo).replace(/("|')/g, ""));
    if (pas1 == pas2) {
        rtw.searchUser({
            key: 'changePass.token',
            value: String(req.params.id)
        }, function(err, user, result) {
            var differenceSeconds = rtw.pageSettings.resetPasswordBufferInSeconds * 60 * 60 * 1000;
            if (((Number(result[0].changePass.release) + differenceSeconds) > Date.now())) {
                rtw.updateUserOne({
                    key: "changePass.token",
                    value: String(req.params.id),
                    change: {
                        'local.password': bcrypt.hashSync(pas1, bcrypt.genSaltSync(8), null),
                        'changePass.token': 'undefined',
                        'changePass.release': 0
                    }
                }, function(err, user, result) {
                    req.flash('messageLoginSuccess', 'You can now login!');
                    res.redirect('/login');
                })
            } else {
                console.log('Someone has hacked us.. Expired link in rootRoutes.js at //forgetpassword/reset:id');
                res.redirect('/forgetpassword/link/' + req.params.id + '#weknowuarehackingus');
            }
        });
    } else {
        req.flash('resetErrorMessage', "The passwords don't match");
        res.redirect('/forgetpassword/link/' + req.params.id);
    }
})

// router.get('/link/:id', rtw.isAlreadyLoggedIn, function(req,res){
router.get('/link/:id', function(req, res) {

    var message = '';
    //search for user with this password link
    rtw.searchUser({
        key: 'changePass.token',
        value: String(req.params.id)
    }, function(err, user, result) {
        var validatedLink = false;
        //see if the link exists
        if (result.length > 0) {
            // console.log(((Number(result[0].changePass.release) + differenceSeconds) - Date.now())/1000);
            var differenceSeconds = rtw.pageSettings.resetPasswordBufferInSeconds * 60 * 60 * 1000;
            //check if the reset request is older than now + x hours
            if (((Number(result[0].changePass.release) + differenceSeconds) > Date.now())) {
                validatedLink = true;
            } else {
                validatedLink = false;
                message = "It looks like you have waited to long. Your links expires within " + rtw.pageSettings.resetPasswordBufferInSeconds + " hours!";
            }
        } else {
            message = "We're very sorry, but your recover link doesn't exists..";
        }
        res.render('auth/resetpassword', {
            page: {
                title: 'Reset password',
                pageSettings: rtw.pageSettings,
                nav: rtw.createNav(req, res)
            },
            validatedLink: validatedLink,
            message: message,
            errorMessage: req.flash('resetErrorMessage'),
            resetLink: req.params.id,
            flashMessage: req.flash('flashMessage')
        });
    });
});

module.exports = router;
