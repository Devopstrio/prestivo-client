import { useContext, useState,useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import { CartContext } from "../context/CartContext";
import { CurrencyContext } from "../context/CurrencyContext";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Chatbot from "../components/Chatbot";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { calculateDeliveryDate } from "../utils/deliveryUtils";
import "../styles/CartPage.css";

// Import icons for better visual appeal
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingBag,
  FaTruck,
  FaCheck,
  FaStar,
  FaShoppingCart,
  FaArrowLeft
} from "react-icons/fa";

// Star component with improved styling
const StarRating = ({ filled }) => (
  <span className={`cart-star-icon ${filled ? 'cart-star-filled' : 'cart-star-empty'}`}>
    ★
  </span>
);

const CartPage = () => {
  const { cart, removeFromCart, updateQty } = useContext(CartContext);
  const { currency, rates, changeCurrency } = useContext(CurrencyContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState([]);

  const currencySymbols = {
    GBP: "£",
    INR: "₹",
    USD: "$",
    EUR: "€",
    AUD: "A$",
    CAD: "C$",
    JPY: "¥"
  };

  const convertPrice = (priceGBP) => {
    if (!rates) return priceGBP.toFixed(2);
    const rate = rates[currency] || 1;
    const converted = priceGBP * rate;
    return ["INR", "JPY"].includes(currency) ? Math.round(converted) : converted.toFixed(2);
  };

  const handleChangeQty = (id, size, newQty) => {
    if (newQty < 1) return;
    updateQty(id, newQty, size);
  };

  useEffect(() => {
  const fetchLatestDeliveryDates = async () => {
    try {
      const token = sessionStorage.getItem("authToken");

      const updatedCart = await Promise.all(
        cart.map(async (item) => {
          try {
            const res = await axios.get(
              `${API_BASE_URL}/api/delivery/estimate/${item._id}`,
              token
                ? { headers: { Authorization: `Bearer ${token}` } }
                : {}
            );

            if (res.data.deliveryAvailable) {
              return {
                ...item,
                deliveryDays: res.data.deliveryDays,
                deliveryDate: res.data.deliveryDate,
              };
            }

            return item;
          } catch {
            return item;
          }
        })
      );

      // 🔥 Update cart context (IMPORTANT)
      updatedCart.forEach((item) => {
        updateQty(item._id, item.qty, item.selectedSize, {
          deliveryDays: item.deliveryDays,
          deliveryDate: item.deliveryDate,
        });
      });

    } catch (err) {
      console.error("Failed to refresh delivery dates", err);
    }
  };

  if (cart.length > 0) {
    fetchLatestDeliveryDates();
  }
}, [cart.length]);


  const handleCheckout = () => {

    if (!user) {
      toast.error("Please login to order the product.");
      navigate("/login");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Please select at least one product to checkout.");
      return;
    }
    const totalAmount = selectedItems.reduce((acc, item) => {
      const originalPrice = Number(item.price) || 0;
      const discountedPrice = item.discount
        ? originalPrice - (originalPrice * item.discount) / 100
        : originalPrice;
      const itemPrice = parseFloat(convertPrice(discountedPrice)) || 0;
      return acc + itemPrice * (item.qty || 0);
    }, 0);

    const itemsWithDeliveryDate = selectedItems.map(item => ({
      ...item,
      deliveryDate: calculateDeliveryDate(item.deliveryDays).toISOString(),
    }));

    navigate("/checkout", {
      state: {
        checkoutItems: itemsWithDeliveryDate,
        totalAmount
      },
    });
  };

  const toggleSelectItem = (item) => {
    const exists = selectedItems.find((i) => i._id === item._id && i.selectedSize === item.selectedSize);
    if (exists) {
      setSelectedItems(selectedItems.filter((i) => !(i._id === item._id && i.selectedSize === item.selectedSize)));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...cart]);
    }
  };

  const renderStars = (r = 0) => {
    const stars = [];
    const rounded = Math.round(r);
    for (let i = 1; i <= 5; i++) stars.push(<StarRating key={i} filled={i <= rounded} />);
    return <div className="cart-rating-stars">{stars}</div>;
  };

  // Calculate cart totals
  const cartTotal = selectedItems.reduce((acc, item) => {
    const originalPrice = Number(item.price) || 0;
    const discountedPrice = item.discount
      ? originalPrice - (originalPrice * item.discount) / 100
      : originalPrice;
    const itemPrice = parseFloat(convertPrice(discountedPrice)) || 0;
    return acc + itemPrice * (item.qty || 0);
  }, 0);

  const cartCount = selectedItems.reduce((acc, item) => acc + (item.qty || 0), 0);
  const totalItems = cart.reduce((acc, item) => acc + (item.qty || 0), 0);

  return (
    <>
      <Navbar />
      <div className="cart-page-wrapper">
        {/* Header Section */}
        <div className="cart-header-banner">
          <div className="cart-header-inner">
            <div className="cart-title-area">
              <div className="cart-main-title">
                <FaShoppingCart className="cart-title-symbol" />
                <h1 style={{ color: "white" }}>Shopping Cart</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Cart Content */}
        {cart.length === 0 ? (
          <div className="cart-empty-state">
            <div className="cart-empty-content">
              <div className="cart-empty-icon">
                <FaShoppingBag />
              </div>
              <h2>Your Shopping Cart is Empty</h2>
              <p>Discover amazing products and add them to your cart</p>
              <Link to="/" className="cart-primary-btn">
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="cart-content-area">
            {/* Cart Items Section */}
            <div className="cart-items-panel">
              <div className="cart-items-header-panel">
                <div className="cart-select-all">
                  <label className="cart-checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === cart.length && cart.length > 0}
                      onChange={toggleSelectAll}
                      className="cart-checkbox-input"
                    />
                    <span className="cart-checkbox-visual"></span>
                    Select all ({cart.length} items)
                  </label>
                </div>
                <div className="cart-header-price">Price</div>
              </div>

              <div className="cart-items-container">
                {cart.map((item, index) => {
                  const originalPrice = Number(item.price) || 0;
                  const discountedPrice = item.discount
                    ? originalPrice - (originalPrice * item.discount) / 100
                    : originalPrice;
                  const convertedOriginal = convertPrice(originalPrice);
                  const convertedDiscounted = convertPrice(discountedPrice);
                  const itemTotal = (parseFloat(convertedDiscounted) || 0) * (item.qty || 0);
                  const rating = item.rating ? item.rating : (Math.random() * (4.4 - 3.9) + 3.9).toFixed(1);
                  const isOutOfStock = item.stock === 0;
                  const isSelected = !!selectedItems.find((i) => i._id === item._id && i.selectedSize === item.selectedSize);

                  return (
                    <div key={`${item._id}-${item.selectedSize || "no-size"}-${index}`} className="cart-product-card">
                      <div className="cart-product-content">
                        {/* Selection Checkbox */}
                        <div className="cart-product-select">
                          <label className="cart-checkbox-wrapper">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectItem(item)}
                              className="cart-checkbox-input"
                            />
                            <span className="cart-checkbox-visual"></span>
                          </label>
                        </div>

                        {/* Product Image */}
                        <div className="cart-product-image-wrapper">
                          {item.image ? (
                            <Link to={`/product/${item._id}`} className="cart-product-image-link">
                              <img
                                src={item.image}
                                alt={item.name || "Product image"}
                                className="cart-product-img"
                                onError={(e) => {
                                  e.target.src = "/placeholder.png";
                                  e.target.onerror = null;
                                }}
                              />
                            </Link>
                          ) : (
                            <div className="cart-image-placeholder">
                              <FaShoppingBag />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="cart-product-details">
                          <div className="cart-product-main-info">
                            <Link to={`/product/${item._id}`} className="cart-product-name">
                              {item.name || "Product"}
                            </Link>

                            <div className="cart-product-rating">
                              {renderStars(rating)}
                              <span className="cart-rating-value">({rating})</span>
                            </div>

                            {item.selectedSize && (
                              <div className="cart-product-size">
                                <span className="cart-size-label">Size:</span>
                                <span className="cart-size-value">{item.selectedSize}</span>
                              </div>
                            )}

                            <div className="cart-stock-info">
                              {isOutOfStock ? (
                                <span className="cart-stock-badge cart-stock-out">
                                  <FaMinus className="cart-status-icon" />
                                  Out of Stock
                                </span>
                              ) : (
                                <span className="cart-stock-badge cart-stock-in">
                                  <FaCheck className="cart-status-icon" />
                                  In Stock
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="cart-delivery-info">
                            <FaTruck />
                            <span>
                              Free Delivery by{" "}
                              <strong>
                                {calculateDeliveryDate(item.deliveryDays).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </strong>
                            </span>
                          </div>

                          {/* Item Actions */}
                          <div className="cart-product-actions">
                            <div className="cart-quantity-control">
                              <button
                                onClick={() => handleChangeQty(item._id, item.selectedSize, (item.qty || 1) - 1)}
                                disabled={item.qty <= 1}
                                className="cart-quantity-btn"
                                aria-label="Decrease quantity"
                              >
                                <FaMinus />
                              </button>
                              <span className="cart-quantity-display">{item.qty || 1}</span>
                              <button
                                onClick={() => handleChangeQty(item._id, item.selectedSize, (item.qty || 1) + 1)}
                                disabled={item.qty >= item.stock}
                                className="cart-quantity-btn"
                                aria-label="Increase quantity"
                              >
                                <FaPlus />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item._id, item.selectedSize)}
                              className="cart-remove-btn"
                            >
                              <FaTrash className="cart-remove-icon" />
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Pricing Information */}
                        <div className="cart-product-pricing">
                          <div className="cart-price-display">
                            {item.discount ? (
                              <>
                                <div className="cart-current-price">
                                  {currencySymbols[currency]}{convertedDiscounted}
                                </div>
                                <div className="cart-original-price">
                                  {currencySymbols[currency]}{convertedOriginal}
                                </div>
                                <div className="cart-discount-tag">
                                  Save {item.discount}%
                                </div>
                              </>
                            ) : (
                              <div className="cart-current-price cart-no-discount">
                                {currencySymbols[currency]}{convertedOriginal}
                              </div>
                            )}
                          </div>
                          <div className="cart-item-total">
                            Total: {currencySymbols[currency]}{itemTotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="cart-summary-panel">
              <div className="cart-summary-card">
                <div className="cart-summary-header">
                  <h3>Order Summary</h3>
                </div>

                <div className="cart-summary-content">
                  <div className="cart-summary-row">
                    <span className="cart-summary-label">Items ({cartCount}):</span>
                    <span className="cart-summary-value">{currencySymbols[currency]}{cartTotal.toFixed(2)}</span>
                  </div>

                  <div className="cart-summary-row">
                    <span className="cart-summary-label">Shipping:</span>
                    <span className="cart-summary-value cart-free-shipping">
                      <FaTruck className="cart-shipping-icon" id="cart-shipping-icon" />
                      FREE
                    </span>
                  </div>

                  <div className="cart-summary-divider"></div>

                  <div className="cart-summary-row cart-total-row">
                    <span className="cart-total-label">Total Amount:</span>
                    <span className="cart-total-value">{currencySymbols[currency]}{cartTotal.toFixed(2)}</span>
                  </div>
                  <p className="cart-selected-count">Selected Items : ({selectedItems.length})</p>
                  <button
                    onClick={handleCheckout}
                    className={`cart-checkout-btn ${selectedItems.length === 0 ? 'cart-btn-disabled' : ''}`}
                    disabled={selectedItems.length === 0}
                  >
                    <FaShoppingBag className="cart-checkout-symbol" />
                    <p className="cart-checkout-text" id="cart-checkout-text">Proceed to Checkout</p>
                  </button>

                  <Link to="/" className="cart-continue-shopping">
                    <FaArrowLeft className="cart-continue-icon" />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <Chatbot />
      </div>
      <Footer />
    </>
  );
};

export default CartPage;