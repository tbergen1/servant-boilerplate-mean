// Module dependencies.
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// User Schema
var UserSchema = new Schema({
	full_name: {
		type: String,
		trim: true
	},
	nick_name: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true
	},
	servant_user_id: {
		type: String,
		unique: true
	},
	servant_access_token: {
		type: String
	},
	servant_access_token_limited: {
		type: String
	},
	servant_refresh_token: {
		type: String
	},
	phone_numbers: {
		type: Schema.Types.Mixed,
		default: []
	},
	plan: {
		type: String,
		default: 'free'
	},
	stripe_customer_id: {
        type: String,
        trim: true
    },
    stripe_subscription_id: {
        type: String,
        trim: true
    },
    stripe_card_last4: {
        type: String,
        trim: true
    },
    stripe_card_brand: {
        type: String,
        trim: true
    },
    payment_status: {
        type: String,
        default: 'none' // Enum: none, valid, card_error
    },
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	last_signed_in: {
		type: Date
	}
});

mongoose.model('User', UserSchema);