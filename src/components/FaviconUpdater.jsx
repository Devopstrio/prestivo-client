// src/components/FaviconUpdater.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import "../styles/Loader.css";
import { useLocation } from "react-router-dom";

const FaviconUpdater = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/company`);
        if (res.data?.data) {
          setCompany(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching company details:", err);
      } finally {
        setTimeout(() => setLoading(false), 1500);
      }
    };
    fetchCompany();
  }, []);

  useEffect(() => {
    if (!company) return;

    /* =========================
       ✅ FAVICON UPDATE
    ========================= */
    if (company.logoUrl) {
      let link =
        document.querySelector("link[rel~='icon']") ||
        document.createElement("link");

      link.rel = "icon";
      link.href = company.logoUrl;
      document.head.appendChild(link);
    }

    /* =========================
       ✅ SEO TITLE + DESCRIPTION
    ========================= */
    if (location.pathname === "/") {
      // 🏠 Home page SEO
      document.title = `${company.name} | Online Shopping for Electronics, Fashion, Grocery & More`;

      // ✅ Meta Description (hidden from UI)
      let metaDesc = document.querySelector("meta[name='description']");
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }

      metaDesc.content =
        "Shop online at Prestivo for electronics, fashion, beauty, grocery, home essentials and more. Best prices, fast delivery & easy returns.";
    } else {
      // 📄 Other pages
      document.title = company.name;
    }
  }, [company, location.pathname]);

  /* =========================
     ✅ LOADER UI (ONLY LOADING)
  ========================= */
  if (loading) {
    return (
      <div className="favicon-loader">
        {company?.logoUrl && (
          <img
            src={company.logoUrl}
            alt="Company Logo"
            className="favicon-logo"
          />
        )}
        <div className="favicon-spinner"></div>
      </div>
    );
  }

  return null; // ✅ Nothing shown in UI
};

export default FaviconUpdater;
