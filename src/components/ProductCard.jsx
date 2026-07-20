import { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { CurrencyContext } from "../context/CurrencyContext";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";
import "../styles/ProductCard.css";
import { FaShoppingCart, FaStar, FaRegStar, FaStarHalfAlt, FaTruck, FaGlobe, FaHeart, FaRegHeart } from "react-icons/fa";

const ProductCard = ({ product }) => {
  const { addToCart, cart } = useContext(CartContext);
  const { currency, changeCurrency, rates } = useContext(CurrencyContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const isAdmin = user?.isAdmin === true; // 🔥 ADMIN CHECK

  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);

  useEffect(() => {
    if (!product?._id) return;

    const fetchDeliveryEstimate = async () => {
      try {
        const token = sessionStorage.getItem("authToken");

        const res = await axios.get(
          `${API_BASE_URL}/api/delivery/estimate/${product._id}`,
          token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {} // ✅ Guest call (no token)
        );

        if (res.data.deliveryAvailable) {
          setDeliveryInfo(res.data);
        } else {
          setDeliveryInfo(null);
        }
      } catch (err) {
        setDeliveryInfo(null);
      }
    };

    fetchDeliveryEstimate();
  }, [product?._id]);




  useEffect(() => {
    if (!product?._id) return;

    const fetchRating = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/reviews/${product._id}`);
        const reviews = Array.isArray(res.data) ? res.data : [];
        setReviewCount(reviews.length);

        if (reviews.length > 0) {
          const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
          setRating((total / reviews.length).toFixed(1));
        } else {
          const defaultRating = (Math.random() * (4.4 - 3.9) + 3.9).toFixed(1);
          setRating(defaultRating);
        }
      } catch (err) {
        const defaultRating = (Math.random() * (4.4 - 3.9) + 3.9).toFixed(1);
        setRating(defaultRating);
        setReviewCount(0);
      }
    };

    fetchRating();
  }, [product?._id]);

  // Wishlist check
  useEffect(() => {
    if (isAdmin) {
      setIsWishlisted(false);
      return;
    }

    const checkWishlistStatus = async () => {
      if (!user || !product?._id) return setIsWishlisted(false);

      try {
        const token = sessionStorage.getItem("authToken");
        const res = await axios.get(`${API_BASE_URL}/api/wishlist/check/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsWishlisted(res.data.isWishlisted);
      } catch (err) {
        setIsWishlisted(false);
      }
    };

    checkWishlistStatus();
  }, [user, product?._id, isAdmin]);

  // ⭐ RESTORED — Your original wishlist function
  const toggleWishlist = async () => {
    if (!user) return navigate("/login");

    setWishlistLoading(true);
    try {
      const token = sessionStorage.getItem("authToken");
      if (isWishlisted) {
        await axios.delete(`${API_BASE_URL}/api/wishlist/${product._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsWishlisted(false);
      } else {
        await axios.post(
          `${API_BASE_URL}/api/wishlist`,
          { productId: product._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsWishlisted(true);
      }
    } catch (err) {
      toast.error("Failed to update wishlist. Please try again.");
    } finally {
      setWishlistLoading(false);
    }
  };

  const imageUrl =
    typeof product.image === "string" && product.image.startsWith("http")
      ? product.image                              // ✅ Azure Blob
      : Array.isArray(product.images) &&
        typeof product.images[0] === "string" &&
        product.images[0].startsWith("http")
        ? product.images[0]                          // ✅ Azure Blob fallback
        : "/default-product.png";


  const inCart = cart.find((p) => p._id === product._id);

  const currencySymbols = {
    GBP: "£",
    INR: "₹",
    USD: "$",
    EUR: "€",
    AUD: "A$",
    CAD: "C$",
    JPY: "¥",
  };

  const convertPrice = (priceGBP) => {
    if (!rates) return `${priceGBP.toFixed(2)} GBP`;
    const rate = rates[currency] || 1;
    const converted = priceGBP * rate;

    if (["INR", "JPY"].includes(currency))
      return `${currencySymbols[currency]}${Math.round(converted)}`;

    return `${currencySymbols[currency]}${converted.toFixed(2)}`;
  };

  const originalPriceGBP = Number(product.price) || 0;
  const discountedPriceGBP = product.discount
    ? originalPriceGBP - (originalPriceGBP * product.discount) / 100
    : null;

  const isOutOfStock = product.stock === 0;

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
    return <>{stars}</>;
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      qty: 1,
      selectedSize: product.sizes?.[0] || "",
      deliveryDate: deliveryInfo?.deliveryDate || null,
      deliveryDays: deliveryInfo?.deliveryDays || 10,
    });
  };

  return (
    <div className="pc-card">

      {/* Currency Switcher */}

      {/* <div className="pc-currency-converter">
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
                className={`pc-currency-option ${currency === cur ? "pc-currency-active" : ""
                  }`}
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
      </div> */}

      {/* ❤️ Wishlist (HIDDEN for admin) */}
      {!isAdmin && (
        <button
          className={`pc-wishlist-btn ${isWishlisted ? "pc-wishlisted" : ""}`}
          onClick={toggleWishlist}
          disabled={wishlistLoading}
        >
          {isWishlisted ? (
            <FaHeart className="pc-wishlist-icon pc-wishlist-filled" />
          ) : (
            <FaRegHeart className="pc-wishlist-icon" />
          )}
        </button>
      )}

      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="pc-link">
        <div className="pc-image-container">
          <img src={imageUrl} alt={product.name} className="pc-image" />
        </div>
        <h3 className="pc-name">{product.name}</h3>
      </Link>

      <div className="pc-discount-badge">
        {product.discount ? `${product.discount}% OFF` : "0% OFF"}
      </div>

      <div className="pc-rating-container">
        <div className="pc-stars">
          {renderStars(Number(rating))}
          <span className="pc-rating-value">{rating}</span>
        </div>
        <span className="pc-review-count">({reviewCount} Reviews)</span>
      </div>

      <div className="pc-price-container">
        {product.discount ? (
          <>
            <span className="pc-current-price">
              {convertPrice(discountedPriceGBP)}
            </span>
            <span className="pc-original-price">
              {convertPrice(originalPriceGBP)}
            </span>
            <span className="pc-discount-percent">{product.discount}% off</span>
          </>
        ) : (
          <span className="pc-current-price">
            {convertPrice(originalPriceGBP)}
          </span>
        )}
      </div>

      <div className="pc-delivery-info">
        <FaTruck className="pc-delivery-icon" />

        {deliveryInfo ? (
          <span className="pc-delivery-text">
            Free Delivery by{" "}
            <strong>
              {new Date(deliveryInfo.deliveryDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short"
              })}
            </strong>{" "}
          </span>
        ) : (
          <span className="pc-delivery-text">
            Free Delivery by{" "}
            <strong>
              {new Date(
                new Date().setDate(new Date().getDate() + 10)
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short"
              })}
            </strong>{" "}
            (10 days)
          </span>
        )}
      </div>



      {isOutOfStock ? (
        <div className="pc-out-of-stock">Out of Stock</div>
      ) : (
        <div className="pc-in-stock">In Stock</div>
      )}

      {/* 🛒 Action Buttons — HIDDEN FOR ADMIN */}
      {!isAdmin && (
        <div className="pc-action-buttons">
          {inCart ? (
            <button className="pc-go-to-cart-btn" onClick={() => navigate("/cart")}>
              <FaShoppingCart className="pc-cart-icon" /> Go to Cart
            </button>
          ) : (
            <button
              className="pc-add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <FaShoppingCart className="pc-cart-icon" /> Add to Cart
            </button>
          )}

          <button
            className="pc-buy-now-btn"
            onClick={() => navigate(`/product/${product._id}`)}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of Stock" : "Buy Now"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
