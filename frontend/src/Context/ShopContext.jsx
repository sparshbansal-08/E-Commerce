import React, { createContext, useState } from "react";
import { useEffect } from "react";
// Ensure this path is correct

// Create a context
export const ShopContext = createContext(null);

// Helper function to initialize the default cart
const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < 300 + 1; index++) {
    cart[index] = 0; // Initialize each product's quantity to 0
  }
  return cart;
};

// Context Provider component
const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());

  useEffect(() => {
    fetch("http://localhost:4000/allproducts")
      .then((response) => response.json())
      .then((data) => setAll_Product(data))
      .catch((err) => console.error("Error fetching products:", err));
  
    if (localStorage.getItem("auth-token")) {
      fetch("http://localhost:4000/getcart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch cart");
          return response.json();
        })
        .then((data) => setCartItems(data))
        .catch((err) => console.error("Error fetching cart:", err));
    }
  }, []);
  

  const addToCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    if (localStorage.getItem("auth-token")) {
      fetch("http://localhost:4000/addtocart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": `${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: itemId }),
      })
        .then((response) => response.json()) // Properly parse the JSON response
        .then((data) => {
          if (data.success) {
            console.log(data.message); // "Added to cart successfully"
          } else {
            console.error("Error:", data.error);
          }
        })
        .catch((err) => console.error("Fetch error:", err));
    }
  };
  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if(localStorage.getItem("auth-token")){
      fetch("http://localhost:4000/removefromcart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": `${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: itemId }),
      })
        .then((response) => response.json()) // Properly parse the JSON response
        .then((data) => {
          if (data.success) {
            console.log(data.message); // "Added to cart successfully"
          } else {
            console.error("Error:", data.error);
          }
        })
        .catch((err) => console.error("Fetch error:", err));
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = all_product.find(
          (product) => product.id === Number(item)
        );
        totalAmount += itemInfo.new_price * cartItems[item];
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItem += cartItems[item];
      }
    }
    return totalItem;
  };

  const contextValue = {
    getTotalCartItems,
    getTotalCartAmount,
    all_product,
    cartItems,
    addToCart,
    removeFromCart, // Expose setter to allow updates to the cart
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
