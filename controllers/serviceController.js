const Service = require('../models/Service').Service;

exports.listServices = async (req, res) => {
  const services = await Service.find();
  res.json({ success: true, services });
};

exports.createService = async (req, res) => {
  const { name, description, category, price, priceType, imageUrl, estimatedTime } = req.body;
  const service = new Service({
    name, description, category, price, priceType, imageUrl, estimatedTime, createdBy: req.user._id
  });
  await service.save();
  res.status(201).json({ success: true, service });
};
