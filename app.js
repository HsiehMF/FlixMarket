const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const morgan = require('morgan')
const mongoose = require('mongoose')
var session = require('express-session')
var flash = require('connect-flash')
const MongoStore = require('connect-mongo')(session)

app.use(session({
    secret: 'keyboard cat', 
    resave: true, 
    saveUninitialized: true,
    cookie: { maxAge: 180 * 60 * 1000 },	// 3h
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  }))
app.use(flash());

require("dotenv").config();

const productRoutes = require('./api/routes/products')
const indexRoutes = require('./api/routes/index')

app.use(morgan('dev'))

mongoose.connect('mongodb://localhost:27017/shopping', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use('/public', express.static('./public'))
app.use('/node_modules', express.static('./node_modules'))

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

// make sure access session in all template, routes
app.use(function(req, res, next) {
    res.locals.session = req.session
    next()
})

// Routes which should handle request
app.use('/', indexRoutes)
app.use('/products', productRoutes)

// 沒有其他路由可以處理的請求，到這裡處理
app.use((req, res, next) => {
    const error = new Error(' 404 Not found')    // 最後路由接受到的訊息
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