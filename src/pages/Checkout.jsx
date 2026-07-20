import { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { CurrencyContext } from "../context/CurrencyContext";
import "../styles/Checkout.css";
import API_BASE_URL from "../config";
import {
  FaPlusCircle,
  FaTrash,
  FaCheckCircle,
  FaMoneyBillWave,
  FaChevronDown,
  FaChevronUp,
  FaShippingFast,
  FaTag,
  FaBox,
  FaFolder,
  FaFolderOpen,
  FaSmileBeam
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import Footer from "../components/Footer"

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { currency, changeCurrency, rates } = useContext(CurrencyContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [expandedCard, setExpandedCard] = useState(null);
  const [savings, setSavings] = useState(0);
  const [deliveryMap, setDeliveryMap] = useState({});
  const [freeTimeUTC, setFreeTimeUTC] = useState("06:00:00");
  const [expressTimeUTC, setExpressTimeUTC] = useState("02:00:00");
  const [vatNumber, setVatNumber] = useState("");

  const currencySymbols = {
    GBP: "£", INR: "₹", USD: "$", EUR: "€",
    AUD: "A$", CAD: "C$", JPY: "¥"
  };
  useEffect(() => {
    const fetchVat = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/${user.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`, // if required
          },
        });

        setVatNumber(res.data.vatNumber || "");
      } catch (err) {
        console.error("Failed to fetch VAT");
      }
    };

    if (user?.id) {
      fetchVat();
    }
  }, [user]);

  const convertPrice = (priceGBP) => {
    const priceNumber = Number(priceGBP) || 0;
    if (!rates || !rates[currency]) return priceNumber.toFixed(2);
    const converted = priceNumber * rates[currency];
    return ["INR", "JPY"].includes(currency) ? Math.round(converted) : parseFloat(converted.toFixed(2));
  };

  const getImageUrl = (img) => {
    if (!img) return "/placeholder.png";
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    return `${API_BASE_URL}${img}`;
  };

  const calculateItemTotal = (item) => {
    return convertPrice(item.discountedPrice) * item.qty;
  };

  // Toggle card expansion
  const toggleCardExpansion = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  useEffect(() => {
    if (!user || !user.token || checkoutItems.length === 0) return;

    const updateNearestWarehouseForCheckout = async () => {
      try {
        const productIds = checkoutItems.map(item => item._id);

        await axios.post(
          `${API_BASE_URL}/api/users/update-nearest-warehouse`,
          { productIds },   // 🔥 SEND ALL PRODUCTS AT ONCE
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        console.log("✅ Nearest warehouses updated for checkout (multi-product)");

      } catch (err) {
        console.warn("⚠️ Failed to update nearest warehouse in checkout");
      }
    };

    updateNearestWarehouseForCheckout();

  }, [checkoutItems, user]);


  useEffect(() => {
    const fetchCustomization = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/customization`);

        setFreeTimeUTC(res.data.freeDeliveryTimeUTC || "06:00:00");
        setExpressTimeUTC(res.data.expressDeliveryTimeUTC || "02:00:00");

      } catch (err) {
        console.error("Failed to fetch customization time", err);
      }
    };

    fetchCustomization();
  }, []);




  // Load items from sessionStorage
  useEffect(() => {
    if (location.state?.checkoutItems) return
    const storedItems = sessionStorage.getItem("checkoutItems");
    if (storedItems) {
      const items = JSON.parse(storedItems);
      setCheckoutItems(items);

      // Calculate savings
      const totalSavings = items.reduce((total, item) => {
        if (item.discount) {
          const originalTotal = convertPrice(item.originalPrice) * item.qty;
          const discountedTotal = convertPrice(item.discountedPrice) * item.qty;
          return total + (originalTotal - discountedTotal);
        }
        return total;
      }, 0);
      setSavings(totalSavings);
    }
  }, [location.state]);

  // Handle incoming items
  useEffect(() => {
    if (location.state?.checkoutItems) {
      const incomingItems = location.state.checkoutItems.map((item) => {
        const originalPrice = Number(item.price) || 0;
        const discountedPrice = item.discount
          ? originalPrice - (originalPrice * item.discount) / 100
          : originalPrice;
        return {
          ...item,
          originalPrice,
          discountedPrice,
          selectedSize: item.selectedSize || "",
        };
      });

      setCheckoutItems((prevItems) => {
        const merged = [...prevItems];

        incomingItems.forEach((item) => {
          const index = merged.findIndex(
            (i) => i._id === item._id && i.selectedSize === item.selectedSize
          );

          if (index !== -1) {
            // ✅ UPDATE existing product (FREE ↔ EXPRESS switch)
            merged[index] = {
              ...merged[index],
              ...item,
            };
          } else {
            // ✅ ADD new product
            merged.push(item);
          }
        });

        sessionStorage.setItem("checkoutItems", JSON.stringify(merged));
        return merged;
      });

    } else if (checkoutItems.length === 0) {
      navigate("/cart");
    }
  }, [location.state, navigate]);

  const applyUTCTimeToDate = (baseDate, utcTime) => {
    if (!baseDate || !utcTime) return baseDate;

    const [h, m, s] = utcTime.split(":").map(Number);
    const d = new Date(baseDate);

    return new Date(Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      h,
      m,
      s || 0
    ));
  };




  const formatDeliveryDate = (dateInput) => {
    const date = new Date(dateInput);

    return date.toLocaleString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const overallDeliveryDate = (() => {
    if (checkoutItems.length === 0) return null;

    // Use the latest delivery date among all items
    const dates = checkoutItems
      .map(item => item.deliveryDate)
      .filter(Boolean)
      .map(d => new Date(d));

    if (dates.length === 0) return null;

    return new Date(Math.max(...dates)).toISOString();
  })();





  // Update totals and session storage
  useEffect(() => {
    if (checkoutItems.length > 0) {
      sessionStorage.setItem("checkoutItems", JSON.stringify(checkoutItems));
      const total = checkoutItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
      setTotalAmount(total);

      // Recalculate savings when currency changes
      const totalSavings = checkoutItems.reduce((total, item) => {
        if (item.discount) {
          const originalTotal = convertPrice(item.originalPrice) * item.qty;
          const discountedTotal = convertPrice(item.discountedPrice) * item.qty;
          return total + (originalTotal - discountedTotal);
        }
        return total;
      }, 0);
      setSavings(totalSavings);
    }
  }, [checkoutItems, currency]);

  const handleConfirmOrder = () => {
    if (!user || !user.token) {
      toast.error("Please log in to proceed with payment.");
      return;
    }

    const hasExpress = checkoutItems.some(
      (item) => item.deliveryType === "EXPRESS"
    );

    const expressItem = checkoutItems.find(
      (item) => item.deliveryType === "EXPRESS"
    );

    navigate("/orderconfirmation", {
      state: {
        cart: checkoutItems,
        totalAmount,
        currency,
        deliveryDate: expressItem?.deliveryDate || overallDeliveryDate || null,
        isExpressDelivery: hasExpress, // ✅ NEW
        savings,
      },
    });

    sessionStorage.removeItem("checkoutItems");
  };



  const incrementQty = (index) => {
    const updatedItems = checkoutItems.map((item, i) =>
      i === index ? { ...item, qty: item.qty + 1 } : item
    );
    setCheckoutItems(updatedItems);
  };

  const decrementQty = (index) => {
    const updatedItems = checkoutItems.map((item, i) =>
      i === index && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
    );
    setCheckoutItems(updatedItems);
  };

  const removeItem = (index) => {
    const updatedItems = checkoutItems.filter((_, i) => i !== index);
    setCheckoutItems(updatedItems);
    sessionStorage.setItem("checkoutItems", JSON.stringify(updatedItems));
    if (expandedCard === index) setExpandedCard(null);
  };

  const handleAddProduct = () => {
    navigate("/cart");
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="checkout-container">
        <Navbar />
        <div className="empty-checkout">
          <FaBox className="empty-icon" size={64} />
          <h2>Your Cart is Empty</h2>
          <p>Add some products to proceed with checkout</p>
          <button onClick={handleAddProduct} className="add-product-btn">
            <FaPlusCircle style={{ marginRight: "8px" }} />
            Continue Shopping
          </button>
        </div>
        <Chatbot />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="checkout-container">
        {/* Header Section */}
        <div className="checkout-header">
          <h1>Secure Checkout</h1>
          <p className="checkout-subtitle">Review your order and complete your purchase</p>
        </div>

        {/* Currency Selection */}
        <div className="currency-section">
          <div className="currency-selector">
            <span className="happy-checkout-text">
              <FaSmileBeam style={{ marginRight: "8px", color: "#4CAF50" }} />
              Happy Checkout
            </span>
          </div>

          <button onClick={handleAddProduct} className="add-product-btn">
            <FaPlusCircle style={{ marginRight: "8px" }} />
            Add Product
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="order-summary">
          <h2 className="section-title">
            <FaBox style={{ marginRight: "10px" }} />
            Order Summary ({checkoutItems.length} {checkoutItems.length === 1 ? 'item' : 'items'})
          </h2>

          <div className="product-cards-grid">
            {checkoutItems.map((item, index) => (
              <div
                key={`${item._id}-${index}`}
                className={`product-card ${expandedCard === index ? 'expanded' : ''}`}
              >
                {/* Card Header */}
                <div className="card-header">
                  <div className="product-image-container">
                    <img
                      src={getImageUrl(item.image || (item.images && item.images[0]))}
                      alt={item.name}
                      className="product-image"
                    />
                    {item.discount && (
                      <div className="discount-badge">
                        <FaTag size={10} />
                        {item.discount}% OFF
                      </div>
                    )}
                  </div>

                  <div className="product-basic-info">
                    <h3 className="product-name">{item.name}</h3>

                    <div className="product-category">
                      <FaFolder className="category-icon" style={{ fontSize: "18px" }} />
                      {item.category}
                      {item.subCategory && ` › ${item.subCategory}`}
                      {item.subSubCategory && ` › ${item.subSubCategory}`}
                    </div>

                    <div className="delivery-info">
                      <FaShippingFast className="delivery-icon" />
                      <span>
                        {item.deliveryType === "EXPRESS" ? "Express Delivery by " : "Free Delivery by "}
                        <strong>
                          {formatDeliveryDate(
                            applyUTCTimeToDate(
                              item.deliveryDate
                                ? item.deliveryDate
                                : new Date(new Date().setDate(new Date().getDate() + 10)),
                              item.deliveryType === "EXPRESS"
                                ? expressTimeUTC   // 🔥 EXPRESS ADMIN TIME
                                : freeTimeUTC      // 🔥 FREE ADMIN TIME
                            )
                          )}
                        </strong>
                      </span>

                    </div>


                  </div>
                </div>

                {/* Pricing and Quantity */}
                <div className="card-pricing">
                  <div className="discount-pricing">
                    {item.discount ? (
                      <>
                        <span className="original-price">
                          {currencySymbols[currency]}{convertPrice(item.originalPrice)}
                        </span>
                        <span className="current-price">
                          {currencySymbols[currency]}{convertPrice(item.discountedPrice)}
                        </span>
                        <span className="discount-tag">
                          Save {currencySymbols[currency]}{(
                            convertPrice(item.originalPrice) - convertPrice(item.discountedPrice)
                          ).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="current-price">
                        {currencySymbols[currency]}{convertPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="quantity-section">
                    <label>Qty:</label>
                    <div className="quantity-controls">
                      <button
                        onClick={() => decrementQty(index)}
                        className="quantity-btn" id="quantity-btn"
                        disabled={item.qty <= 1}
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.qty}</span>
                      <button
                        onClick={() => incrementQty(index)}
                        className="quantity-btn" id="quantity-btn"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Item Total */}
                <div className="item-total-section">
                  <span className="item-total-label">Item Total:</span>
                  <span className="item-total-amount">
                    {currencySymbols[currency]}{calculateItemTotal(item).toFixed(2)}
                  </span>
                </div>
                {/* Expandable Details */}
                <div className="card-details">
                  <button
                    className="toggle-details-btn"
                    onClick={() => toggleCardExpansion(index)}
                  >
                    {expandedCard === index ? (
                      <>
                        <FaChevronUp size={12} />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <FaChevronDown size={12} />
                        Show Details
                      </>
                    )}
                  </button>

                  {expandedCard === index && (
                    <div className="expanded-details">
                      <div className="detail-grid">
                        {Object.entries({
                          Brand: item.brand,
                          Color: item.color,
                          Material: item.material,
                          Fit: item.fit,
                          RAM: Array.isArray(item.ram) ? item.ram.join(", ") : item.ram,
                          ROM: Array.isArray(item.storage) ? item.storage.join(", ") : item.storage,
                          Type: Array.isArray(item.type) ? item.type.join(", ") : item.type,
                          Processor: item.processor,
                          "Display Size": item.displaySize,
                          Battery: item.battery,
                          Camera: item.camera,
                          "Screen Size": item.screenSize,
                          Inches: item.inchs,
                          Size: item.selectedSize || (Array.isArray(item.size) ? item.size.join(", ") : item.size),
                          "Skin Type": item.skinType,
                          "Hair Type": item.hairType,
                          "Fragrance Type": item.fragranceType,
                          Language: item.language,
                          Author: item.author,
                          Genre: item.genre,
                          Format: item.format,
                          "Pack Size": item.packSize,
                          Organic: item.organic,
                          Model: item.model,
                          Power: item.power,
                          Capacity: item.capacity,
                          Weight: item.weight,
                        }).map(([label, value]) =>
                          value ? (
                            <div key={label} className="detail-item">
                              <strong>{label}:</strong> {value}
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}
                </div>


                {/* Remove Button */}
                <button
                  onClick={() => removeItem(index)}
                  className="remove-item-btn"
                >
                  <FaTrash size={14} />
                  Remove Item
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="order-summary-sidebar">
          <div className="summary-card">
            <h3>Order Total</h3>

            <div className="summary-line">
              <span>Subtotal ({checkoutItems.length} items):</span>
              <span>{currencySymbols[currency]}{totalAmount.toFixed(2)}</span>
            </div>

            {savings > 0 && (
              <div className="summary-line discount">
                <span>Discounts:</span>
                <span>-{currencySymbols[currency]}{savings.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-line shipping">
              <span>Shipping:</span>
              <span className="free-shipping">FREE</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-line total">
              <span>Total Amount:</span>
              <span>{currencySymbols[currency]}{totalAmount.toFixed(2)}</span>
            </div>
            <div className="summary-line vat">
              <span>VAT Number:</span>

              {vatNumber ? (
                <span>{vatNumber}</span>
              ) : (
                <span className="no-vat">Not Provided</span>
              )}
            </div>

            <button className="confirm-order-btn" onClick={handleConfirmOrder}>
              <FaCheckCircle style={{ marginRight: "8px" }} />
              Confirm Order
            </button>

            <div className="security-notice">
              <FaMoneyBillWave style={{ marginRight: "8px" }} />
              Secure Payment • 100% Protected
            </div>
          </div>
        </div>

        <Chatbot />
      </div>
      <Footer />
    </>
  );
};

export default Checkout;