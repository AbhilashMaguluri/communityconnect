const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
}, { _id: false });

const addressSchema = new mongoose.Schema({
  street: String,
  area: String,
  city: String,
  state: String,
  pincode: String,
  landmark: String
}, { _id: false });

const imageSchema = new mongoose.Schema({
  filename: String,
  data: String, // base64 encoded (for small demo) or URL/path in production
  contentType: String
}, { _id: false });

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, default: 'medium' },
  status: { type: String, default: 'reported' },
  location: { type: pointSchema, default: { type: 'Point', coordinates: [0, 0] } },
  address: { type: addressSchema, default: {} },
  tags: { type: [String], default: [] },
  images: { type: [imageSchema], default: [] },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  reportedByEmail: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
