const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const morgan = require('morgan')
const mongoose = require('mongoose')
var session = require('express-session')
var passport = require('passport')
var flash = require('connect-flash')

const productRoutes = require('./api/routes/products')
const indexRoutes = require('./api/routes/index')

app.use(morgan('dev'))

mongoose.connect('mongodb://localhost:27017/shopping', {useNewUrlParser: true, useUnifiedTopology: true});


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(session({ secret: 'mysupersecret', resave: false, saveUninitialized: false }))

app.use(flash())
require('./config/passport')
app.use(passport.initialize())
app.use(passport.session())
app.use('/public', express.static('./public'))
app.use('/node_modules', express.static('./node_modules'))

// 不用引用 art-template，但是必須安裝相關模組：art-template、express-art-template
app.engine('html', require('express-art-template'))
app.set('view engine', 'html');

mongoose.Promise = global.Promise   // Remove warning message

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');		// 第二個參數為限制訪問的範圍
    res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
    }
    next();
});

// Routes which should handle request
app.use('/', indexRoutes)
app.use('/products', productRoutes)

// 沒有其他路由可以處理的請求，到這裡處理
app.use((req, res, next) => {
    const error = new Error('Not found')    // 最後路由接受到的訊息
    error.status = 404
    next(error)
})

// 第一個參數為錯誤，拋出的錯誤會到這個路由
app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message      // 你想告訴使用者的訊息
        }
    })
})

module.exports = app