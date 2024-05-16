
const mongoose = require('mongoose');

// Load environment variables from .env file
require('dotenv').config(); 

// MongoDB Connection String
const mongoURI = process.env.MONGODB_URL;
mongoose.connect(mongoURI);

// Schema for Users
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
});


// model from the schema
const User = mongoose.model('User', userSchema);

module.exports = {
	User,
};