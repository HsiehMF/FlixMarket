var passport = require('passport')
var User = require('../api/models/user')
var LocalStrategry = require('passport-local').Strategy

passport.serializeUser(function(user, done) {
    done(null, user.id)
})

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user)
    })
})

passport.use('local.signup', new LocalStrategry({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    User.findOne({'email': email, function(err, user) {
            console.log('yes')
            if (err) {
                return done(err)
            }
            if (user) {     // 如果有找到資料，表示已被註冊
                return done(null, false, {message: 'Email is already in use.'})
            }
            var newUser = new User()
            newUser.email = email
            newUser.password = newUser.encryptPassword(password)
            newUser.save(function(err, result) {
                if (err) {
                    return done(err) 
                } 
                return done(null, newUser)
            })
        }
    })
}))