var mongoose = require("mongoose");

var campgroundsSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    price: String,
    
    // Google Maps
    location: String,
    lat: Number,
    lng: Number,

    author:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User" // the model to be used
        },

        username: String
    },

    comments: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref:"comment"
        }
    ],

    // moment js
    createdAt: {
        type: Date,
        default: Date.now
    }
    
});


module.exports = mongoose.model("Campground", campgroundsSchema); // "CAMPGROUNDS" IS A DB CREATED NOW FROM THE SMART ASS MONGOOSE, this will allow us to find, creat .. etc