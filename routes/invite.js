var express = require('express');
var bcrypt   = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var multer = require('multer');
var path = require('path');
var rtw = require('../rtw');
var router = express.Router();
 
    router.get('/register/:id', rtw.isAlreadyLoggedIn, function(req,res){

        var message = '';
        //search for user with this token
        rtw.searchUser({
            key:'mailInvite.token',
            value:String(req.params.id)
        },function(err,user,result){
            console.log(user);
            console.log('////////////////');
            console.log(result);

            var validatedLink = false;
            //see if the link exists
            if(result.length > 0){
                // console.log(((Number(result[0].changePartw.release) + differenceSeconds) - Date.now())/1000);
                var differenceSeconds = rtw.pageSettings.inviteUserBuffer * 60 * 60 * 1000;
                //check if the reset request is older than now + x hours
                if(((Number(result[0].mailInvite.release) + differenceSeconds) > Date.now()) ){
                    validatedLink = true;
                }else{
                    validatedLink = false;
                    message = "It looks like you have waited to long. Your links expires within "+rtw.pageSettings.inviteUserBuffer+" hours!";
                }
            }else{
                message = "We're very sorry, but your recover link doesn't exists..";
            }
            // res.redirect('ok');
            res.render('auth/invite', {
                page: {
                    title: 'Signup Invite',
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

    router.post('/changepass/:id', rtw.isAlreadyLoggedIn, function(req,res){
        var pas1 = (String(req.body.passwordOne).replace(/[\\"'/]/g, ""));
        var pas2 = (String(req.body.passwordTwo).replace(/("|')/g, ""));
        console.log(pas1);
        console.log(pas2);

        // res.redirect('/invite/changepass/'+req.params.id);
        if(pas1 == pas2){
            rtw.searchUser({
                key:'mailInvite.token',
                value:String(req.params.id)
            },function(err,user,result){
                var differenceSeconds = rtw.pageSettings.inviteUserBuffer * 60 * 60 * 1000;
                if(((Number(result[0].mailInvite.release) + differenceSeconds) > Date.now()) ){
                    rtw.updateUserOne({
                        key: "mailInvite.token",
                        value: String(req.params.id),
                        change: {
                            'local.password':bcrypt.hashSync(pas1, bcrypt.genSaltSync(8), null),
                            'mailInvite.token': 'false',
                            'mailInvite.release' : 'false',
                            'mailInvite.active' : 'true',
                            'local.activeSince': Date.now()
                        }
                    },function(err, user, result){
                        req.flash('messageLoginSuccess','You can now login!');
                        res.redirect('/login');
                    })
                }else{
                    console.log('Someone has hacked us.. Expired link in rootRoutes.js at //invite/changepas:id');
                    res.redirect('/invite/changepas/'+req.params.id+'#weknowuarehackingus');
                }
            });
        }else{
            req.flash('resetErrorMessage',"The passwords don't match");
            res.redirect('/forgetpassword/link/'+req.params.id);
        }
    })
module.exports = router;