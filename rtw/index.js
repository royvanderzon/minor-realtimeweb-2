var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var multer = require('multer');
var path = require('path');
var nodemailer = require('nodemailer');
var User = require('../models/user.js');
var websiteSettings = require('../models/generalSettings');
var menus = require('./components/menus');

var rtw = {
    pageSettings: {
        //app name
        appName: 'RTW',
        //root website link
        rootWebsiteLink: process.env.WEB_HOST,
        //buffer between reset password and mail in hours
        resetPasswordBufferInSeconds: 2,
        //signup for everyoneee
        userSignup: true,
        //buffer between invite in hours
        inviteUserBuffer: 24,
        env: {
            SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
            SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
            SLACK_APP_NAME: process.env.SLACK_APP_NAME,
            WEB_HOST: process.env.WEB_HOST,
            MONGODB: process.env.MONGODB
        }
    },
    env: {},
    bots: [],
    serverSettings: {},
    dateNow: function() {
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " - " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
        return datetime
    },
    //function to check if user is authenticated
    isLoggedIn: function(req, res, next) {
        // if user is authenticated in the session, carry on 
        if (req.isAuthenticated()) {
            return next();
        } else {
            // if they aren't redirect them to the home page
            res.redirect('/login');
        }
    },
    isAlreadyLoggedIn: function(req, res, next) {
        // if user is authenticated no use to visit this page
        if (req.isAuthenticated()) {
            res.redirect('/profile');
        } else {
            // if they aren't, the may continu
            return next();
        }
    },
    checkLevel: function(allowedLevels) {
        return function(req, res, next) {
            // console.log(req.user.local.level);

            var noAuth = true;
            for (var i = 0; i < allowedLevels.length; i++) {
                if (req.user.local.level == String(allowedLevels[i])) {
                    noAuth = false;
                    next();
                }
            }
            if (noAuth) {
                res.redirect('/');
            }
        }
    },
    //function to create menu
    createNav: function(req, res) {

        var thisUser = {
            local: {
                level: 1
            }
        }

        if (req.user) {
            thisUser = req.user;
        }

        var menu = [];
        switch (Number(thisUser.local.level)) {
            case 2:
                menu = menu.concat(menus.menu_default);
                menu = menu.concat(menus.menu_user);
                menu = menu.concat(menus.logout);
                break;
            case 10:
                menu = menu.concat(menus.menu_default);
                menu = menu.concat(menus.menu_user);
                menu = menu.concat(menus.menu_admin);
                menu = menu.concat(menus.logout);
                break;
            default:
                menu = menu.concat(menus.menu_default);
                menu = menu.concat(menus.menu_login);
        }
        return menu;
    },
    searchUser: function(user, cb) {
        var search = {};
        search[user.key] = [user.value];
        if (user !== null && typeof user === 'object') {
            User.find(search, function(err, result) {
                // User.find({[user.key]:[user.value]}, function (err, result) {
                // if (err) return handleError(err);
                if (err) {
                    console.log(err);
                    return false;
                }
                if (typeof cb === "function") {
                    cb(err, user, result);
                }
            });
        } else {
            User.find({}, function(err, result) {
                // if (err) return handleError(err);
                if (err) {
                    console.log(err);
                    return false;
                }
                var user = false;
                if (typeof cb === "function") {
                    cb(err, user, result);
                }
            });
        }
    },
    getUsers: function(cb) {
        User.find({}, function(err, result) {
            // if (err) return handleError(err);
            if (err) {
                console.log(err);
                return false;
            }
            if (typeof cb === "function") {
                cb(err, result);
            }
        });
    },
    updateUserOne: function(user, cb) {
        var search = {};
        search[user.key] = [user.value];
        User.update(search, { $set: user.change }, function(err, result) {
            // if (err) return handleError(err);
            if (err) {
                console.log(err);
                return false;
            }
            if (typeof cb === "function") {
                cb(err, user, result);
            }
        });
    },
    deleteUser: function(user, cb) {
        // console.log(typeof cb);
        var search = {};
        search[user.key] = [user.value];
        User.remove(search, function(err, result) {
            // if (err) return handleError(err);
            if (err) {
                console.log(err);
                return false;
            }
            if (typeof cb === "function") {
                cb(err, user, result);
            }
        });
    },
    findSetting: function(setting, cb) {
        var search = {};
        search[setting.key] = [setting.value];
        if (setting !== null && typeof setting === 'object') {
            websiteSettings.findOne(search, function(err, result) {
                // if (err) return handleError(err);
                if (err) {
                    console.log(err);
                    return false;
                }
                if (typeof cb === "function") {
                    cb(err, setting, result);
                }
            });
        } else {
            websiteSettings.findOne({}, function(err, result) {
                // if (err) return handleError(err);
                if (err) {
                    console.log(err);
                    return false;
                }
                var setting = false;
                if (typeof cb === "function") {
                    cb(err, setting, result);
                }
            });
        }
    },
    updateSetting: function(setting, cb) {
        // console.log(typeof cb);

        var updateSettingObj = {};
        updateSettingObj[setting.key] = setting.value;

        websiteSettings.findOne({}, function(err, result) {
            console.log(err);
            // console.log(result);
            // if (err) return handleError(err);
            if (err) {
                console.log(err);
                return false;
            }
            websiteSettings.update({ '_id': result._id }, { $set: updateSettingObj }, function(err, result) {
                // if (err) return handleError(err);
                if (err) {
                    console.log(err);
                    return false;
                }
                // console.log(result);
                if (typeof cb === "function") {
                    cb(err, setting, result);
                }
            });
        })
    },
    storage: multer.diskStorage({
        destination: function(req, file, callback) {
            callback(null, './public/uploads');
        },
        filename: function(req, file, callback) {
            var tempType = String(file.mimetype).split("/");
            var newType = tempType[tempType.length - 1];
            callback(null, file.fieldname + '-' + Date.now() + '.' + newType);
        }
    }),
    sendMail: function(mailOptions, cb) {
        var smtpTransport = nodemailer.createTransport("SMTP", {
            service: "Gmail",
            auth: {
                user: "socialscoutagency@gmail.com",
                pass: "Krokodil3!"
            }
        });
        smtpTransport.sendMail(mailOptions, function(error, response) {
            // if (error) return handleError(error
            if (error) {
                console.log(error);
                return false;
            };
            if (typeof cb === "function") {
                cb(error, response);
            }
        });
    },
    newInviteUser: function(newUserData, cb) {

        var newUser = new User();
        var thisNewData = newUserData;
        // set the user's local credentials
        newUser.local.email = newUserData.local.email;
        newUser.local.password = newUser.generateHash(String(newUserData.local.password));
        newUser.local.level = String(newUserData.local.level);
        newUser.local.activeSince = String(Date.now());
        newUser.data.firstName = '';
        newUser.mailInvite.active = newUserData.mailInvite.active;
        newUser.mailInvite.token = newUserData.mailInvite.token;
        newUser.mailInvite.release = newUserData.mailInvite.release;

        // save the user
        newUser.save(function(err) {
            if (err)
                throw err;

            if (typeof cb === "function") {
                cb(thisNewData);
            }
        });
    },
    compareArrays: function(a, b) {

        var onlyInA = a.filter(function(current) {
            return b.filter(function(current_b) {
                return current_b.username == current.username
            }).length == 0
        });

        var onlyInB = b.filter(function(current) {
            return a.filter(function(current_a) {
                return current_a.username == current.username
            }).length == 0
        });

        var result = onlyInA.concat(onlyInB);
        var result = {
            onlyInA: onlyInA,
            onlyInB: onlyInB
        }

        return result;
    }
}

module.exports = rtw;
