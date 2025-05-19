const Item = require('../models/Item');

exports.createItem = async (req, res) => {
  const item = new Item({ ...req.body, user: req.user.userId });
  await item.save();
  res.status(201).json(item);
};

exports.getItems = async (req, res) => {
  const items = await Item.find({ user: req.user.userId });
  res.json(items);
};

exports.getItem = async (req, res) => {
  const item = await Item.findOne({ _id: req.params.id, user: req.user.userId });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
};

exports.updateItem = async (req, res) => {
  const item = await Item.findOneAndUpdate(
    { _id: req.params.id, user: req.user.userId },
    req.body,
    { new: true }
  );
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
};

exports.deleteItem = async (req, res) => {
  const item = await Item.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ success: true });
};
