var express = require('express');
var mongoose = require('mongoose');
var multer = require('multer');
var path = require('path');
var rtw = require('../rtw');

var router = express.Router();

router.get('/', rtw.isLoggedIn, function(req, res) {

    var firstName = req.user.data.firstName;
    var lastName = req.user.data.lastName;
    if (String(firstName) == '' || String(lastName) == '' || firstName == null || firstName === undefined || firstName === null || lastName == null || lastName === undefined || lastName === null) {
        req.flash('fillInFormMessage', 'First we have to fill in some of our personal things!');
        res.redirect('/profile/edit');
    } else {
        res.render('profile/index.ejs', {
            page: {
                title: 'Profile',
                pageSettings: rtw.pageSettings,
                nav: rtw.createNav(req, res)
            },
            user: req.user,
            flashMessage: req.flash('flashMessage')
        });
    }
});

router.get('/edit', rtw.isLoggedIn, function(req, res) {
    res.render('profile/edit.ejs', {
        page: {
            title: 'Edit Profile',
            pageSettings: rtw.pageSettings,
            nav: rtw.createNav(req, res)
        },
        user: req.user,
        message: req.flash('fillInFormMessage'),
        succesMessage: req.flash('editSuccesMessage'),
        flashMessage: req.flash('flashMessage')
    });
});

var upload = multer({ storage: rtw.storage, limits: { fileSize: 3145728 } }).array('upl', 1);

router.post('/edit', rtw.isLoggedIn, function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            console.log(err);
            return res.send("Error uploading file.");
        }
        if (req.files.length > 0) {
            var changeObj = {
                'data.slackUsername': (req.body.slackUsername || ''),
                'data.firstName': (req.body.firstName || ''),
                'data.lastName': (req.body.lastName || ''),
                'data.birthDate': (req.body.birthDate || ''),
                'data.gender': (req.body.gender || ''),
                'data.country': (req.body.country || ''),
                'data.city': (req.body.city || ''),
                'data.number': (req.body.number || ''),
                'data.adress': (req.body.adress || ''),
                'data.zip': (req.body.zip || ''),
                'data.profileImg': req.files[0].filename
            };
        } else {
            var changeObj = {
                'data.slackUsername': (req.body.slackUsername || ''),
                'data.firstName': (req.body.firstName || ''),
                'data.lastName': (req.body.lastName || ''),
                'data.birthDate': (req.body.birthDate || ''),
                'data.gender': (req.body.gender || ''),
                'data.country': (req.body.country || ''),
                'data.city': (req.body.city || ''),
                'data.number': (req.body.number || ''),
                'data.adress': (req.body.adress || ''),
                'data.zip': (req.body.zip || '')
            };
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
                // console.log('done');
                // console.log(user);
                // console.log(result);
                res.redirect('/profile/edit');
            }
        })
    });
});

router.post('/edit/changePassword', rtw.isLoggedIn, function(req, res) {

    rtw.searchUser({
        key: 'local.email',
        value: req.user.local.email
    }, function(err, user, result) {
        console.log(result);
        if (result.length < 1) {
            req.flash('editSuccesMessage', false);
            req.flash('fillInFormMessage', "Sorry, we can't find a matching email");
            res.redirect('/profile/edit');
        } else {
            req.flash('fillInFormMessage', false);
            req.flash('editSuccesMessage', 'We send a mail to ' + req.user.local.email + ' to reset your password!');
            var thisUser = result[0];
            var dateNow = Date.now();
            var newLink = String(dateNow) + String(thisUser._id) + '-' + Math.floor(Math.random() * 10000000);
            rtw.updateUserOne({
                key: "_id",
                value: thisUser._id,
                change: {
                    // 'changeParss.token': 'sdfsdfsdfsdfsdf',
                    'changePass.token': newLink,
                    'changePass.release': Number(dateNow)
                }
            }, function(err, user, result) {
                var mailOptions = {
                    from: 'Social Scout Agency',
                    to: thisUser.local.email,
                    subject: 'Dear ' + thisUser.data.firstName + ', change your password!',
                    text: 'Click here to reset your password: ' + rtw.pageSettings.rootWebsiteLink,
                    html: '<h2>Do you want to change your password?</h2><p>Click the link to reset your password:</p><a href="' + rtw.pageSettings.rootWebsiteLink + '/forgetpassword/link/' + newLink + '" target="_blank">' + rtw.pageSettings.rootWebsiteLink + '/forgetpassword/link/' + newLink + '</a>'
                }

                rtw.sendMail(mailOptions, function(error, response) {
                    if (error) {
                        console.log(error);
                    } else {
                        res.redirect('/profile/edit');
                    }
                });
            })
        }
    });
    // req.flash('editSuccesMessage','We send a mail to '+req.user.local.email+' to reset your password!');
    // res.redirect('/profile/edit');
});

module.exports = router;
