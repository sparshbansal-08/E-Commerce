const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { error } = require("console");
const { console } = require("inspector");

app.use(express.json());
app.use(cors());

// Database connection with mongodb
mongoose
  .connect(
    "mongodb+srv://sparshbansal:sparshbansal@cluster0.vlyh2.mongodb.net/Ecommerce"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Connection error:", err));
// API Creation

app.get("/", (req, res) => {
  res.send("Express App is running");
});

//Image Storage Engine
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({ storage: storage });

//creating upload Endpoint for images

app.use("/images", express.static("upload/images"));
app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

//Schema for creating products

const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  console.log(product);
  await product.save();
  console.log("Saved");
  res.json({
    success: true,
    name: req.body.name,
  });
});
// creating API for deleting products

app.post("/removeproduct", async (req, res) => {
  console.log("Request to delete product with ID:", req.body.id);

  try {
    const deletedProduct = await Product.findOneAndDelete({ id: req.body.id });

    if (!deletedProduct) {
      console.log("Product not found with ID:", req.body.id);
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    console.log("Product deleted successfully:", deletedProduct);
    res.json({ success: true, message: "Product removed successfully" });
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// creating API for getting all products
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products Fetched");
  res.send(products);
});

//Shema creating for user model
const Users = mongoose.model("Users", {
  name: {
    type: String,
    required: true, // Make this field mandatory
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
    match: [/.+@.+\..+/, "Please enter a valid email address"], // Validation for email format
  },
  password: {
    type: String,
    required: true, // Make this field mandatory
    minlength: 6, // Set a minimum password length
  },
  cardData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

//creating endpoint for registering the user
app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ message: "Email already exists" });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    username: req.body.name,
    email: req.body.email,
    password: req.body.password,
    cardData: cart,
  });
  await user.save();
  const data = {
    user: {
      id: user._id,
    },
  };
  const token = jwt.sign(data, "secret_ecom");
  res.json({ message: "User created successfully", token });
});

//creating endpoint for user login

app.post("./login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, "secret_ecom");
      res.json({ sucess: true, token });
    } else {
      res.json({ success: false, errors: "wrong password" });
    }
  } else {
    res.json({ success: false, errors: "wrong email" });
  }
});

app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on port " + port);
  } else {
    console.log("Error in server creation: " + error);
  }
});
