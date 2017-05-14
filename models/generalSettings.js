var mongoose = require('mongoose');
var path = require('path');
// var rtw = require(path.normalize(global.appRoot+'/rtw'))
var rtw = require('../rtw')

// console.log(__dirname)
// console.log(rtw.pageSettings)
// console.log(path.normalize(global.appRoot+'/rtw'))
// console.log(path.normalize(global.appRoot))

// console.log(rtw.pageSettings)

var generalSettingsSchema = mongoose.Schema({

	settingsActive	 : Boolean,
    userSettings     : {
        userSignup   : Boolean
    }
});

var settingsModal = mongoose.model('settings', generalSettingsSchema);

var initSettings = new settingsModal({ 
	'settingsActive'						: true,
	'userSettings.userSignup'				: true
});

settingsModal.find({}).where('settings').exec(function(err,settingsModal){
	if(settingsModal){
		console.log('# Settings collection found');
	}else{
		console.log("# Can't find settings collection found");
	}
	// console.log(settingsModal);
	//#INIT FUNCTION
	if(settingsModal.length < 1){
		initSettings.save(function (err) {
			if (err) return handleError(err);
				console.log('#//////////////////////////////////#');
				console.log('# WELCOME TO WIDESI PRE CMS SYSTEM #');
				console.log('#//////////////////////////////////#');
				console.log('-Settings init started');
		})
	}

});



module.exports = mongoose.model('settings', generalSettingsSchema);