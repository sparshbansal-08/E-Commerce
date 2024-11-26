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
    return res
      .status(400)
      .json({ success: false, message: "Email already exists" });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.name,
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
  res.json({ success: true, message: "User created successfully", token });
});

//creating endpoint for user login

app.post("/login", async (req, res) => {
  const user = await Users.findOne({ email: req.body.email });
  if (!user) {
    return res.json({ success: false, errors: "Email not registered" });
  }

  const passCompare = req.body.password === user.password;
  if (!passCompare) {
    return res.json({ success: false, errors: "Incorrect password" });
  }

  const data = {
    user: {
      id: user._id, // Ensure this references the MongoDB `_id`
    },
  };
  const token = jwt.sign(data, "secret_ecom");
  res.json({ success: true, token });
});

//creating endpoint for new collection data
app.get('/newcollections', async (req, res) => {
  let products = await Product.find({})
  let newcollection = products.slice(1).slice(-8)
  console.log("NewCollection Fetched");
  res.send(newcollection);
})

//creating endpoint for popular in women section

app.get('/popularinwomen', async (req, res) => {
  let products = await Product.find({category:"women"})
  let popular_in_women=products.slice(0,4)
  
  console.log("Popular in Women Fetched");
  res.send(popular_in_women);
})

//creating middelware to fetch user

const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    console.log("Authenticated user:", req.user); // Debug log
    next();
  } catch (error) {
    console.error("Error decoding token:", error);
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};


//creating endpoint for adding products in cartdata
const addToCart = (itemId) => {
  if (!localStorage.getItem("auth-token")) return;

  fetch("http://localhost:4000/addtocart", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "auth-token": localStorage.getItem("auth-token"),
    },
    body: JSON.stringify({ itemId }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to add to cart");
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
      }
    })
    .catch((err) => console.error("Error adding to cart:", err));
};

const removeFromCart = (itemId) => {
  if (!localStorage.getItem("auth-token")) return;

  fetch("http://localhost:4000/removefromcart", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "auth-token": localStorage.getItem("auth-token"),
    },
    body: JSON.stringify({ itemId }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to remove from cart");
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        setCartItems((prev) => {
          const updatedCart = { ...prev };
          updatedCart[itemId] = Math.max((updatedCart[itemId] || 0) - 1, 0);
          if (updatedCart[itemId] === 0) delete updatedCart[itemId];
          return updatedCart;
        });
      }
    })
    .catch((err) => console.error("Error removing from cart:", err));
};

//creating endpoint to remove product from cart
app.post('/removefromcart', fetchUser, async (req, res) => {
  try {
    console.log("Authenticated user ID:", req.user.id);

    // Validate itemId in request body
    const itemId = req.body.itemId;
    if (!itemId) {
      return res.status(400).json({ success: false, message: "Item ID is required" });
    }

    // Find the user in the database
    const userData = await Users.findOne({ _id: req.user.id });
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if cartData exists and the item is in the cart
    if (!userData.cardData || !userData.cardData[itemId]) {
      return res.status(400).json({ success: false, message: "Item not found in cart" });
    }

    // Decrease the quantity or remove the item
    userData.cardData[itemId] -= 1;
    if (userData.cardData[itemId] <= 0) {
      delete userData.cardData[itemId]; // Remove the item if quantity is 0 or less
    }

    // Update the user's cart data in the database
    const updateResult = await Users.updateOne(
      { _id: req.user.id },
      { $set: { cardData: userData.cardData } }
    );
    console.log("Update Result:", updateResult);

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({ success: false, message: "Failed to update cart" });
    }

    res.json({ success: true, message: "Item removed from cart successfully" });
  } catch (error) {
    console.error("Error in remove from cart:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

//creating endpoint to get cart data

app.post('/getcart', fetchUser, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user) {
      
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json(user.cardData || {}); // Ensure default object
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});





app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on port " + port);
  } else {
    console.log("Error in server creation: " + error);
  }
});