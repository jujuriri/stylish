// eslint no-unused-vars: ["error",{"vars": "local"}]

document.addEventListener("DOMContentLoaded", () => {

    toggleMutiple(document.querySelectorAll('.item'), "activeTab", "A");
    document.getElementById("loading").style.display = 'block';
});

// 單一產品頁網址
let prodURL = new URL(window.location);

// Connect Product Details API（試著用 async 和 await + Fetch）
async function kwsk() {
    const res = await fetch(`https://${host}/api/1.0/products/details${prodURL.search}`);
    return res.json();
}
kwsk()
    .then(json => {
        // Loading 圖
        document.getElementById("loading").style.display = 'none';
        document.getElementById("prod").style.display = 'flex';

        renderDetails(json);

        // 點擊變顏色、變框框
        toggleMutiple(document.querySelectorAll('.square'), 'colorSelect', 'DIV');
        toggleMutiple(document.querySelectorAll('.sml'), 'sizeSelect', 'DIV');

        // 顏色、尺寸、數量 UI
        orderHelper(json.data);
    })
    .catch(err => {
        console.log(err);
    });

// 選擇顏色尺寸，告訴顧客有無庫存
function orderHelper(data) {

    let variants = data.variants;

    // 如果購物車有東西，先扣掉購物車數量
    variants.forEach(variant => {
        if (list.length > 0) {
            list.forEach(goods => {
                if (goods.color.code === variant.color_code && goods.size === variant.size) {
                    variant.stock = parseInt(variant.stock) - parseInt(goods.qty);
                }
            });
        }
    });
    
    // 把客人選的顏色、顏色名、尺寸、數量、庫存，存成一個物件（初始是 0 或 ""）
    let order = { iro: '', iroName:'', size: '', amount: 0, userStock: 0};

    const squares = document.querySelectorAll('.square');
    const sizes = document.querySelectorAll('.sml');
    const minus = document.querySelector("#minus");
    const count = document.querySelector("#count");
    const plus = document.querySelector("#plus");
    const addToCart = document.querySelector("#addToCart");

    // 監聽顏色被按
    squares.forEach( square => {
        square.addEventListener("click", memoOrderIro);
    });
    // 顏色被按的 CallBack
    function memoOrderIro(e) {
        order.iroName = e.currentTarget.title;
        order.iro = e.currentTarget.getAttribute("data-color_code");
        variants.forEach( variant => {
            if (variant.color_code === order.iro && variant.size === order.size) {
                order.userStock = variant.stock;
                tellIfSoldOut(variant.stock, addToCart);
                count.value = 0;
            }
        });
    }

    // 監聽尺寸被按
    sizes.forEach( size => {
        size.addEventListener("click", memoOrderSize);
    });
    // 尺寸被按的 CallBack
    function memoOrderSize(e) {
        order.size = e.currentTarget.innerText;
        variants.forEach( variant => {
            if (variant.color_code === order.iro && variant.size === order.size) {
                order.userStock = variant.stock;
                tellIfSoldOut(variant.stock, addToCart);
                count.value = 0;
            }
        });
    }

    // 監聽減號被按
    minus.addEventListener("click", () => {
        if (count.value <= order.userStock && count.value > 0) {
            addToCart.textContent = "加入購物車";
            count.value --;
        }
    });
    
    // 監聽加號被按
    plus.addEventListener("click", () => {
        if (count.value === 0 || count.value < order.userStock) {
            addToCart.textContent = "加入購物車";
            addToCart.disabled = false;
            count.value ++;
        }
    });

    // 監聽「加入購物車」按鈕被按
    addToCart.addEventListener("click", () => {
        order.amount = count.value;

        if (order.iro === "" || order.size === "" || order.amount <= 0) {
            // 顧客沒有選好款式及數量，不給加購物車，然後叫他選。
            addToCart.disabled = true;
            addToCart.textContent = "請選擇款式及數量";
        
        } else if  (order.iro !== "" && order.size !== "" && order.amount > 0) {
            // 顧客很乖，給加購物車。
            addToCart.disabled = false;
            addToCart.textContent = "加入購物車";
            // 加入購物車同時，庫存減掉顧客欲買的數量
            variants.forEach( variant => {
                if (variant.color_code === order.iro && variant.size === order.size) {
                    variant.stock = parseInt(variant.stock) - parseInt(order.amount);
                    order.userStock = variant.stock;
                    tellIfSoldOut(variant.stock, addToCart);
                }
            });

            // 先看看 Local Storage 是否有加過同款的商品
            let alreadyExist = list.filter( (goods) => {
                // 檢查 id、顏色名、尺寸
                return goods.id === data.id && order.iroName === goods.color.name && order.size === goods.size;
            }).length;

            // 如果 filter 出來的陣列長度非 0，代表有重複的品項
            if(alreadyExist > 0) {
                // 有重複，跟舊資料合併，因為 Local Storage 裡是字串，所以要把他拿出來變物件，
                // 找到到底是哪個重複，然後加要新增的數量，再變回字串放回去。
                list = JSON.parse(localStorage.getItem('list'));
                list.forEach(goods => {
                    if(order.iroName === goods.color.name && order.size === goods.size && goods.id === data.id) { 
                        console.log("購物車舊數量：",  goods.qty, "要新增的數量：", order.amount);
                        goods.qty = parseInt(goods.qty) + parseInt(order.amount);
                    }
                });
                console.log("合併後List", list);
                localStorage.setItem("list", JSON.stringify(list));
            } else {
                // 沒重複的話，就在 Local Storage 新增一筆
                let newOrder = {
                    id: data.id,
                    name: data.title, 
                    price: data.price,
                    color: {
                        name: order.iroName,
                        code: order.iro
                    },
                    size: order.size,
                    qty: order.amount,
                    mainImg: data.main_image,
                    confirm: data.id + order.iro + order.size
                };
                list.push(newOrder);
                console.log("有新一筆的List", list);
                localStorage.setItem("list", JSON.stringify(list));
            }
            order.amount = count.value = 0;
            alert('成功加入購物車!'); // eslint-disable-line no-alert
        }
        countGoods();
    });
}

const tellIfSoldOut = (num, btn) => {
    const restStock = document.querySelector('#restStock');
    if (num <= 0) {
      btn.disabled = true;
      btn.innerText = "缺貨中";
      btn.classList.add("failToCart");
      num = 0;
      restStock.textContent = "剩餘 " + num + " 件";
      restStock.style.opacity = "1";
    } else {
      btn.disabled = false;
      btn.innerText = "加入購物車";
      btn.classList.remove("failToCart");
      restStock.textContent = "剩餘 " + num + " 件";
      restStock.style.opacity = "1";
    }
};