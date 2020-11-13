const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
var Product = require('../models/product')
// var csrf = require('csurf')
// const csrfProtection = csrf();
// router.use(csrfProtection)

const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


router.get('/', (req, res, next) => {
    Product.find(function(err, docs) {
        res.render('index', {title: "NodeJs", products: docs})
    })
})

router.get('/user/signup', (req, res, next) => {
    var message = req.flash('info')[0]
    var isError = message.length > 0
    res.render('user/signup', {message: message, err: isError})
    // 授予使用者 csrfToken，設置一個隱藏的 input，若使用者輸入未經過 server 授權的 token 就會錯誤
    // token 由 server 產生，並且存在 server 的 session，故我們才需要安裝 express-session 套件
})
// {csrfToken: req.csrfToken()

router.post('/user/signup', (req, res, next) => {
    User.find({ email: req.body.email })
    .exec()
    .then(email => {
        if (email.length >= 1) {
            //  res.status(409).json({ 
            //     message: 'Mail existed!'        // 409 衝突, 422 請求未被處理
            //  })
            req.flash('info', 'Mail existed!')
            res.redirect('signup')
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {     // 第二個參數為 salt 的長度
                if (err) {  
                    return res.status(500).json({
                        error: err
                    })
                } else {
                    const user = new User({
                            _id: new mongoose.Types.ObjectId,
                            email: req.body.email,
                            password: hash      // 經過 bcrypt hash 過的密碼
                        })
                        user.save()
                            .then(result => {
                                console.log(result)
                                res.status(200).json({
                                    message: 'User created!'
                                })
                                res.redirect('index')
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }
            })
        }
    })
    .catch(err => {
        return res.status(500).json({
            error: err
        })
    })
})

router.post('/', (req, res, next) => {
    res.render('index')
})

module.exports = router