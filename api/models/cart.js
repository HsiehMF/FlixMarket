module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {}                    // 舊的 cart
    this.totalQty = oldCart.totalQty || 0         // 舊的商品總數
    this.totalPrice = oldCart.totalPrice || 0    // 舊的商品總價
    
    // 不能全部推，如果是同產品要列在一起，傳入 mongoose 找到的產品結果及其 id
    this.add = function(item, id) {
        var storedItem = this.items[id]     // 以產品 _id 當作 items 物件的屬性
        if (!storedItem) {
            storedItem = this.items[id] = { item: item, qty: 0, price: 0 }      // 若沒有值，做初始化
        }
        /* 新增商品 */
        storedItem.qty++                                                                                   // 1. 數量 ++
        storedItem.price = storedItem.item.price * storedItem.qty       // 2. 單價 * 數量
        this.totalQty++                                                                                        // 3. 舊的商品總數 ++ ，以作為下次參考
        this.totalPrice += storedItem.item.price                                          // 4. 舊的商品總價 += 新增產品的單價，以作為下次參考
    }

    this.generateArray = function() {     // 資料處理
        var arr = []
        for (let id in this.items) {
            arr.push(this.items[id])
        }
        return arr
    }
}

/* 參考範例 */
// Cart {
//     items: {
//       '5fad468a0c4c5d868d658ade': { item: [Object], qty: 1, price: 109 },
//       '5fad468a0c4c5d868d658ae0': { item: [Object], qty: 1, price: 99 },
//       '5fad468a0c4c5d868d658adf': { item: [Object], qty: 1, price: 49 },
//       '5fad6913c73eca789b772219': { item: [Object], qty: 1, price: 79 }
//     },
//     totalQty: 4,
//     totalPrice: 276,
//     add: [Function (anonymous)],
//     generateArray: [Function (anonymous)]
// }