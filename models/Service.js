const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: String,
  icon: String,
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Pre-save hook to generate slug
serviceCategorySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required']
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 'Landscaping', 'HVAC', 'Other']
  },
  price: {
    type: Number,
    required: [true, 'Service price is required']
  },
  priceType: {
    type: String,
    enum: ['hourly', 'fixed'],
    default: 'hourly'
  },
  imageUrl: {
    type: String,
    default: 'default-service.jpg'
  },
  estimatedTime: {
    type: Number, // in hours
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const ServiceCategory = mongoose.model('ServiceCategory', serviceCategorySchema);
const Service = mongoose.model('Service', serviceSchema);

module.exports = { ServiceCategory, Service };
