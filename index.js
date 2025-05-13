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
  // code here
}

const checkout = (cart, coupons) => {
  // code here
}

let items = [
  { AVOCADO: { price: 3.0, clearance: true } },
  { AVOCADO: { price: 3.0, clearance: true } },
  { AVOCADO: { price: 3.0, clearance: true } },
  { AVOCADO: { price: 3.0, clearance: true } },
  { AVOCADO: { price: 3.0, clearance: true } },
  { KALE: { price: 3.0, clearance: false } },
  { BLACK_BEANS: { price: 2.5, clearance: false } },
  { ALMONDS: { price: 9.0, clearance: false } },
  { TEMPEH: { price: 3.0, clearance: true } },
  { CHEESE: { price: 6.5, clearance: false } },
  { CHEESE: { price: 6.5, clearance: false } },
  { CHEESE: { price: 6.5, clearance: false } },
  { CHEESE: { price: 6.5, clearance: false } },
  { CHEESE: { price: 6.5, clearance: false } },
  { CHEESE: { price: 6.5, clearance: false } },
  { CHEESE: { price: 6.5, clearance: false } },
  { CHEESE: { price: 6.5, clearance: false } },
  { CHEESE: { price: 6.5, clearance: false } },
  { CHEESE: { price: 6.5, clearance: false } },
  { CHEESE: { price: 6.5, clearance: false } },
  { CHEESE: { price: 6.5, clearance: false } },
  { CHEESE: { price: 6.5, clearance: false } },
  { CHEESE: { price: 6.5, clearance: false } },
  { BEER: { price: 13.0, clearance: false } },
  { PEANUT_BUTTER: { price: 3.0, clearance: true } },
  { BEETS: { price: 2.5, clearance: false } },
  { "SOY MILK": { price: 4.5, clearance: true } },
]

let coupons = [
  { item: "AVOCADO", num: 2, cost: 5.0 },
  { item: "AVOCADO", num: 2, cost: 5.0 },
  { item: "BEER", num: 2, cost: 20.0 },
  { item: "CHEESE", num: 3, cost: 15.0 },
]

const newCart = consolidateCart(items)

applyCoupons(newCart, coupons)

console.log("newCart: ", newCart)
