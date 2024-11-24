import React from "react";
import "./Admin.css";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { Routes, Route } from "react-router-dom";
import AddProduct from "../../Components/AddProduct/AddProduct";

const Admin = () => {
  return (
    <div className="admin">
      <Sidebar />
      <div className="admin-content">
        <Routes>
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/listproduct" element={<AddProduct />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
