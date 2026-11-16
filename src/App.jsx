
import { useState, useEffect } from "react";
import { Routes, Route,Navigate } from "react-router-dom";

import Navbar from "./webpage/Navbar";
import HeroSlider from "./webpage/HeroSlider";
import TailoringServices from "./webpage/Service";
import Loader from "./components/Loader";
import Blog from "./webpage/Blog";
import Contact from "./webpage/Contact";

import Login from "./admin page/Login";
import Dashboard from "./admin page/Dashboard";
import Customers from "./admin page/Customers";
import Measurements from "./admin page/measurements";
import Orders from "./admin page/Orders";
import Billing from "./admin page/Billing";
import Report from "./admin page/Report";
import "./App.css";

// Customer Website
function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/posts/1"
        );

        const result = await response.json();

        console.log("API Data:", result);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="relative">
        <Navbar />
        <HeroSlider />
      </div>

      <TailoringServices />
      <Blog />
      <Contact />
    </>
  );
}

// Main Application
function App() {
  return (
    <Routes>
       <Route
    path="/admin"
    element={<Navigate to="/admin/dashboard" replace />}
  />
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/customers" element={<Customers />} />
      <Route path="/admin/measurements" element={<Measurements />} />
      <Route path="/admin/orders" element={<Orders />} />
      <Route path="/admin/billing" element={<Billing />} />
      <Route path="/admin/report" element={<Report />} />
    </Routes>
  );
}

export default App;
