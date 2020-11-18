const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
var Product = require('../models/product')
var Cart = require('../models/cart')
var Order = require('../models/order')
// var csrf = require('csurf')
// const csrfProtection = csrf();
// router.use(csrfProtection)

const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { session } = require('passport')

/* 首頁 */
router.get('/', (req, res, next) => {
    const token = req.flash('token')    /*****一定有更好的做法，暫時沒有顧慮到安全性*****/
    if (token.length > 0) {
        req.session.user = token 
    }
    if (req.session.userId) {
        console.log('使用者_id: ', req.session.userId)
        console.log('使用者 token: ', req.session.user)
    }
    Product.find(function(err, docs) {
        res.render('index', {title: "NodeJs", products: docs, isLogin: req.session.user})
    })
})

/* 登入功能 */
router.get('/user/login', (req, res, next) => {
    res.render('user/login', {})
})

router.post('/user/login', (req, res, next) => {
    console.log(req.body)
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(404).json({
                    message: '帳號不存在或密碼錯誤，認證失敗'
                })
            }
         bcrypt.compare(req.body.password, user[0].password, (err, result) => {        // 將資料庫找到的 user[0].password 跟 req.body.password 對比
            if (err) {
                return res.status(401).json({
                    message: '帳號不存在或密碼錯誤，認證失敗'
                })
             }
            if (result) {
                // JWT implement
                const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id
                    }, 
                    process.env.JWT_KEY, 
                    {
                        expiresIn: "12h"
                    }
                )
                req.flash('token', token)                /*****第一種做法，傳到flash，一定有更好的做法，暫時沒有顧慮到安全性*****/
                req.session.userId = user[0]._id    /*****第二種做法，直接存到session*****/
                if (req.session.oldUrl) {                    // 如果使用者是從別的頁面轉址過來的，登入成功轉回該頁面
                    let oldUrl = req.session.oldUrl
                    res.redirect(oldUrl)
                } else {
                    res.redirect('../')
                }
            }
         })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    })
})

/* 註冊功能 */
router.get('/user/signup', (req, res, next) => {
    var message = req.flash('info')[0]
    if (message) {
        var isError = message.length > 0
    }
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

router.get('/add-to-cart/:id', (req, res, next) => {
    var productId = req.params.id
    var cart = new Cart(req.session.cart ? req.session.cart : {} )   // new 購物車
    console.log(req.session.cart)
    Product.findById(productId, (err, product) => {
        if (err) {
            return res.status(500).json({
                message: '新增錯誤'
            })
        }
        cart.add(product, product.id)
        req.session.cart = cart                 // 將處理後的購物車設置給 req.session
        console.log(req.session.cart)
        res.redirect('/')
    })
})

router.get('/shop', function(req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null, isLogin: req.session.user})
    }
    var cart = new Cart(req.session.cart)
    res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice, isLogin: req.session.user})
})

router.get('/shop/checkout', isLoggedIn, (req, res, next) => {
    if (!req.session.cart) {
        return res.redirect('/shop')    // 注意，redirect是轉路由而不是render網址，因此若沒有session是轉到/shop的GET路由
    }
    var cart = new Cart(req.session.cart)
    res.render('shop/checkout', {total: cart.totalPrice})
})

router.post('/shop/checkout', (req, res, next) => {
    console.log(req.body)
    var cart = new Cart(req.session.cart)
    var order = new Order({
        user: req.session.userId,
        cart: cart,
        name: req.body.name,
        address: req.body.address
    })
    order.save(function(err, result) {
        req.flash('success', '訂單成立')
        req.session.cart = null
        res.redirect('/')
    })
})

router.get('/user/profile', isLoggedIn, (req, res, next) => {
    Order.find({
        user: req.session.userId
    }, function(err, result) {
        if (err) {
            res.send('錯誤')
        }
        result.forEach(function(order) {
            let cart = new Cart(order.cart)
            order.items = cart.generateArray()
        })
        res.render('user/profile', {orders: result})
    })
})

function isLoggedIn(req, res, next) {
  if (req.session.user && req.session.userId) {      // token & userId is exist
    console.log('isLoggedIn')
    return next()
  }
  req.session.oldUrl = req.url
  res.redirect('/user/login')
}

/* 刪除單一產品 by one */
router.get('/reduce/:id', (req, res, next) => {
    var productId = req.params.id
    console.log(productId)
    var cart = new Cart(req.session.cart ? req.session.cart : {})
    console.log(cart)
    cart.reduceByOne(productId)
    console.log(cart)
    req.session.cart = cart
    res.redirect('/shop')
})
  
  /* 刪除單一產品 all */
router.get('/remove/:id', (req, res, next) => {
    var productId = req.params.id
    console.log(productId)
    var cart = new Cart(req.session.cart ? req.session.cart : {} )
    cart.removeItem(productId)
    req.session.cart = cart
    res.redirect('/shop')
})

router.get('/user/logout', (req, res, next) => {
    req.session.user = null
    req.session.userId = null
    res.redirect('/')
})

module.exports = router