var mongoose = require("mongoose");

// Schema setup do moongose
var animalSchema = new mongoose.Schema ({
    name: String,
    image: String,
    imageId: String,
    description: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    author: {
        id: {type: mongoose.Schema.Types.ObjectId,
        ref: "User"
        },
    username: String  
    },
    price: String,
    createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model("Animal", animalSchema);