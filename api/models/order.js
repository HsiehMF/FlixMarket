const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/shopping', {useNewUrlParser: true, useUnifiedTopology: true});

var Schema = mongoose.Schema
var schema = new Schema({
    user: {
        type: Schema.Types.ObjectId, ref: 'User',
    },
    cart: {
        type: Object,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Order', schema)