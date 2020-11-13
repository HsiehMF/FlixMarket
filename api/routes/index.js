const express = require('express')
const router = express.Router()
var Product = require('../models/product')
var csrf = require('csurf')
const csrfProtection = csrf();
router.use(csrfProtection)

router.get('/', (req, res, next) => {
    Product.find(function(err, docs) {
        res.render('index', {title: "NodeJs", products: docs})
    })
})

router.get('/user/signup', (req, res, next) => {
    res.render('user/signup', {csrfToken: req.csrfToken()})     
    // 授予使用者 csrfToken，設置一個隱藏的 input，若使用者輸入未經過 server 授權的 token 就會錯誤
    // token 由 server 產生，並且存在 server 的 session，故我們才需要安裝 express-session 套件
})

router.post('/user/signup', (req, res, next) => {
    // res.status(200).json({
    //     email: req.body.email,
    //     password: req.body.password
    // })
    console.log(req.body)
    res.redirect('/')
})

router.post('/', (req, res, next) => {
    res.render('index')
})

module.exports = router