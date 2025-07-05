module.exports = class cart {
  constructor(UserCart) {
    this.UserCart = UserCart;
  }

  addItem(item, RequiredQuantity) {
    // adding product
    // Check of product added before
    let exist = false;
    this.UserCart.items.forEach((element) => {
      if (element.productId.equals(item.id)) {
        exist = true;
        element.orderedQuantity += RequiredQuantity;
        this.UserCart.totalamount += item.price * RequiredQuantity;
        this.UserCart.totalWeight += item.weight * RequiredQuantity;
      }
    });
    if (!exist) {
      this.UserCart.items.push({
        productId: item.id,
        productName: item.name,
        orderedQuantity: RequiredQuantity,
        productPrice: item.price,
        productWeight: item.weight
      });
      this.UserCart.totalamount += item.price * RequiredQuantity;
      this.UserCart.totalWeight += item.weight * RequiredQuantity;
    }
  }

  async updateCart() {
    await this.UserCart.save();
  }

  Shipment() {
    const productsShipment = this.UserCart.items.map(
      (element) =>
        `${element.orderedQuantity}x ${element.productName}`.padEnd(18) +
        `${element.productWeight}g`
    );
    productsShipment.unshift('** Shipment notice **');
    productsShipment.push(
      `Total package weight ${this.UserCart.totalWeight / 1000}kg`
    );

    return productsShipment.join('\n');
  }

  receipt() {
    const totalQuantity = this.UserCart.items.reduce((accumulator, item) => {
      return (accumulator += item.orderedQuantity);
    }, 0);

    const productsreceipt = this.UserCart.items.map(
      (element) =>
        `${element.orderedQuantity}x ${element.productName}`.padEnd(18) +
        `${element.productPrice}`
    );
    productsreceipt.unshift('\n** Shipment receipt **');
    productsreceipt.push(`\n-------------------------------`);
    productsreceipt.push(
      `Subtotal`.padEnd(18) + `${this.UserCart.totalamount}`
    );
    productsreceipt.push(`Shipping`.padEnd(18) + `${totalQuantity * 10}`);
    productsreceipt.push(
      `Amount`.padEnd(18) + `${this.UserCart.totalamount + totalQuantity * 10}`
    );

    return productsreceipt.join('\n');
  }
};
