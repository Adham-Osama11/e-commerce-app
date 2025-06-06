// server/routes/ordersRoutes.js
const express = require('express');
const router  = express.Router();

// Destructure the `protect` middleware from your auth module
const { protect } = require('../middleware/auth');

// Your controller that returns the current user’s orders
const { getUserOrders, createOrder } = require('../controllers/ordersController');

// 1) Apply the JWT check to **all** routes in this router
router.use(protect);

router.post('/myorders', createOrder);


// 2) GET /api/order — returns only the authenticated user’s orders
router.get('/', getUserOrders);

// 3) POST /api/order — create a new order


module.exports = router;
