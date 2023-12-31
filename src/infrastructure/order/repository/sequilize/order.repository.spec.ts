import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should find all orders", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("1", "Product 1", 10);
    await productRepository.create(product);

    const orderRepository = new OrderRepository();
    const orderItem = new OrderItem( "1", product.name, product.price, product.id, 2);
    const orderItem1 = new OrderItem("2", product.name, product.price, product.id, 3);
    const order = new Order("1", "123", [orderItem]); 
    const order1 = new Order("2", "123", [orderItem1]); 
    await orderRepository.create(order);
    await orderRepository.create(order1);

    const foundOrders = await orderRepository.findAll();
    const orders = [order, order1];

    expect(orders).toEqual(foundOrders);
  });

  it("should find order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("1", "Product 1", 10);
    await productRepository.create(product);

    const orderRepository = new OrderRepository();
    const orderItem = new OrderItem( "1", product.name, product.price, product.id, 2);
    const order = new Order("1", "123", [orderItem]);
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({ where: { id: "1" }, include: ["items"]});

    const foundOrder = await orderRepository.find("1");

    expect(orderModel.toJSON()).toStrictEqual({
      id: foundOrder.id,
      customer_id: foundOrder.customerId,
      items: foundOrder.items?.map((item) => {
        return {
          id: item.id,
          name: item.name,
          order_id: foundOrder.id,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity
        }
      }),
      total: foundOrder.total()
    });
  });

  it("should update order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("1", "Product 1", 5);
    await productRepository.create(product);

    const orderRepository = new OrderRepository();
    const orderItem = new OrderItem( "1", product.name, product.price, product.id, 2);
    const order = new Order("1", "123", [orderItem]);
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({ where: { id: order.id }, include: ["items"]});

    const foundOrder = await orderRepository.find("1");

    expect(orderModel.toJSON()).toStrictEqual({
      id: foundOrder.id,
      customer_id: foundOrder.customerId,
      items: foundOrder.items?.map((item) => {
        return {
          id: item.id,
          name: item.name,
          order_id: foundOrder.id,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity
        }
      }),
      total: foundOrder.total()
    });

    product.changePrice(10);
    orderItem.changePrice(product.price);
    orderItem.changeQuantity(4);
    orderItem.UpdateTotal();
    order.ChangeItem(orderItem);
    await orderRepository.update(order);

    const orderModel2 = await OrderModel.findOne({ where: { id: order.id }, include: ["items"]});

    expect(orderModel2.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: order.customerId,
      items: order.items?.map((item) => {
        return {
          id: item.id,
          name: item.name,
          order_id: order.id,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity
        }
      }),
      total: order.total()
    });
  });
});
