const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId').populate('items.variantId');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  const { productId, variantId, quantity } = req.body;
  try {
    // Step 1: Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Step 2: Check if the variant exists
    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }

    // Step 3: Check if the requested quantity is available in stock
    if (variant.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock available' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    // Step 4: Check if the item already exists in the cart
    const existingItem = cart.items.find(item =>
      item.productId.toString() === productId &&
      item.variantId.toString() === variantId
    );

    if (existingItem) {
      // Step 5: Update the quantity if the item already exists
      const newQuantity = existingItem.quantity + quantity;

      // Ensure the updated quantity does not exceed stock
      if (newQuantity > variant.stock) {
        return res.status(400).json({ message: 'Insufficient stock available for the requested quantity' });
      }

      existingItem.quantity = newQuantity;
    } else {
      // Step 6: Add a new item to the cart
      cart.items.push({ productId, variantId, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.modifyCartItem = async (req, res) => {
  const { quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
