module.exports = class product {
  constructor(prod) {
    this.name = prod.name;
    this.price = prod.price;
    this.quantity = prod.quantity;
    this.weight = prod.weight;
  }

  CheckQuantity(NeededProd) {
    return this.quantity < NeededProd;
  }
};
