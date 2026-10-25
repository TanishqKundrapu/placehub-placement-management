const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Company name is required'], trim: true, unique: true },
    industry: { type: String, required: [true, 'Industry is required'], trim: true },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    website: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
