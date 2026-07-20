import { useState } from "react";
import { FaStore, FaUsers, FaBox, FaCreditCard, FaShippingFast, FaWarehouse, FaClipboardList, FaUserShield, FaRobot, FaCogs, FaBuilding, FaShoppingCart } from "react-icons/fa";

export default function FeatureSection() {
  const [showFullFeatures, setShowFullFeatures] = useState(false);

  const features = [
    {
      icon: <FaStore />,
      title: "E-Commerce Platform",
      description: "Complete online store management with user-friendly interface"
    },
    {
      icon: <FaUsers />,
      title: "User Management",
      description: "Customer profiles, wishlists, and location-based services"
    },
    {
      icon: <FaBox />,
      title: "Product Catalog",
      description: "Advanced product management with filters and search"
    },
  ];

  const fullFeatures = [
    {
      icon: <FaCreditCard />,
      title: "Payment Processing",
      description: "Multiple payment options with secure transactions"
    },
    {
      icon: <FaShippingFast />,
      title: "Delivery & Logistics",
      description: "Smart warehouse allocation and real-time tracking"
    },
    {
      icon: <FaWarehouse />,
      title: "Warehouse Management",
      description: "Multi-warehouse support with stock synchronization"
    },
    {
      icon: <FaClipboardList />,
      title: "Order Management",
      description: "Complete order lifecycle from placement to delivery"
    },
    {
      icon: <FaUserShield />,
      title: "Admin Dashboard",
      description: "Centralized control with role-based access"
    },
    {
      icon: <FaRobot />,
      title: "AI Features",
      description: "Smart recommendations and automated workflows"
    },
    {
      icon: <FaCogs />,
      title: "System Features",
      description: "Automated notifications and data export capabilities"
    },
    {
      icon: <FaBuilding />,
      title: "Department Management",
      description: "Shipping, delivery, warehouse, and support departments"
    },
    {
      icon: <FaShoppingCart />,
      title: "Purchase & Support",
      description: "Supplier management and customer support system"
    }
  ];

  return (
    <div className="feature-section">
      <h2 className="feature-heading">Platform Features</h2>
      
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
        
        {showFullFeatures && fullFeatures.map((feature, index) => (
          <div key={index + features.length} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
      
      <button
        className="toggle-features-btn"
        onClick={() => setShowFullFeatures(!showFullFeatures)}
      >
        {showFullFeatures ? "Show Less Features" : "View All Features"}
      </button>
    </div>
  );
}