import React from "react";
import ShopCategory from "./ShopCategory";

// This could be part of a main page or layout
const ShopPage = () => {
  return (
    <div>
      <ShopCategory category="Men" banner="/images/men-banner.jpg" />
      <ShopCategory category="Women" banner="/images/women-banner.jpg" />
      <ShopCategory category="Kids" banner="/images/kids-banner.jpg" />
    </div>
  );
};

export default ShopPage;
