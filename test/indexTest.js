require("./helpers.js")

const { expect } = require("chai")

describe("Grocer", function () {
  let items = [
    { AVOCADO: { price: 3.0, clearance: true } },
    { KALE: { price: 3.0, clearance: false } },
    { BLACK_BEANS: { price: 2.5, clearance: false } },
    { ALMONDS: { price: 9.0, clearance: false } },
    { TEMPEH: { price: 3.0, clearance: true } },
    { CHEESE: { price: 6.5, clearance: false } },
    { BEER: { price: 13.0, clearance: false } },
    { PEANUT_BUTTER: { price: 3.0, clearance: true } },
    { BEETS: { price: 2.5, clearance: false } },
    { "SOY MILK": { price: 4.5, clearance: true } },
  ]

  let coupons = [
    { item: "AVOCADO", num: 2, cost: 5.0 },
    { item: "BEER", num: 2, cost: 20.0 },
    { item: "CHEESE", num: 3, cost: 15.0 },
  ]

  function findItem(name) {
    return items.find((item) => Object.keys(item).includes(name))
  }

  function findCoupon(name) {
    return coupons.find((coupon) => coupon.item === name)
  }

  describe("#consolidateCart", function () {
    it("adds a count of one to each item when there are no duplicates", function () {
      let cart = [
        findItem("TEMPEH"),
        findItem("PEANUT_BUTTER"),
        findItem("ALMONDS"),
      ]
      let result = consolidateCart(cart)

      expect(result).to.be.an("object")
      expect(Object.keys(result)).to.not.be.empty

      Object.values(result).forEach((attributes) => {
        expect(Object.keys(attributes)).to.include("count")
        expect(attributes.count).to.equal(1)
      })
    })

    it("increments count when there are multiple items", function () {
      let avocado = findItem("AVOCADO")
      let cart = [avocado, avocado, findItem("KALE")]

      let result = consolidateCart(cart)
      expect(result["AVOCADO"].price).to.equal(3.0)
      expect(result["AVOCADO"].clearance).to.be.true
      expect(result["AVOCADO"].count).to.equal(2)

      expect(result["KALE"].price).to.equal(3.0)
      expect(result["KALE"].clearance).to.be.false
      expect(result["KALE"].count).to.equal(1)
    })
  })

  describe("#applyCoupons", function () {
    context(
      "base case - with perfect coupon (number of items identical):",
      function () {
        let avocado, avocadoCoupon, cart, consolidatedCart, avocadoResult

        beforeEach(function () {
          avocado = findItem("AVOCADO")
          avocadoCoupon = findCoupon("AVOCADO")
          cart = [avocado, avocado]
          consolidatedCart = consolidateCart(cart)
          avocadoResult = applyCoupons(consolidatedCart, [avocadoCoupon])
        })

        it("adds a new key, value pair to the cart hash called 'ITEM NAME W/COUPON'", function () {
          expect(Object.keys(avocadoResult)).to.include("AVOCADO W/COUPON")
        })

        it("adds the coupon price to the property hash of couponed item", function () {
          expect(avocadoResult["AVOCADO W/COUPON"].price).to.equal(5.0)
        })

        it("adds the count number to the property hash of couponed item", function () {
          expect(avocadoResult["AVOCADO W/COUPON"].count).to.equal(1)
        })

        it("removes the number of discounted items from the original item's count", function () {
          expect(avocadoResult["AVOCADO"].price).to.equal(3.0)
          expect(avocadoResult["AVOCADO"].count).to.equal(0)
        })

        it("remembers if the item was on clearance", function () {
          expect(avocadoResult["AVOCADO W/COUPON"].clearance).to.be.true
        })
      }
    )
  })

  describe("more advanced cases", function () {
    it("accounts for when there are more items than the coupon allows", function () {
      let cheese = findItem("CHEESE")
      let cart = Array(5).fill(cheese)
      let consolidatedCart = consolidateCart(cart)
      let cheeseCoupon = findCoupon("CHEESE")

      let cheeseResult = applyCoupons(consolidatedCart, [cheeseCoupon])

      expect(cheeseResult["CHEESE"].price).to.equal(6.5)
      expect(cheeseResult["CHEESE"].count).to.equal(2)

      expect(cheeseResult["CHEESE W/COUPON"].price).to.equal(15.0)
      expect(cheeseResult["CHEESE W/COUPON"].count).to.equal(1)
      expect(cheeseResult["CHEESE W/COUPON"].clearance).to.be.false
    })

    it("doesn't break if the coupon doesn't apply to any items", function () {
      let cheese = findItem("CHEESE")
      let cart = Array(2).fill(cheese)
      let consolidatedCart = consolidateCart(cart)

      let irrelevant = applyCoupons(consolidatedCart, [findCoupon("AVOCADO")])

      expect(irrelevant["CHEESE"].price).to.equal(6.5)
      expect(irrelevant["CHEESE"].count).to.equal(2)
      expect(irrelevant).to.not.have.property("AVOCADO W/COUPON")
      expect(irrelevant).to.not.have.property("AVOCADO")
    })

    it("can apply multiple coupons", function () {
      let avocado = findItem("AVOCADO")
      let cheese = findItem("CHEESE")
      let cart = Array(4).fill(cheese).concat(Array(3).fill(avocado))
      let consolidatedCart = consolidateCart(cart)

      let multipleCoupons = applyCoupons(consolidatedCart, [
        findCoupon("AVOCADO"),
        findCoupon("CHEESE"),
      ])

        ;["AVOCADO", "CHEESE"].forEach((item) => {
          expect(multipleCoupons[item].count).to.equal(1)
        })

      expect(multipleCoupons["CHEESE"].price).to.equal(6.5)
      expect(multipleCoupons["AVOCADO"].price).to.equal(3.0)

      expect(multipleCoupons["CHEESE W/COUPON"].price).to.equal(15.0)
      expect(multipleCoupons["CHEESE W/COUPON"].count).to.equal(1)
      expect(multipleCoupons["CHEESE W/COUPON"].clearance).to.be.false

      expect(multipleCoupons["AVOCADO W/COUPON"].price).to.equal(5.0)
      expect(multipleCoupons["AVOCADO W/COUPON"].count).to.equal(1)
      expect(multipleCoupons["AVOCADO W/COUPON"].clearance).to.be.true
    })

    it("doesn't break if there is no coupon", function () {
      let cheese = findItem("CHEESE")
      let cart = [cheese, cheese]
      let consolidatedCart = consolidateCart(cart)
      let noCouponResult = applyCoupons(consolidatedCart, [])

      expect(noCouponResult["CHEESE"].price).to.equal(6.5)
      expect(noCouponResult["CHEESE"].count).to.equal(2)
    })

    it("can increment coupon count if two are applied", function () {
      let avocado = findItem("AVOCADO")
      let coupon = findCoupon("AVOCADO")
      let consolCart = consolidateCart(Array(5).fill(avocado))

      let twoCouponResult = applyCoupons(consolCart, [coupon, coupon])

      expect(twoCouponResult["AVOCADO"].count).to.equal(1)
      expect(twoCouponResult["AVOCADO W/COUPON"].price).to.equal(5.0)
      expect(twoCouponResult["AVOCADO"].price).to.equal(3.0)
      expect(twoCouponResult["AVOCADO W/COUPON"].count).to.equal(2)
    })

    it("only applies coupons that meet minimum amount", function () {
      let cart = [findItem("AVOCADO")]
      let consolidatedCart = consolidateCart(cart)
      let coupon = findCoupon("AVOCADO")
      let couponResult = applyCoupons(consolidatedCart, [coupon])

      expect(couponResult["AVOCADO"].count).to.equal(1)
      expect(couponResult["AVOCADO W/COUPON"]).not.to.exist
    })
  })

  describe("#applyClearance", function () {
    it("takes 20% off price if the item is on clearance", function () {
      const cart = {
        PEANUT_BUTTER: { price: 3.0, clearance: true, count: 1 },
      }

      const result = applyClearance(cart)
      expect(result["PEANUT_BUTTER"].price).to.equal(2.4)
    })

    it("does not discount the price for items not on clearance", function () {
      const cart = {
        AVOCADO: { price: 3.0, clearance: false, count: 1 },
        PEANUT_BUTTER: { price: 3.0, clearance: true, count: 1 },
        BEETS: { price: 2.5, clearance: false, count: 1 },
      }

      const result = applyClearance(cart)
      expect(result["AVOCADO"].price).to.equal(3.0)
      expect(result["PEANUT_BUTTER"].price).to.equal(2.4)
      expect(result["BEETS"].price).to.equal(2.5)
    })
  })

  describe("#checkout", function () {
    it("calculates the total correctly", function () {
      const cart = [
        { AVOCADO: { price: 3.0, clearance: true } },
        { AVOCADO: { price: 3.0, clearance: true } },
        { KALE: { price: 3.0, clearance: false } },
      ]
      const couponsArr = [{ item: "AVOCADO", num: 2, cost: 5.0 }]

      const total = checkout(cart, couponsArr)

      expect(total).to.equal(7.0)
    })

    it("applies no discounts if no clearance or coupons are relevant", function () {
      const cart = [{ KALE: { price: 3.0, clearance: false, count: 1 } }]
      expect(checkout(cart, [])).to.equal(3.0)
    })

    it("calls consolidateCart before calculating the total for one item", function () {
      const cart = [findItem("BEETS")]

      const total = checkout(cart, [])
      expect(total).to.equal(2.5)
    })

    it("calls applyCoupons after consolidateCart when there is only one item in the cart", function () {
      const cart = [findItem("BEETS")]
      const consolidated = consolidateCart(cart)
      const couponsApplied = applyCoupons(consolidated, [])

      checkout(cart, [])
    })

    it("calls applyClearance after applyCoupons when there is only one item and no coupon", function () {
      const cart = [findItem("BEETS")]
      const consolidated = consolidateCart(cart)
      const couponsApplied = applyCoupons(consolidated, [])

      checkout(cart, [])
    })

    it("calls applyClearance after applyCoupons with multiple items and one coupon", function () {
      const beer = findItem("BEER")
      const cart = [findItem("BEETS"), beer, beer, beer]
      const couponsArr = [findCoupon("BEER")]

      const total = checkout(cart, couponsArr)

      expect(total).to.equal(35.5)
    })

    it("calls applyClearance after applyCoupons with multiple items, coupons, and clearance items", function () {
      const avocado = findItem("AVOCADO")
      const cheese = findItem("CHEESE")
      const milk = findItem("SOY MILK")
      const cart = [milk, avocado, avocado, cheese, cheese, cheese]
      const couponsArr = [findCoupon("AVOCADO"), findCoupon("CHEESE")]

      const consolidated = consolidateCart(cart)
      const couponsApplied = applyCoupons(consolidated, couponsArr)

      const total = checkout(cart, couponsArr)

      expect(total).to.equal(22.6)
    })

    it("calls consolidateCart before calculating the total for two different items", function () {
      const cart = [findItem("CHEESE"), findItem("BEETS")]

      const total = checkout(cart, [])
      expect(total).to.equal(9.0)
    })

    it("calls consolidateCart before calculating the total for two identical items", function () {
      const beets = findItem("BEETS")
      const cart = Array(2).fill(beets)

      const total = checkout(cart, [])
      expect(total).to.equal(5.0)
    })

    describe("coupons:", function () {
      it("considers coupons", function () {
        const cheese = findItem("CHEESE")
        const cart = Array(3).fill(cheese)
        const couponsArr = [findCoupon("CHEESE")]

        expect(checkout(cart, couponsArr)).to.equal(15.0)
      })

      it("considers coupons and clearance discounts", function () {
        const avocado = findItem("AVOCADO")
        const cart = Array(2).fill(avocado)
        const couponsArr = [findCoupon("AVOCADO")]

        expect(checkout(cart, couponsArr)).to.equal(4.0)
      })

      it("charges full price for items that fall outside of coupon count", function () {
        const beer = findItem("BEER")
        const cart = Array(3).fill(beer)
        const couponsArr = [findCoupon("BEER")]

        expect(checkout(cart, couponsArr)).to.equal(33.0)
      })

      it("only applies coupons that meet minimum amount", function () {
        const beer = findItem("BEER")
        const cart = Array(3).fill(beer)
        const beerCoupon = findCoupon("BEER")
        const couponsArr = [beerCoupon, beerCoupon]

        expect(checkout(cart, couponsArr)).to.equal(33.0)
      })
    })

    describe("clearance:", function () {
      it("applies a 20% discount to items on clearance", function () {
        const pb = findItem("PEANUT_BUTTER")
        const cart = [pb]

        expect(checkout(cart, [])).to.equal(2.4)
      })

      it("applies a 20% discount to items on clearance but not to non-clearance items", function () {
        const beets = findItem("BEETS")
        const pb = findItem("PEANUT_BUTTER")
        const cart = [beets, pb]

        expect(checkout(cart, [])).to.equal(4.9)
      })
    })

    describe("discount of ten percent", function () {
      it("applies 10% discount if cart over $100", function () {
        const beer = findItem("BEER")
        const cart = Array(10).fill(beer)

        expect(checkout(cart, [])).to.equal(117.0)
      })
    })
  })
})
