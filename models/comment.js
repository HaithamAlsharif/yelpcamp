var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
    text:String,
    author:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"  // the model that we are referring to
        },
        username: String,
    },
         // moment js
        createdAt: {
            type: Date,
            default: Date.now
        }
    
});

module.exports = mongoose.model("comment",commentSchema);