const consolidateCart = (cart) => {
  const itemCounts = countProducts(cart);
  const consolidatedCart = {};
  for (const item in itemCounts) {
    consolidatedCart[item] = {
      price: grabProperties(cart, item, "price"),
      clearance: grabProperties(cart, item, "clearance"),
      count: itemCounts[item]
    }
  }
  return consolidatedCart;
}

const grabProperties = (cart, itemName, property) => {
  const match = cart.find(item => {
    return Object.keys(item)[0] === itemName
  })
  return match[itemName][property]
}

const countProducts = (cart) => {
  const itemCounts = {}
  cart.forEach(item => {
    const itemName = Object.keys(item)[0]
    if (itemCounts[itemName] === undefined) {

      itemCounts[itemName] = 1
    } else {
      itemCounts[itemName] = itemCounts[itemName] + 1
    }
  })
  return itemCounts;
}


const applyCoupons = (cart, coupons) => {
  coupons.forEach(coupon => {
    const itemName = coupon.item
    const itemDetails = cart[itemName]
    if (itemDetails !== undefined) {
      if (itemDetails["count"] >= coupon.num) {
        cart[`${itemName} W/COUPON`] = {
          price: coupon.cost,
          clearance: itemDetails.clearance,
          count: cart[`${itemName} W/COUPON`] === undefined ? 1 : cart[`${itemName} W/COUPON`].count + 1
        };
        itemDetails["count"] = itemDetails["count"] - coupon.num
      }
    }
  })
  return cart
}

const applyClearance = (cart) => {
  for (const itemName in cart) {
    const itemDetail = cart[itemName]
    if (itemDetail.clearance) {
      itemDetail.price = Number((itemDetail.price * 0.8).toFixed(1))
    }
  }
  return cart
}

const checkout = (cart, coupons) => {
  const consolidatedCart = consolidateCart(cart)
  const couponCart = applyCoupons(consolidatedCart, coupons)
  const clearanceCart = applyClearance(couponCart)
  const itemDetails = Object.values(clearanceCart);
  const nonZeroItemDetails = itemDetails.filter(detail => detail.count > 0)// [{}, {}, {}]
  const subtotal = nonZeroItemDetails.reduce((total, itemDetail) => {
    return total + (itemDetail['price'] * itemDetail['count'])
  }, 0)
  return subtotal > 100 ? subtotal * .9 : subtotal
}

const myCart = [
  { AVOCADO: { price: 3.0, clearance: true } },
  { AVOCADO: { price: 3.0, clearance: true } },
  { KALE: { price: 3.0, clearance: false } },
]
const couponsArr = [{ item: "AVOCADO", num: 2, cost: 5.0 }]
console.log(checkout(myCart, couponsArr))
