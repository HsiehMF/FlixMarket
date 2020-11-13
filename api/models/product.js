const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/shopping', {useNewUrlParser: true, useUnifiedTopology: true});

var Schema = mongoose.Schema
var schema = new Schema({
    imagePath: {
        type: String,
        required: true
    },
    title: {  
        type: String, 
        required: true  
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Product', schema)