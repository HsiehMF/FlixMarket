const mongoose = require('mongoose')
const passport = require('passport')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt-nodejs')

var userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

userSchema.methods.encrpytPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.getSaltSync(5), null)
}

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password)      // password is match this.password?
}

module.exports = mongoose.model('User', userSchema)