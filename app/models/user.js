// ****** DATABASE VERSION – USER Model – Use this if you are using a database

// Module dependencies.
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


// User Schema
var UserSchema = new Schema({
	first_name: {
		type: String,
		trim: true
	},
	last_name: {
		type: String,
		trim: true
	},
	display_name: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true
	},
	username: {
		type: String,
		unique: true
	},
	servant_user_id: {
		type: String,
		unique: true
	},
	servant_access_token: {
		type: String,
		unique: true
	},
	servant_refresh_token: {
		type: String,
		unique: true
	},
	servant_client_token: {
		type: String,
		unique: true
	},
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('User', UserSchema);