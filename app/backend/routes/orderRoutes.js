const express = require('express');
const { Order, OrderItem, Product } = require('../models');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body; // items: [{ productId, quantity }]
    let totalAmount = 0;
    
    // Validate products and calculate total
    const orderItemsData = [];
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });
      
      const priceAtPurchase = product.price;
      totalAmount += priceAtPurchase * item.quantity;
      
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase
      });
    }

    const order = await Order.create({
      userId: req.user.id,
      totalAmount
    });

    for (const itemData of orderItemsData) {
      await OrderItem.create({
        orderId: order.id,
        ...itemData
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [OrderItem]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
