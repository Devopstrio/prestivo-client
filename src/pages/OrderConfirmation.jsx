import { useContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { CurrencyContext } from "../context/CurrencyContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaCheck,
  FaTimes,
  FaEdit,
  FaMoneyBillWave,
  FaCreditCard,
  FaPlusCircle,
  FaBox,
  FaShippingFast,
  FaUser,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaCreditCard as FaCard,
  FaTag,
  FaChevronDown,
  FaChevronUp,
  FaTrash
} from "react-icons/fa";
import "../styles/OrderConfirmation.css";
import "../styles/AddressModal.css";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import Footer from "../components/Footer"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const OrderConfirmation = () => {
  const { user } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const { currency, changeCurrency, rates } = useContext(CurrencyContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { cart: initialCart, deliveryDate, savings: initialSavings } = location.state || {
    cart: [],
    deliveryDate: null,
    savings: 0,
  };

  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState(deliveryDate || "");

  const [cart, setCart] = useState(initialCart);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    houseNumber: "",
    addressLine1: "",
    addressLine2: "",
    region: "",
    district: "",
    city: "",
    state: "",
    pincode: "",
    regionCode: "+44",
    mobile: "",
    latitude: null,
    longitude: null,
  });
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [savings, setSavings] = useState(initialSavings);
  // const [paypalClientId, setPaypalClientId] = useState(null);

  const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
  const [vatNumber, setVatNumber] = useState("");

  const initialLoad = useRef(true);
  const pincodeInputRef = useRef(null);
  const [expressAmountGBP, setExpressAmountGBP] = useState(0);
  const [expressAmountConverted, setExpressAmountConverted] = useState(0);
  const [freeTimeUTC, setFreeTimeUTC] = useState("06:00:00");
  const [expressTimeUTC, setExpressTimeUTC] = useState("02:00:00");
  const [codMaxAmountGBP, setCodMaxAmountGBP] = useState(0);
  const [codMaxAmountConverted, setCodMaxAmountConverted] = useState(0);

  const regionOptions = [
    { code: "+1", country: "USA/Canada" },
    { code: "+44", country: "UK" },
    { code: "+61", country: "Australia" },
    { code: "+91", country: "India" },
    { code: "+81", country: "Japan" },
    { code: "+49", country: "Germany" },
    { code: "+33", country: "France" },
    { code: "+971", country: "UAE" },
    { code: "+86", country: "China" },
  ];

  const currencySymbols = {
    GBP: "£",
    INR: "₹",
    USD: "$",
    EUR: "€",
    AUD: "A$",
    CAD: "C$",
    JPY: "¥",
  };

  const isExpressDelivery = cart.some(
    (item) => item.deliveryType === "EXPRESS"
  );

  useEffect(() => {
    const fetchExpressAmount = async () => {
      if (!isExpressDelivery) {
        setExpressAmountGBP(0);
        setExpressAmountConverted(0);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/api/customization`);
        const amountGBP = Number(res.data.expressDeliveryAmountGBP || 0);

        setExpressAmountGBP(amountGBP);

        // convert to selected currency
        const converted =
          rates && rates[currency]
            ? amountGBP * rates[currency]
            : amountGBP;

        setExpressAmountConverted(
          ["INR", "JPY"].includes(currency)
            ? Math.round(converted)
            : Number(converted.toFixed(2))
        );
      } catch (err) {
        console.error("Failed to fetch express delivery amount", err);
      }
    };

    fetchExpressAmount();
  }, [isExpressDelivery, currency, rates]);

  useEffect(() => {
    const fetchDeliveryTimes = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/customization`);
        setFreeTimeUTC(res.data.freeDeliveryTimeUTC || "06:00:00");
        setExpressTimeUTC(res.data.expressDeliveryTimeUTC || "02:00:00");
      } catch (err) {
        console.error("Failed to fetch delivery times", err);
      }
    };

    fetchDeliveryTimes();
  }, []);

  useEffect(() => {
    const fetchVat = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/${user.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
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

  useEffect(() => {
    if (!user || !user.token || cart.length === 0) return;

    const updateNearestWarehouseForOrderConfirmation = async () => {
      try {
        const productIds = cart.map(item => item._id);

        await axios.post(
          `${API_BASE_URL}/api/users/update-nearest-warehouse`,
          { productIds },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        console.log("✅ Nearest warehouses updated (Order Confirmation)");

      } catch (err) {
        console.warn("⚠️ Failed to update nearest warehouse in Order Confirmation");
      }
    };

    updateNearestWarehouseForOrderConfirmation();

  }, [cart, user]);

  useEffect(() => {
    const fetchCODLimit = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/customization`);
        const maxGBP = Number(res.data.cashOnDeliveryMaxAmountGBP || 0);

        setCodMaxAmountGBP(maxGBP);

        // Convert to selected currency
        const converted =
          rates && rates[currency]
            ? maxGBP * rates[currency]
            : maxGBP;

        setCodMaxAmountConverted(
          ["INR", "JPY"].includes(currency)
            ? Math.round(converted)
            : Number(converted.toFixed(2))
        );
      } catch (err) {
        console.error("Failed to fetch COD limit", err);
      }
    };

    fetchCODLimit();
  }, [currency, rates]);


  useEffect(() => {
    if (cart.length === 0) {
      navigate("/");
    }
  }, [cart, navigate]);

  const formatDeliveryDate = (dateInput) => {
    if (!dateInput) return "";

    const date = new Date(dateInput);

    return date.toLocaleString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };


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

  // Remove item from cart
  const removeItem = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);

    // Update savings when item is removed
    const removedItem = cart[index];
    if (removedItem.discount) {
      const originalTotal = convertPrice(removedItem.originalPrice) * removedItem.qty;
      const discountedTotal = convertPrice(removedItem.discountedPrice) * removedItem.qty;
      setSavings(prevSavings => prevSavings - (originalTotal - discountedTotal));
    }
  };

  //   useEffect(() => {
  //   const fetchPayPalKey = async () => {
  //     try {
  //       const res = await axios.get(`${API_BASE_URL}/api/paypal/client-id`);
  //       if (res.data.success) {
  //         setPaypalClientId(res.data.clientId);
  //       }
  //     } catch (error) {
  //       console.error("Failed to load PayPal Client ID", error);
  //       toast.error("Unable to load PayPal payments.");
  //     }
  //   };

  //   fetchPayPalKey();
  // }, []);


  const fetchUserDetails = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = res.data;
      const region = data.region || data.regionName || "";
      setUserDetails((prev) => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email,
        houseNumber: data.houseNumber || prev.houseNumber,
        addressLine1: data.addressLine1 || prev.addressLine1,
        addressLine2: data.addressLine2 || prev.addressLine2,
        region,
        district: data.district || prev.district,
        city: data.city || prev.city,
        state: data.state || prev.state,
        pincode: data.pincode || prev.pincode,
        regionCode: data.regionCode || prev.regionCode || "+44",
        mobile: data.mobile || prev.mobile,
      }));
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) fetchUserDetails();
  }, [user, fetchUserDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Auto-fetch address when pincode changes and is valid
  useEffect(() => {
    if (initialLoad.current || !showAddressModal) {
      if (showAddressModal) {
        initialLoad.current = false;
      }
      return;
    }

    const isValidPincode = /^\d{4,10}$/.test(userDetails.pincode.trim());

    if (isValidPincode) {
      const timer = setTimeout(() => {
        fetchAddressByPincode();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [userDetails.pincode, showAddressModal]);

  // Function to validate address
  const validateAddress = () => {
    const requiredFields = ['houseNumber', 'region', 'district', 'state', 'pincode', 'mobile'];
    const emptyFields = requiredFields.filter(field =>
      !userDetails[field] || userDetails[field].toString().trim() === ''
    );

    if (emptyFields.length > 0) {
      const fieldNames = {
        houseNumber: 'House Number',
        region: 'Region/Area',
        district: 'District',
        city: 'city',
        state: 'State',
        pincode: 'Pincode',
        mobile: 'Mobile Number'
      };

      const missingFields = emptyFields.map(field => fieldNames[field]).join(', ');
      toast.warn(`Please fill in the following address details: ${missingFields}`);
      return false;
    }

    // Validate mobile number format
    const mobileRegex = /^[0-9]{10,15}$/;
    const mobileWithoutCode = userDetails.mobile.replace(/[^0-9]/g, '');
    if (!mobileRegex.test(mobileWithoutCode)) {
      toast.warn("Please enter a valid mobile number (10-15 digits)");
      return false;
    }

    // Validate pincode format
    const pincodeRegex = /^[0-9]{4,10}$/;
    if (!pincodeRegex.test(userDetails.pincode)) {
      toast.warn("Please enter a valid pincode (4-10 digits)");
      return false;
    }

    return true;
  };

  const saveNewAddress = async () => {
    if (!user?.id) return toast.error("User not found");

    if (!validateAddress()) {
      return;
    }

    try {
      // 1️⃣ Save address & update lat/long
      await axios.put(
        `${API_BASE_URL}/api/users/${user.id}`,
        userDetails,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      // 2️⃣ Collect product IDs from cart
      const productIds = cart.map(item => item._id);

      if (productIds.length > 0) {
        // 3️⃣ Recalculate nearest warehouses (user + product stock)
        await axios.post(
          `${API_BASE_URL}/api/users/update-nearest-warehouse`,
          { productIds },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        console.log("📍 Nearest warehouse updated after address change");
      }

      // 4️⃣ Close modal
      setShowAddressModal(false);
      toast.success("Address updated & nearest warehouse recalculated!");

    } catch (err) {
      console.error("Error updating address or warehouse:", err);
      toast.error("Failed to update address");
    }
  };


  const fetchAddressByPincode = async () => {
    if (!userDetails.pincode.trim()) {
      return;
    }

    setIsFetchingAddress(true);
    try {
      const GEOAPIFY_API_KEY = "bf58eac2ef4d43d3b7c5661f657f2a03";
      const res = await axios.get("https://api.geoapify.com/v1/geocode/search", {
        params: {
          text: userDetails.pincode.trim(),
          apiKey: GEOAPIFY_API_KEY
        },
      });

      const feature = res.data.features?.[0];
      if (!feature) {
        console.warn("No address found for this postal code");
        return;
      }

      const props = feature.properties;

      const district = props.state_district || props.county || props.city || "";
      const city = props.city || props.county || "";

      let country = props.country || "";
      let countryCode = userDetails.regionCode;

      if (country === "India") {
        countryCode = "+91";
      } else if (country === "United States" || country === "Canada") {
        countryCode = "+1";
      } else if (country === "United Kingdom") {
        countryCode = "+44";
      } else if (country === "Australia") {
        countryCode = "+61";
      } else if (country === "Japan") {
        countryCode = "+81";
      } else if (country === "Germany") {
        countryCode = "+49";
      } else if (country === "France") {
        countryCode = "+33";
      } else if (country === "United Arab Emirates") {
        countryCode = "+971";
      } else if (country === "China") {
        countryCode = "+86";
      }

      setUserDetails((prev) => ({
        ...prev,
        houseNumber: prev.houseNumber,
        region: props.country,
        district: district,
        city: city,
        state: props.state || prev.state,
        country: country,
        regionCode: countryCode,
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
      }));

      console.log("Address fetched automatically for pincode:", userDetails.pincode);
    } catch (err) {
      console.error("Error fetching address:", err);
    } finally {
      setIsFetchingAddress(false);
    }
  };

  const incrementQty = (index) => {
    const updatedCart = [...cart];
    if (updatedCart[index].qty < (updatedCart[index].stock || 1)) {
      updatedCart[index].qty += 1;
    } else {
      toast.error("This product is out of stock");
    }
    setCart(updatedCart);
  };

  const decrementQty = (index) => {
    const updatedCart = [...cart];
    if (updatedCart[index].qty > 1) updatedCart[index].qty -= 1;
    setCart(updatedCart);
  };

  const getDiscountedPrice = (item) => {
    const originalPrice = convertPrice(item.originalPrice || item.price);
    if (!item.discount) return originalPrice;
    return parseFloat((originalPrice * (1 - item.discount / 100)).toFixed(2));
  };

  const itemsTotal = cart.reduce(
    (sum, item) => sum + getDiscountedPrice(item) * item.qty,
    0
  );

  const totalAmount = isExpressDelivery
    ? itemsTotal + expressAmountConverted
    : itemsTotal;

  const isCODDisabled =
    codMaxAmountGBP > 0 && totalAmount > codMaxAmountConverted;

  const placeOrder = async (paymentId = null, paymentStatusOverride = null) => {
    if (!user) return toast.warn("Please login first");

    if (!validateAddress()) {
      return;
    }

    const outOfStockItem = cart.find(item => item.qty > (item.stock || 0));
    if (outOfStockItem) return toast.error(`Product "${outOfStockItem.name}" is out of stock`);

    setLoading(true);

    const paymentStatus = paymentMethod === "cod" ? "Pending" : paymentStatusOverride || "Pending";

    const productsTable = cart.map((item) => {
      const originalPrice = convertPrice(item.originalPrice || item.price);
      const discountedPrice = getDiscountedPrice(item);

      let selectedSize = item.selectedSize || item.size || item.selectedOptions?.size || null;
      if (Array.isArray(selectedSize)) selectedSize = selectedSize.join(", ");

      const sizeInches = item.sizeInches || item.inchs || null;
      const category = item.category || "Uncategorized";
      const subCategory = item.subCategory || "N/A";
      const subSubCategory = item.subSubCategory || "N/A";

      const total = parseFloat((discountedPrice * (item.qty || 1)).toFixed(2));

      return {
        productId: item._id,
        name: item.name || "Unknown Product",
        qty: item.qty || 1,
        originalPrice,
        discount: item.discount || 0,
        discountedPrice,
        selectedSize,
        selectedOptions: item.selectedOptions || {},
        category,
        subCategory,
        subSubCategory,
        sizeInches,
        ram: item.ram || null,
        storage: item.storage || null,
        total,
      };
    });

    console.log("🆔 Product IDs sent to backend:", productsTable.map(p => p.productId));

    const finalTotalAmount = isExpressDelivery
      ? totalAmount
      : totalAmount;

    const orderData = {
      userId: user.id,
      isExpressDelivery,
      expressDeliveryCharge: isExpressDelivery ? expressAmountConverted : 0,
      userDetails: {
        name: userDetails.name || "",
        email: userDetails.email || "",
        houseNumber: userDetails.houseNumber || "",
        addressLine1: userDetails.addressLine1 || "",
        addressLine2: userDetails.addressLine2 || "",
        region: userDetails.region || "",
        district: userDetails.district || "",
        city: userDetails.city || "",
        state: userDetails.state || "",
        pincode: userDetails.pincode || "",
        regionCode: userDetails.regionCode || "+44",
        mobile: userDetails.mobile || "",
      },
      vatNumber: vatNumber || "",
      paymentMethod,
      paymentId,
      paymentStatus,
      deliveryDate: selectedDeliveryDate || deliveryDate || null,

      // ✅ Complete product data
      products: productsTable.map(item => ({
        _id: item._id || item.productId,
        name: item.name || "Unknown Product",
        qty: Number(item.qty) || 1,
        originalPrice: Number(item.originalPrice) || 0,
        discount: Number(item.discount) || 0,
        discountedPrice: Number(item.discountedPrice) || 0,
        total: Number(item.total) || 0,

        // ✅ Category info
        category: item.category || "Uncategorized",
        subCategory: item.subCategory || "N/A",
        subSubCategory: item.subSubCategory || "N/A",

        // ✅ Sizes and variations
        selectedSize: item.selectedSize || null,
        sizeInches: item.sizeInches || null,
        size: Array.isArray(item.size) ? item.size : (item.size ? [item.size] : []),

        // ✅ Product attributes (copied from Product schema)
        color: item.color || "",
        material: item.material || "",
        fit: item.fit || "",
        brand: item.brand || "",
        warranty: item.warranty || "",

        ram: Array.isArray(item.ram) ? item.ram : (item.ram ? [item.ram] : []),
        storage: Array.isArray(item.storage) ? item.storage : (item.storage ? [item.storage] : []),
        type: Array.isArray(item.type) ? item.type : (item.type ? [item.type] : []),

        processor: item.processor || "",
        displaySize: item.displaySize || "",
        battery: item.battery || "",
        camera: item.camera || "",
        screenSize: item.screenSize || "",
        inchs: item.inchs || "",
        skinType: item.skinType || "",
        hairType: item.hairType || "",
        fragranceType: item.fragranceType || "",
        language: item.language || "",
        author: item.author || "",
        genre: item.genre || "",
        format: item.format || "",
        packSize: item.packSize || "",
        organic: item.organic || "",
        model: item.model || "",
        power: item.power || "",
        capacity: item.capacity || "",
        weight: item.weight || "",

        // ✅ Additional or dynamic options (optional)
        selectedOptions: item.selectedOptions || {},
        extraDetails: item.extraDetails || {},
      })),

      totalAmount: Number(totalAmount) || 0,
      currency,
      orderStatus: { placeOrder: true, shipping: false, delivery: false },
      createdAt: new Date().toISOString(),
    };

    console.log("🆔 Product IDs being sent to backend:", orderData.products.map(p => p._id));


    try {
      await axios.post(`${API_BASE_URL}/api/orders`, orderData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success("Order placed successfully!");
      clearCart();
      navigate("/myorders");
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.error || "Failed to place order. Please check stock availability."
      );
    }

    setLoading(false);
  };

  const renderSizeInfo = (item) => {
    if (item.selectedSize) return item.selectedSize;
    if (item.size) return item.size;
    if (item.selectedOptions?.size) return item.selectedOptions.size;
    if (item.inchs) return `${item.inchs} inches`;
    return "N/A";
  };

  const isElectronics = (item) => {
    const electronicsCategories = ["electronics", "computers", "phones", "laptops", "tablets"];
    return item.category && electronicsCategories.includes(item.category.toLowerCase());
  };

  return (
    <>
      <Navbar />
      <div className="order-confirmation-container">
        {/* Header Section with Gradient */}
        <div className="order-confirmation-header">
          <h1>Order Confirmation</h1>
          <p className="order-confirmation-subtitle">
            Review your order details and complete your purchase
          </p>
        </div>

        {/* Currency Selection */}
        {/* <div className="currency-section">
          <div className="currency-selector">
            <label htmlFor="currency">Select Currency: </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => changeCurrency(e.target.value)}
            >
              {Object.keys(currencySymbols).map((cur) => (
                <option key={cur} value={cur}>
                  {cur} ({currencySymbols[cur]})
                </option>
              ))}
            </select>
          </div>
        </div> */}

        {/* Main Content Grid */}
        <div className="order-summary-main">
          {/* User Information Card */}
          <div className="section">
            <h3>
              <FaUser style={{ marginRight: "10px" }} />
              Your Information
            </h3>
            <div className="user-info-grid">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={userDetails.name}
                onChange={handleChange}
                className="input-field"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={userDetails.email}
                onChange={handleChange}
                className="input-field"
                disabled
              />
              <select
                name="regionCode"
                value={userDetails.regionCode}
                onChange={handleChange}
                className="input-field"
              >
                {regionOptions.map((option, index) => (
                  <option key={index} value={option.code}>
                    {option.country} ({option.code})
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="mobile"
                placeholder="Mobile Number"
                value={userDetails.mobile}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <button onClick={saveNewAddress} className="btn btn-primary" id="btn-primary">
              <FaEdit /> Update Information
            </button>
          </div>

          {/* Delivery Address Card */}
          <div className="section">
            <h3>
              <FaMapMarkerAlt style={{ marginRight: "10px" }} />
              Delivery Address
            </h3>
            <div className="address-display">
              {userDetails.houseNumber && userDetails.region && userDetails.district && userDetails.state && userDetails.pincode ? (
                <p>{userDetails.houseNumber},
                  {userDetails.addressLine1 && `${userDetails.addressLine1} `},
                  {userDetails.addressLine2 && `${userDetails.addressLine2} `}, {userDetails.city},{userDetails.district}, {userDetails.state}, {userDetails.region} - {userDetails.pincode}</p>
              ) : (
                <p className="address-warning">
                  <FaTimes /> Please complete your address details to place an order
                </p>
              )}
              <p><strong>Phone:</strong> {userDetails.regionCode} {userDetails.mobile}</p>
            </div>
            <button onClick={() => setShowAddressModal(true)} className="btn btn-primary" id="btn-primary">
              <FaEdit /> Change / Add Address
            </button>
          </div>

          {/* Delivery Date Card */}
          {deliveryDate && (
            <div className="section">
              <h3>
                <FaShippingFast style={{ marginRight: "10px" }} />
                Delivery Information
              </h3>

              <div className="delivery-info">
                <p>
                  <strong>
                    {isExpressDelivery ? "Express Delivery by:" : "Free Delivery by:"}
                  </strong>{" "}
                  {formatDeliveryDate(
                    applyUTCTimeToDate(
                      deliveryDate,
                      isExpressDelivery ? expressTimeUTC : freeTimeUTC
                    )
                  )}
                </p>


              </div>
            </div>
          )}


          {/* Products Card */}
          <div className="section">
            <h3>
              <FaShoppingCart style={{ marginRight: "10px" }} />
              Order Items ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </h3>
            <div className="product-cards-grid">
              {cart.map((item, index) => {
                const originalPrice = convertPrice(item.originalPrice || item.price);
                const discountedPrice = getDiscountedPrice(item);
                const inStock = item.qty <= (item.stock || 0);
                const electronicItem = isElectronics(item);

                return (
                  <div
                    key={index}
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
                        {item.discount && item.discount > 0 && (
                          <div className="discount-badge">
                            <FaTag size={10} />
                            {item.discount}% OFF
                          </div>
                        )}
                      </div>

                      <div className="product-basic-info">
                        <h4 className="product-name">{item.name || "Unknown Product"}</h4>

                        <div className="product-category">
                          <FaBox className="category-icon" />
                          {item.category || "N/A"}
                          {item.subCategory && ` › ${item.subCategory}`}
                          {item.subSubCategory && ` › ${item.subSubCategory}`}
                        </div>

                        <div className={`stock-status ${inStock ? 'stock-in' : 'stock-out'}`}>
                          {inStock ? <FaCheck /> : <FaTimes />}
                          {inStock ? "In Stock" : "Out of Stock"}
                        </div>
                      </div>
                    </div>

                    {/* Pricing and Quantity */}
                    <div className="card-pricing">
                      <div className="discount-pricing">
                        {item.discount && item.discount > 0 ? (
                          <>
                            <span className="original-price">
                              {currencySymbols[currency]}{originalPrice}
                            </span>
                            <span className="current-price">
                              {currencySymbols[currency]}{discountedPrice}
                            </span>
                            <span className="discount-tag">
                              Save {currencySymbols[currency]}{(
                                originalPrice - discountedPrice
                              ).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="current-price">
                            {currencySymbols[currency]}{originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="quantity-section">
                        <label>Quantity:</label>
                        <div className="quantity-controls">
                          <button
                            onClick={() => decrementQty(index)}
                            className="quantity-btn"
                            disabled={item.qty <= 1}
                          >
                            -
                          </button>
                          <span className="quantity-display">{item.qty}</span>
                          <button
                            onClick={() => incrementQty(index)}
                            className="quantity-btn"
                            disabled={!inStock}
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
                        {currencySymbols[currency]}{(discountedPrice * item.qty).toFixed(2)}
                      </span>
                    </div>

                    {/* Expandable Details */}
                    {/* Expandable Details */}
                    <div className="card-details">
                      <button
                        className="toggle-details-btn"
                        onClick={() => toggleCardExpansion(index)}
                      >
                        {expandedCard === index ? (
                          <>
                            <FaChevronUp size={12} />
                            Hide Specifications
                          </>
                        ) : (
                          <>
                            <FaChevronDown size={12} />
                            Show Specifications
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
                );
              })}
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="section">
            <h3>
              <FaCard style={{ marginRight: "10px" }} />
              Payment Method
            </h3>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="payment-option-content">
                  <FaCreditCard />
                  Online Payment
                </div>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={isCODDisabled}
                />
                <div className="payment-option-content">
                  <FaMoneyBillWave />
                  Cash on Delivery
                </div>
              </label>
            </div>

            {isCODDisabled && (
              <p style={{ color: "#d9534f", marginTop: "10px", fontSize: "14px", marginLeft: "10px" }}>
                Cash on Delivery is available only for orders up to{" "}
                <strong>
                  {currencySymbols[currency]}
                  {codMaxAmountConverted}
                </strong>
              </p>
            )}<br />

            {/* Payment Buttons */}
            {paymentMethod === "online" ? (
              <div className="paypal-container">
                <PayPalScriptProvider
                  options={{
                    "client-id": paypalClientId || "",
                    currency: "GBP",
                  }}
                >
                  <PayPalButtons
                    style={{ layout: "vertical", color: "blue", shape: "rect", label: "paypal" }}
                    createOrder={(data, actions) => {

                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: totalAmount.toFixed(2),
                              currency_code: "GBP",
                            },
                            description: `Order from Store (${currency} converted to USD)`,
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      const order = await actions.order.capture();
                      // console.log("PayPal Payment Successful:", order);
                      await placeOrder(order.id, "Completed");
                      toast.success("Payment successful! Your order has been placed.");
                    }}
                    onCancel={() => toast.error("Payment cancelled by user.")}
                    onError={(err) => {
                      // console.error("PayPal Checkout Error:", err);
                      toast.error("Something went wrong with PayPal checkout.");
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            ) : (
              <button
                onClick={() => placeOrder()}
                className={`btn btn-success ${loading ? 'loading' : ''}`}
                disabled={loading || cart.some(item => item.qty > (item.stock || 0)) || cart.length === 0}
                id="btn-primary"
              >
                {loading
                  ? "Processing..."
                  : cart.some(item => item.qty > (item.stock || 0))
                    ? "Out of Stock"
                    : cart.length === 0
                      ? "Cart is Empty"
                      : "Place Order (Cash on Delivery)"}
              </button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="order-summary-sidebar">
          <div className="summary-card">
            <h3>Order Summary</h3>

            <div className="summary-line">
              <span>Subtotal ({cart.length} items):</span>
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

            {isExpressDelivery && expressAmountConverted > 0 && (
              <div className="summary-line express">
                <span>Express Delivery:</span>
                <span className="express-price">
                  + {currencySymbols[currency]}{expressAmountConverted}
                </span>
              </div>
            )}

            <div className="summary-divider"></div>

            <div className="summary-line total">
              <span>Total Amount:</span>
              <span>{currencySymbols[currency]}{totalAmount.toFixed(2)}</span>
            </div>

            <div className="summary-line vat">
              <span>VAT Number:</span>
              <span className={vatNumber ? "" : "no-vat"}>
                {vatNumber || "Not Provided"}
              </span>
            </div>

            <div className="security-notice">
              <FaCheck />
              Secure Payment • 100% Protected
            </div>
          </div>
        </div>

        {/* Address Modal */}
        {showAddressModal && (
          <div className="address-modal-overlay">
            <div className="address-modal-content">
              <div className="address-modal-header">
                <h3 className="updaddhead" style={{ color: "white" }}>Update Delivery Address</h3>
                <button
                  className="address-modal-close"
                  onClick={() => setShowAddressModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="address-form-grid">
                {/* Add New Address Button */}
                <div className="form-group full-width">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    id="btn-secondary"
                    onClick={() =>
                      setUserDetails((prev) => ({
                        ...prev,
                        houseNumber: "",
                        region: "",
                        district: "",
                        state: "",
                        pincode: "",
                        mobile: "",
                      }))
                    }
                  >
                    <FaPlusCircle /> Add New Address
                  </button>
                </div>

                {/* Pincode at the top */}
                <div className="form-group">
                  <label htmlFor="pincode">
                    Pincode
                    {isFetchingAddress && (
                      <span className="loading-text"> (Fetching address...)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    placeholder="Enter pincode to auto-fill address"
                    value={userDetails.pincode}
                    onChange={handleChange}
                    className="form-input"
                    required
                    ref={pincodeInputRef}
                  />
                  <div className="pincode-hint" id="pincode-hint">
                    Address will be automatically fetched when you enter a valid pincode
                  </div>
                </div>

                {[
                  { key: 'houseNumber', label: 'Door No. / Plot No.' },
                  { key: 'addressLine1', label: 'Street / Area' },
                  { key: 'addressLine2', label: 'Nearby LandMark' },
                  { key: 'region', label: 'Region' },
                  { key: 'city', label: 'City' },
                  { key: 'district', label: 'District' },
                  { key: 'state', label: 'State' },
                  { key: 'mobile', label: 'Mobile' }
                ].map(({ key, label }) => (
                  <div className={`form-group ${key === 'mobile' ? 'full-width' : ''}`} key={key}>
                    <label htmlFor={key}>{label}</label>
                    <input
                      type="text"
                      id={key}
                      name={key}
                      placeholder={`Enter ${label}`}
                      value={userDetails[key]}
                      onChange={handleChange}
                      className="form-input"
                      required={key === 'mobile'}
                      disabled={['region', 'city', 'district', 'state'].includes(key)}
                      style={{ textAlign: "left" }}
                    />
                  </div>
                ))}

                <div className="form-group">
                  <label htmlFor="regionCode">Country Code</label>
                  <select
                    id="regionCode"
                    name="regionCode"
                    value={userDetails.regionCode}
                    onChange={handleChange}
                    className="form-input"
                    style={{ textAlign: "left" }}

                  >
                    {regionOptions.map((option, idx) => (
                      <option key={idx} value={option.code}>
                        {option.country} ({option.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="address-modal-actions">
                <button
                  className="btn btn-cancel"
                  onClick={() => setShowAddressModal(false)}
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  className="btn btn-save"
                  onClick={saveNewAddress}
                >
                  <FaCheck /> Save Address
                </button>
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

export default OrderConfirmation;