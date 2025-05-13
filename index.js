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
  // code here
}

const applyClearance = (cart) => {
  // code here
}

const checkout = (cart, coupons) => {
  // code here
}
