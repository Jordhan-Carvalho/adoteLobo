var mongoose = require("mongoose");

// Schema setup do moongose
var animalSchema = new mongoose.Schema ({
    name: String,
    image: String,
    imageId: String,
    image2: String,
    image3: String,
    description: String,
    sex: String,
    type: String,
    age: String,
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
    contact: { tel:String,
        email:String,
        zap: String
        },
    createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model("Animal", animalSchema);