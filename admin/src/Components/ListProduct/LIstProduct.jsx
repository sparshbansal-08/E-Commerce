import React from "react";
import "./ListProduct.css";
import { useEffect, useState } from "react";
import cross_icon from "../../assets/cross_icon.png";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);

  const fetchInfo = async () => {
    try {
      const response = await fetch("http://localhost:4000/allproducts");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setAllProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_product = async (id) => {
    try {
      const response = await fetch("http://localhost:4000/removeproduct", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        console.error("Error removing product:", result.message);
        alert("Failed to remove product. Please try again.");
        return;
      }

      console.log("Product removed successfully");
      fetchInfo(); // Refresh product list
    } catch (error) {
      console.error("Error in remove_product:", error);
    }
  };

  return (
    <div className="list-product">
      <h1>All Products List</h1>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product, index) => (
          <React.Fragment key={index}>
            <div className="listproduct-format-main listproduct-format">
              <img
                src={product.image}
                alt=""
                className="listproduct-product-icon"
              />
              <p>{product.name}</p>
              <p>${product.old_price}</p>
              <p>${product.new_price}</p>
              <p>{product.category}</p>
              <img
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this product?"
                    )
                  ) {
                    remove_product(product.id);
                  }
                }}
                src={cross_icon}
                alt="Remove Product"
                className="listproduct-remove-icon"
              />
            </div>
            <hr />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;
