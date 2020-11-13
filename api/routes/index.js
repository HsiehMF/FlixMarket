const express = require('express')
const router = express.Router()
var csrf = require('csurf');
const passport = require('passport');

var Product = require('../models/product')
const csrfProtection = csrf();
router.use(csrfProtection)

router.get('/', (req, res, next) => {
    Product.find(function(err, docs) {
        res.render('index', {title: "NodeJs", products: docs})
    })
})

router.get('/user/signup', (req, res, next) => {
    var message = req.flash('error')
    res.render('user/signup', {csrfToken: req.csrfToken(), message: message, hasErrors: message.length > 0})     
    // 授予使用者 csrfToken，設置一個隱藏的 input，若使用者輸入未經過 server 授權的 token 就會錯誤
    // token 由 server 產生，並且存在 server 的 session，故我們才需要安裝 express-session 套件
})

// router.post('/user/signup', (req, res, next) => {
//     // res.status(200).json({
//     //     email: req.body.email,
//     //     password: req.body.password
//     // })
//     console.log(req.body)
//     res.redirect('/')
// })

router.post('/user/signup', passport.authenticate('local.signup', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signup',
    failureFlash: true
}))


router.get('/user/profile', function(req, res, next) {
    res.render('user/profile')
})

router.post('/', (req, res, next) => {
    res.render('index')
})

module.exports = router