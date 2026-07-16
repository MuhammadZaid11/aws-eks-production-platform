const express = require('express');
const { Op } = require('sequelize');
const { Product } = require('../models');
const { redisClient } = require('../config/redis');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// GET all products (with optional search and category filters)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let whereClause = {};

    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }
    if (category) {
      whereClause.category = category;
    }

    // Attempt to use cache if no search/filter is applied
    if (!search && !category) {
      const cachedProducts = await redisClient.get('products');
      if (cachedProducts) {
        return res.json(JSON.parse(cachedProducts));
      }
    }

    const products = await Product.findAll({ where: whereClause });
    
    // Cache the base products list
    if (!search && !category) {
      await redisClient.set('products', JSON.stringify(products), { EX: 3600 });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create product (Admin only)
router.post('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    await redisClient.del('products'); // Invalidate cache
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE product (Admin only)
router.delete('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    await product.destroy();
    await redisClient.del('products'); // Invalidate cache
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
