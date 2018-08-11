// load the things we need
const mongoose = require('mongoose');


// define the schema for our comment model
let commentSchema = mongoose.Schema({

    authorId          : String,
    imageName         : String,
    content           : String

});


// create the model for users and expose it to our app
module.exports = mongoose.model('CommentModel', commentSchema);