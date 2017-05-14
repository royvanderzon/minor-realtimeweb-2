// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local: {
        email: String, //email of user
        password: String, //password of user
        active: Boolean, //if user may login
        level: String, //level of user (role)
        activeSince: String //when did the user logged in first time
    },
    slack: {
        code: String,
        handshake: {
            access_token: String,
            scope: String,
            user_id: String,
            team_name: String,
            team_id: String
        }
    },
    command: [{
        iterator: Number,
        input: String,
        respond: String
    }],
    data: {
        firstName: String, //first name
        lastName: String, //last name
        slackUsername: String, //slack username
        birthDate: String, //birth date
        gender: String, //gender
        number: String, //telephone number
        adress: String, //adress
        city: String, //city
        country: String, //country
        zip: String, //zip
        profileImg: String //profile image
    },
    changePass: {
        token: String, //token link to reset password page
        release: Number //timestamp of when token is released
    },
    mailInvite: {
        active: String, //if user has registered email
        token: String, //token link to register user
        release: String //timestamp of when token is released
    }

});

///////////////////////////////////////////////////////////
//INIT ONE ADMIN USER
var initUserModal = mongoose.model('user', userSchema);
var initUser = new initUserModal({
    'local.email': 'royvanderzon@gmail.com',
    'local.password': bcrypt.hashSync('@dm1n', bcrypt.genSaltSync(8), null),
    'local.active': true,
    'local.level': 10,
    'data.firstName': 'Admin'
});

initUserModal.find({}).where('user').exec(function(err, result) {
    if (result) {
        console.log('# Users collection found');
    } else {
        console.log("# Can't find users collection found");
    }
});

initUserModal.find({}).where('settings').exec(function(err, initUserModal) {
    if (initUserModal.length < 1) {
        initUser.save(function(err) {
            if (err) return handleError(err);
            console.log('-Admin user init');
            console.log('->Username: admin@widesi-webdesign.nl');
            console.log('->Password: admin');
        })
    }
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
