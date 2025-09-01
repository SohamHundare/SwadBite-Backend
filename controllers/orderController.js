const Order = require("../models/Order");

const createOrder = async (req, res) => {
  try {
    const { customerName, deliveryAddress, isTakeaway, paymentMethod, totalAmount, items } = req.body;

    const newOrder = new Order({
      customerName,
      deliveryAddress,
      isTakeaway,
      paymentMethod,
      totalAmount,
      items,
    });

    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    return res.status(200).json(orders); // only one response
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = { createOrder, getAllOrders };
