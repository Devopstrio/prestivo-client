import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CurrencyContext } from "../context/CurrencyContext";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_BASE_URL from "../config";
import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaGlobe,
  FaHeart,
  FaRegHeart
} from "react-icons/fa";
import "../styles/ProductCard.css";

const RelatedProductCard = ({ product }) => {
  const { currency, changeCurrency, rates } = useContext(CurrencyContext);
  const { user } = useContext(AuthContext);

  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const imageUrl = product.image
    ? product.image
    : product.images?.[0] || "/default-product.png";

  // Fetch rating
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/reviews/${product._id}`);
        const reviews = Array.isArray(res.data) ? res.data : [];
        setReviewCount(reviews.length);

        if (reviews.length > 0) {
          const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
          setRating((total / reviews.length).toFixed(1));
        } else {
          setRating((Math.random() * (4.4 - 3.9) + 3.9).toFixed(1));
        }
      } catch {
        setRating((Math.random() * (4.4 - 3.9) + 3.9).toFixed(1));
      }
    };
    fetchRating();
  }, [product._id]);

  const currencySymbols = {
    GBP: "£",
    INR: "₹",
    USD: "$",
    EUR: "€",
    AUD: "A$",
    CAD: "C$",
    JPY: "¥",
  };

  const convertPrice = (price) => {
    if (!rates) return price.toFixed(2);
    const converted = price * (rates[currency] || 1);
    return ["INR", "JPY"].includes(currency)
      ? `${currencySymbols[currency]}${Math.round(converted)}`
      : `${currencySymbols[currency]}${converted.toFixed(2)}`;
  };

  const discountedPriceGBP = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= full) stars.push(<FaStar key={i} className="pc-star-icon pc-star-filled" />);
      else if (i === full + 1 && half)
        stars.push(<FaStarHalfAlt key={i} className="pc-star-icon pc-star-half" />);
      else stars.push(<FaRegStar key={i} className="pc-star-icon" />);
    }
    return stars;
  };

  return (
    <div className="pc-card">
      
      {/* Currency Converter */}
      <div className="pc-currency-converter">
        <button 
          className="pc-currency-toggle"
          onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
        >
          <FaGlobe className="pc-globe-icon" />
          {currency} ({currencySymbols[currency]})
        </button>

        {showCurrencyDropdown && (
          <div className="pc-currency-dropdown">
            {Object.keys(currencySymbols).map((cur) => (
              <button
                key={cur}
                className={`pc-currency-option ${currency === cur ? "pc-currency-active" : ""}`}
                onClick={() => {
                  changeCurrency(cur);
                  setShowCurrencyDropdown(false);
                }}
              >
                {cur} ({currencySymbols[cur]})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Wishlist */}
      <button className="pc-wishlist-btn">
        {isWishlisted ? (
          <FaHeart className="pc-wishlist-icon pc-wishlist-filled" />
        ) : (
          <FaRegHeart className="pc-wishlist-icon" />
        )}
      </button>

      {/* Image */}
      <Link to={`/product/${product._id}`} className="pc-link">
        <div className="pc-image-container">
          <img src={imageUrl} alt={product.name} className="pc-image" />
        </div>
        <h3 className="pc-name">{product.name}</h3>
      </Link>

      {/* Discount */}
      <div className="pc-discount-badge">
        {product.discount ? `${product.discount}% OFF` : "0% OFF"}
      </div>

      {/* Rating */}
      <div className="pc-rating-container">
        <div className="pc-stars">
          {renderStars(Number(rating))}
          <span className="pc-rating-value">{rating}</span>
        </div>
        <span className="pc-review-count">({reviewCount} Reviews)</span>
      </div>

      {/* Price */}
      <div className="pc-price-container">
        <span className="pc-current-price">{convertPrice(discountedPriceGBP)}</span>
        {product.discount > 0 && (
          <>
            <span className="pc-original-price">{convertPrice(product.price)}</span>
            <span className="pc-discount-percent">{product.discount}% off</span>
          </>
        )}
      </div>

    </div>
  );
};

export default RelatedProductCard;
