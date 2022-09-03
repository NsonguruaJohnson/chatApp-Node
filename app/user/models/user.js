const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: ['true', 'Please input your first name.'],
    },
    lastName: {
        type: String,
        required: ['true', 'Please input your last name.'],
        
    },
    email: {
        type: String,
        required: ['true', 'Please input your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please input a valid email'],
    },
    userName: {
        type: String,
        required: ['true', 'Please create a username'],
        select: false,
    },
    photo: {
        type: String,
    },
    password: {
        type: String,
        required: ['true', 'Please provide a password'],
        minlength: [8, 'Password must b at least 8 characters long'],
        // minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: ['true', 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'The password does not match',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    messages: [
        {
            message: {
                type: Schema.Types.ObjectId,
                ref: 'Chat',
            },
        }
    ]
}, {
    timestamps: true
});

UserSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next(); 
    
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete the passwordConfirmed field
    this.passwordConfirm = undefined;

    next();
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password') || this.isNew ) return next();

    this.passwordChangedAt = Date.now() - 1000; // make the password to be created before the JWT
    next();
});

UserSchema.methods.comparePassword = async function (inputPassword, dbPassword) {
    return await bcrypt.compare(inputPassword, dbPassword);
};

UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);

        // console.log(changedTimestamp, JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }

    // false means NOT changed
    return false;
}

const User = mongoose.model('User', UserSchema);

module.exports = User;