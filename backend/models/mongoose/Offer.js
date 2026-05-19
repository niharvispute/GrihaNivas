const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    desc: { type: String, required: true, trim: true, maxlength: 500 },
    buttonUrl: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

const offerSchema = new mongoose.Schema(
  {
    headline: { type: String, required: true, trim: true, maxlength: 200 },
    cards: { type: [cardSchema], default: [] },
    showOnFrontend: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Offer', offerSchema);
