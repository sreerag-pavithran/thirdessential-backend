const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const productSchema = mongoose.Schema({
  name: {
    type: String,
  },
  vendor: {
    type: ObjectId,
    ref: "user",
  },
  media: {
    type: [String],
  },
  price: {
    type: String,
  },
  updatedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("product", productSchema);
module.exports = Product;
