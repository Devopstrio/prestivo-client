import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/CategoryPage.css";

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();

  // ORIGINAL STATE
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW STATE
  const [sortBy, setSortBy] = useState("Relevance");

  // ORIGINAL PRODUCT LOADING — UNCHANGED
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products`);
        const allProducts = res.data.products || [];

        const lower = categoryName.toLowerCase();

        const filtered = allProducts.filter(
          (p) =>
            p.category?.toLowerCase() === lower ||
            p.subCategory?.toLowerCase() === lower
        );

        setProducts(filtered);
      } catch (err) {
        console.error("❌ Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [categoryName]);

  // SORT FUNCTION — SAME AS YOUR LOGIC
  const sortProducts = (items) => {
    if (sortBy === "Price: Low to High") {
      return [...items].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "Price: High to Low") {
      return [...items].sort((a, b) => b.price - a.price);
    }
    return items;
  };

  const finalProducts = sortProducts(products);

  return (
    <>
      <Header
        setSearch={(value, key) => {
          sessionStorage.setItem("searchQuery", value);

          if (key === "Enter" && value.trim() !== "") {
            navigate("/", { state: { search: value, fromSearch: true } });
          }
        }}

        setSelectedCategory={(cat) => {
          if (cat) navigate("/", { state: { category: cat } });
        }}

        setSelectedSubCategory={(sub) => {
          if (sub) navigate("/", { state: { subCategory: sub } });
        }}

        setSelectedSubSubCategory={(subsub) => {
          if (subsub) navigate("/", { state: { subSubCategory: subsub } });
        }}
      />

      <div className="category-page" style={{ background: "white" }}>

        {/* PROFESSIONAL SORT BAR */}
        <div className="top-bar">
          <div className="sort-box">
            <label className="sort-label">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="Relevance">Relevance</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="category-products-area">
          {loading ? (
            <div className="category-loading">Loading products...</div>
          ) : finalProducts.length === 0 ? (
            <div className="category-empty">No products found.</div>
          ) : (
            <div className="category-products-grid">
              {finalProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>

      <Footer />
    </>
  );
};

export default CategoryPage;
