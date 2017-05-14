var rtw = require('../rtw');

module.exports = function(app, passport) {
    app.get('/', function(req, res) {
        res.render('home/index', {
            page: {
                title: 'Home',
                pageSettings: rtw.pageSettings,
                nav: rtw.createNav(req, res)
            },
            flashMessage: req.flash('flashMessage')
        });
    });

    app.get('/notAvailable', function(req, res) {
        res.render('home/notAvailable', {
            page: {
                title: 'Not Available',
                pageSettings: rtw.pageSettings,
                nav: rtw.createNav(req, res)
            },
            flashMessage: req.flash('flashMessage')
        });
    });

    app.get('/login', rtw.isAlreadyLoggedIn, function(req, res) {

        res.render('auth/login', {
            page: {
                title: 'Login',
                pageSettings: rtw.pageSettings,
                nav: rtw.createNav(req, res)
            },
            message: req.flash('loginMessage'),
            messageLoginSuccess: req.flash('messageLoginSuccess'),
            flashMessage: req.flash('flashMessage')
        });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/signup', rtw.isAlreadyLoggedIn, function(req, res) {
        if (rtw.pageSettings.userSignup) {
            res.render('auth/signup', {
                page: {
                    title: 'Signup',
                    pageSettings: rtw.pageSettings,
                    nav: rtw.createNav(req, res)
                },
                message: req.flash('signupMessage'),
                flashMessage: req.flash('flashMessage')
            });
        } else {
            res.redirect('/notAvailable');
        }
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};
