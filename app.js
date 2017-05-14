// app.js
global.__base = __dirname + '/';


// set up
var express = require('express'); //express server
var app = express();
var http = require('http').Server(app); //creates http server
var io = require('socket.io')(http); //adds socket to it

require('dotenv').config() //setup config with envoirement variables

var path = require('path'); //path, used for paths in server
global.appRoot = path.resolve(__dirname); //setup global approot to have the same path (eg. windows)

var realtime = require('./rtw/realtime'); //require own module
realtime.init(io); //start this module with io

var mongoose = require('mongoose'); //mongoose for mongodb manipulation
var port = process.env.PORT || 3000; //3000 setup port 3000 if there is nothing in process.env
var passport = require('passport'); //passport is used for different strategies, local, facebook, etc. it comes with nice features like req.user etc.
var flash = require('connect-flash'); //flash to display a flash message one time per request if is enabled
var bcrypt = require('bcrypt-nodejs'); //bcrypt, used to hash passwords

var rtw = require('./rtw'); //require own module
var cookieParser = require('cookie-parser'); //parse cookies from client
var bodyParser = require('body-parser'); //parse body (for froms etc.)
var session = require('express-session'); //express session, saves sessions for each active client
var multer = require('multer'); //used for manupulating files
var file = require('file-system'); //used for manupulating files
var fs = require('fs'); //used for manupulating files
var morgan = require('morgan'); //used to log every requrest
var nodemailer = require('nodemailer'); //used to mail

var configDB = require('./config/database.js'); //mongoose modal
var websiteSettingsDB = require('./models/generalSettings'); //mongoose modal

// routes
var profileRoutes = require('./routes/profile');
var settingsRoutes = require('./routes/settings');
var forgetRoutes = require('./routes/forget');
var inviteRoutes = require('./routes/invite');
var botRoutes = require('./routes/bot');
var slackConfigurationRoutes = require('./routes/slack_configuration');

// configuration
mongoose.connect(configDB.url); // connect to our database

//require password config
require('./config/passport')(passport); // pass passport for configuration

// uploaden
var upload = multer({ dest: 'public/uploads/' });
// puplic
app.use(express.static('public')); // to add CSS

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

// ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // set up ejs for templating

// session setup
app.use(session({
    secret: 'fun289r2H(*)&$H#*(89fgsdfds7j49r(*H&RF',
    saveUninitialized: true,
    key: 'fjo2uf389nr3u29e2y37',
    resave: false
}));

// console all connected sockets (just for the lolzzz)
io.sockets.on('connection', function(socket) {
    var sessionid = socket.id;
    console.log(sessionid)
});
//if you want to know you socket
app.use('/test', function(req, res) {
    res.send(req.session)
    console.log(req.session.socket)
});
//init passport
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
//init flash
app.use(flash()); // use connect-flash for flash messages stored in session

//setup routes
require('./routes/root.js')(app, passport);
app.use('/profile', profileRoutes);
app.use('/settings', settingsRoutes);
app.use('/forgetpassword', forgetRoutes);
app.use('/bot', botRoutes);
app.use('/invite', inviteRoutes);
app.use('/slack_configuration', slackConfigurationRoutes);

//#RESET SERVER VARIABLE AFTER RESTART
websiteSettingsDB.find({}).where('settings').exec(function(err, websiteSettings) {
    if (websiteSettings.length > 0) {
        rtw.pageSettings.userSignup = websiteSettings[0].userSettings.userSignup;
    }
});

//start http server on port env.port
http.listen(port);
console.log('App started on port: ' + port);

//how to fetch git on a production server
// http://stackoverflow.com/questions/1125968/how-do-i-force-git-pull-to-overwrite-local-files