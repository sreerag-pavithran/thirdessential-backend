let Product = require("../models/product.model");

let fetchProducts = async (req, res, next) => {
  try {
    const { isVendor, _id } = req.body;
    if (isVendor === true) {
      let fetchProducts = await Product.find({ vendor: _id }).populate(
        "vendor"
      );
      try {
        return res.json({
          status: true,
          message: "Products Fetched!",
          data: fetchProducts,
        });
      } catch (error) {
        return res.json({
          status: false,
          message: "Failed to fetch products!",
        });
      }
    } else {
      let fetchProducts = await Product.find().populate("vendor");
      try {
        return res.json({
          status: true,
          message: "Products Fetched!",
          data: fetchProducts,
        });
      } catch (error) {
        return res.json({
          status: false,
          message: "Failed to fetch products!",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Bad Request!",
    });
  }
};

let createProduct = async (req, res, next) => {
  try {
    const name = req.body.name;
    const vendor = req.body.vendor;
    const price = req.body.price;
    const media = req.body.media;

    const imageUrls = [];
    let imageArr = [];
    if (media) {
      media && imageArr.push(media);
    }

    let resultPromise = imageArr.map(async (img) => {
      await cloudinary.uploader.upload(
        img,
        { folder: process.env.APPNAME }, //Uploads to Specific Store Folder
        async (err, result) => {
          imageUrls.push(result?.secure_url);
        }
      );
    });
    Promise.all(resultPromise).then(async () => {
      const newProduct = new Product({
        name,
        price,
        vendor,
        media: imageUrls,
      });
      try {
        await newProduct.save();
        let allProducts = await Product.find();
        return res.json({
          status: true,
          message: "Product added",
          data: allProducts,
        });
      } catch (error) {
        console.log(error);
        return res.json({
          status: true,
          message: "Failed to add product",
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Bad Request",
    });
  }
};

let updateProduct = async (req, res, next) => {
  try {
    const _id = req.body._id;
    const media = req.body.media;

    const imageUrls = [];
    let imageArr = [];
    if (media) {
      media && imageArr.push(media);
    }

    let resultPromise = imageArr.map(async (img) => {
      await cloudinary.uploader.upload(
        img,
        { folder: process.env.APPNAME }, //Uploads to Specific Store Folder
        async (err, result) => {
          imageUrls.push(result?.secure_url);
        }
      );
    });
    let updatedProduct;
    Promise.all(resultPromise).then(async () => {
      if (req.files) {
        updatedProduct = {
          ...req.body,
          media: imageUrls,
        };
      } else {
        updatedProduct = {
          ...req.body,
        };
      }
      const updated = await Product.findByIdAndUpdate(
        { _id: _id },
        updatedProduct,
        { new: true, runValidators: true }
      );
      const allProducts = await Product.find();
      try {
        return res.json({
          status: true,
          message: "Product updated",
          data: allProducts,
        });
      } catch (error) {
        return res.json({
          status: false,
          message: "Failed to update product",
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Bad Request",
    });
  }
};

let deleteProduct = async (req, res, next) => {
  try {
    const _id = req.body._id;
    await Product.findByIdAndDelete(_id);
    let fetchProducts = await Product.find();
    try {
      return res.json({
        status: true,
        message: "Product deleted",
        data: fetchProducts,
      });
    } catch (error) {
      return res.json({
        status: true,
        message: "Failed to delete product",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Bad Request",
    });
  }
};

let singleProduct = async (req, res, next) => {
  try {
    const id = req.body.id;
    let product = await Product.find({ vendor: id });
    try {
      return res.json({
        status: true,
        message: "Product fetched",
        data: product,
      });
    } catch (error) {
      return res.json({
        status: true,
        message: "Failed to fetch product",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Bad Request",
    });
  }
};

module.exports = {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  singleProduct,
};
