const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Product = require('../models/product')

router.get('/', (req, res, next) => {       // 補充：如果沒有資料會回傳 []，而不是 null
    Product.find()
        .select('_id name price')              // 查詢特定欄位，以空白區隔
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                prodocts: docs.map(doc => {     // 可能會有數筆資料，故使用 map()
                    return {
                        id: doc._id,
                        name: doc.name,
                        price: doc.price,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            }
        res.status(200).json(response)  
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
})

router.post('/', (req, res, next) => {
    console.log(req.body.name)
    const product = new Product({                   // 輸入定義的 Schema 資料庫結構
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    })
    product.save()
        .then(result => {
            console.log(result)       // 顯示插入結果
            res.status(200).json({
                message: 'Create product successfully',
                createdProduct: {
                    _id: result._id,
                    name: result.name,
                    price: result.price,
                    request: {
                        type: 'POST',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            })
    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    });
})

router.get('/:productId', (req, res, next) => {     // 等同於 /product/id
    const id = req.params.productId
    Product.findById(id)
        .select("_id name price")
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products' + doc._id
                    }
                });      // 非同步，故這行放在then外面會直接被執行
            } else {
                res.status(404).json({
                    message: 'No valid entry found for provided id'
                })
            }
        }).catch(err => {
            console.log(err)
            res.status(500).json({ error: err })
        })
})

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId
    const updateOps = {}
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value             // Client 需要傳入陣列包著 JSON 格式，propName 為 Schema 定義的屬性名稱
    }
    Product.update({ _id: id }, { $set: updateOps })      // 第一個參數為 _id，第二個參數須更改的資料內容 (定義的屬性, value)
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'product Updated!',
                request: {
                    type: 'PATCH',
                    url: 'http://localhost:3000/products/' + result._id
                }
            })
        }).catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId
    Product.remove({ _id : id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product deleted!',
                request: {
                    type: 'DELETE',
                    url: 'http://localhost:3000/products',
                    data: { name: 'String', price: 'Number' }       // 附上使用者若要新增資料所需要的格式
                }
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router