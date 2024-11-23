import React, { createContext, useState } from "react";
import all_product from "../Components/Assets/all_product"; // Ensure this path is correct

// Create a context
export const ShopContext = createContext(null);

// Helper function to initialize the default cart
const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < all_product.length+1; index++) {
    cart[index] = 0; // Initialize each product's quantity to 0
  }
  return cart;
};

// Context Provider component
const ShopContextProvider = (props) => {
  const [cartItems, setCartItems] = useState(getDefaultCart());
  
  

  const addToCart = (itemId) =>
  {
    setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))
    console.log(cartItems);
  }
  const removeFromCart = (itemId) =>
    {
      setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}))
    }

    const getTotalCartAmount = () =>{
      let totalAmount=0;
      for(const item in cartItems)
      {
        if(cartItems[item]>0)
        {
          let itemInfo= all_product.find((product)=>product.id===Number(item))
          totalAmount += itemInfo.new_price*cartItems[item];
        }
       
      }
      return totalAmount;
    }

    const getTotalCartItems= () =>{
      let totalItem=0;
      for(const item in cartItems)
      {
        if(cartItems[item]>0)
        {
          totalItem+=cartItems[item]
        }
      }
      return totalItem;
    }

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
