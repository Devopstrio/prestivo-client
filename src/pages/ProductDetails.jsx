import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { CurrencyContext } from "../context/CurrencyContext";
import Header from "../components/Header";
import RelatedProductCard from "../components/RelatedProductCard";
import Chatbot from "../components/Chatbot";
import Footer from "../components/Footer";
import "../styles/ProductDetails.css";
import "../styles/LoadingAnimation.css";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FaStar, FaRegStar, FaStarHalfAlt, FaTruck, FaShare, FaHeart, FaShoppingCart, FaCalendarAlt, FaStore, FaCashRegister, FaChevronRight, FaFilter, FaTimes, FaSpinner, FaShippingFast } from "react-icons/fa";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const { addToCart, cart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { currency, changeCurrency, rates } = useContext(CurrencyContext);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSubCategory, setHoveredSubCategory] = useState(null);

  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ comment: "", rating: 5 });
  const [editingReview, setEditingReview] = useState(null);
  const [overallRating, setOverallRating] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedSize, setSelectedSize] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [company, setCompany] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isInCart, setIsInCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [expressAmountGBP, setExpressAmountGBP] = useState(0);
  const [expressDays, setExpressDays] = useState("");
  const [deliveryType, setDeliveryType] = useState("FREE"); // FREE | EXPRESS
  const [freeTimeUTC, setFreeTimeUTC] = useState(null);
  const [expressTimeUTC, setExpressTimeUTC] = useState(null);

  const currencySymbols = { GBP: "£", INR: "₹", USD: "$", EUR: "€", AUD: "A$", CAD: "C$", JPY: "¥" };

  const isAdmin = user?.isAdmin === true;

  const convertPrice = (priceGBP) => {
    if (!rates || !rates[currency]) return priceGBP.toFixed(2);
    const converted = priceGBP * rates[currency];
    if (["INR", "JPY"].includes(currency)) return Math.round(converted);
    return parseFloat(converted.toFixed(2));
  };

  const getImageUrl = (img) => {
    if (!img) return "/placeholder.png"; // fallback image
    if (img.startsWith("http") || img.startsWith("data:")) return img; // full URL or base64
    return `${API_BASE_URL}${img}`; // relative path from server
  };

  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/categories`);
        setCategories(res.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!user || !user.token || !product?._id) return;

    axios.post(
      `${API_BASE_URL}/api/users/update-nearestproduct-warehouse`,
      { productId: product._id },
      {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      }
    ).catch(() => {
      console.warn("Nearest warehouse update failed");
    });

  }, [product?._id, user]);


  useEffect(() => {
    if (!product) return;

    const fetchRelatedProducts = async () => {
      try {
        // Fetch ALL products
        const res = await axios.get(`${API_BASE_URL}/api/products`);
        const allProducts = res.data.products || [];

        // Step 1: Filter by subSubCategory if available
        let filtered = allProducts.filter(
          (p) =>
            p._id !== product._id &&
            p.subSubCategory === product.Category
        );

        // Step 2: Fallback: If no subSubCategory matches, use subCategory
        if (filtered.length === 0) {
          filtered = allProducts.filter(
            (p) =>
              p._id !== product._id &&
              p.subCategory === product.subCategory
          );
        }

        // Step 3: Optional fallback to general category
        if (filtered.length === 0) {
          filtered = allProducts.filter(
            (p) =>
              p._id !== product._id &&
              p.category === product.category
          );
        }

        setRelatedProducts(filtered);
      } catch (error) {
        console.error("Error fetching related products:", error);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  // ⭐ Scroll to top whenever product ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const handleMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => setIsZooming(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/company`);
        setCompany(res.data.data);
      } catch (err) {
        console.error("Error fetching company details:", err);
        setCompany({
          name: "Bhumi Creation IN",
          rating: 3.8,
          ratingsCount: 6166
        });
      }
    };
    fetchCompanyData();
  }, []);



  useEffect(() => {
    const fetchCustomization = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/customization`);

        setExpressAmountGBP(res.data.expressDeliveryAmountGBP || 0);

        setFreeTimeUTC(res.data.freeDeliveryTimeUTC || "06:00:00");
        setExpressTimeUTC(res.data.expressDeliveryTimeUTC || "02:00:00");

        // ✅ NEW — EXPRESS DAYS FROM CUSTOMIZATION
        setExpressDays(res.data.expressDeliveryDays ?? 2);

      } catch (err) {
        console.error("Failed to fetch express delivery amount");
      }
    };

    fetchCustomization();
  }, []);


  const applyUTCTimeToExistingDate = (baseDate, utcTime) => {
    if (!baseDate || !utcTime) return baseDate;

    const [h, m, s] = utcTime.split(":").map(Number);

    const date = new Date(baseDate);

    // ✅ Create UTC date (IMPORTANT)
    const utcDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      h,
      m,
      s || 0
    ));

    // ✅ Browser auto converts UTC → user local time
    return utcDate;
  };

  useEffect(() => {
    if (!id) return;

    const fetchDeliveryEstimate = async () => {
      try {
        const token = sessionStorage.getItem("authToken");

        const res = await axios.get(
          `${API_BASE_URL}/api/delivery/estimate/${id}`,
          token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {} // ✅ guest
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
  }, [id]);

  const formatDeliveryDate = (dateInput) => {
    if (!dateInput) return "";

    return new Date(dateInput).toLocaleString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getExpressDeliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + expressDays);
    return d;
  };


  const getExpressAmountConverted = () => {
    if (!rates || !rates[currency]) return expressAmountGBP;
    const converted = expressAmountGBP * rates[currency];
    return ["INR", "JPY"].includes(currency)
      ? Math.round(converted)
      : parseFloat(converted.toFixed(2));
  };




  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // 🔥 PASS size to backend (default M if not selected)
        const sizeParam = selectedSize || "M";

        const res = await axios.get(
          `${API_BASE_URL}/api/products/${id}?size=${sizeParam}`
        );

        const productData = res.data;

        // ✅ Fetch nearest warehouse data from sessionStorage
        const sessionData = sessionStorage.getItem("nearestWarehouse");
        const userData = sessionStorage.getItem("user");
        let nearestWarehouses = [];

        if (sessionData) {
          try {
            nearestWarehouses = JSON.parse(sessionData);
          } catch {
            console.warn("⚠️ Failed to parse nearestWarehouse from session");
            nearestWarehouses = [];
          }
        }

        // ✅ If user is not logged in → default 10 days delivery
        if (!userData) {
          const deliveryDateObj = new Date();
          deliveryDateObj.setDate(deliveryDateObj.getDate() + 10);
          deliveryDateObj.setHours(10, 0, 0, 0);

          const formattedDate = deliveryDateObj.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          setDeliveryDate(formattedDate);
          setProduct({
            ...productData,
            deliveryDate: deliveryDateObj,
            nearestWarehouse: "Default Warehouse",
            selectedSize: sizeParam, // ✅ ensure synced
          });

          setSelectedImage(
            productData.images && productData.images.length > 0
              ? productData.images[0]
              : productData.image || null
          );

          return;
        }

        // ✅ Determine delivery date based on stock availability
        let deliveryDays = 3;
        let foundWarehouse = null;

        for (let i = 0; i < nearestWarehouses.length; i++) {
          const nw = nearestWarehouses[i];
          const productWarehouse = productData.warehouseDetails.find(
            (w) => w.warehouseId === nw.warehouseId._id
          );

          if (productWarehouse && productWarehouse.availableStock > 0) {
            foundWarehouse = productWarehouse;
            break;
          } else {
            deliveryDays += 1;
          }
        }

        if (!foundWarehouse) deliveryDays += 2;

        const deliveryDateObj = new Date();
        deliveryDateObj.setDate(deliveryDateObj.getDate() + deliveryDays);
        deliveryDateObj.setHours(10, 0, 0, 0);

        const formattedDate = deliveryDateObj.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        // ✅ FINAL STATE UPDATE
        setDeliveryDate(formattedDate);
        setProduct({
          ...productData,
          deliveryDate: deliveryDateObj,
          nearestWarehouse: foundWarehouse?.warehouseName || "Default Warehouse",
          selectedSize: sizeParam, // 🔥 IMPORTANT
        });

        setSelectedImage(
          productData.images && productData.images.length > 0
            ? productData.images[0]
            : productData.image || null
        );
      } catch (err) {
        console.error("Failed to fetch product:", err);
      }
    };

    fetchProduct();
  }, [id, selectedSize]); // 🔥 size change triggers backend price update

  const getSizeStock = (size) => {
    if (!product?.warehouseStocks) return 0;

    return product.warehouseStocks.reduce((total, wh) => {
      const sizeEntry = wh.sizeStocks?.find(s => s.size === size);
      return total + (Number(sizeEntry?.stock) || 0);
    }, 0);
  };


  // ✅ Fetch wishlist details
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user || !user.token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const wishlistItems = res.data;
        const exists = wishlistItems.some((item) => item._id === id);
        setIsWishlisted(exists);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    };
    fetchWishlist();
  }, [id, user]);

  // ✅ Add or remove wishlist
  const handleWishlist = async () => {
    if (!user || !user.token) {
      toast.error("Please log in to use wishlist.");
      return;
    }

    try {
      if (isWishlisted) {
        navigate("/wishlist");
      } else {
        await axios.post(
          `${API_BASE_URL}/api/wishlist`,
          { productId: id },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error("Error updating wishlist:", err);
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/reviews/${id}`);
        setReviews(res.data);

        if (res.data.length > 0) {
          const total = res.data.reduce((sum, r) => sum + r.rating, 0);
          setOverallRating((total / res.data.length).toFixed(1));
        } else {
          const defaultRating = (Math.random() * (4.5 - 4.0) + 4.0).toFixed(1);
          setOverallRating(defaultRating);
        }
      } catch (err) {
        console.error(err);
        const defaultRating = (Math.random() * (4.5 - 4.0) + 4.0).toFixed(1);
        setOverallRating(defaultRating);
      }
    };
    fetchReviews();
  }, [id]);

  // Check if product is in cart
  useEffect(() => {
    if (product && cart) {
      const inCartItem = cart.find((p) => p._id === product._id && p.selectedSize === selectedSize);
      setIsInCart(!!inCartItem);
    }
  }, [product, cart, selectedSize]);

  if (!product) {
    return (
      <div className="pp-loading-container">
        <div className="pp-loading-content">
          <FaSpinner className="pp-loading-spinner" />
          <h3>Loading</h3>
          <p>Please Wait while details are loading</p>
        </div>
      </div>
    );
  }


  const originalPriceGBP = Number(product.price) || 0;
  const discountedPriceGBP = product.discount
    ? originalPriceGBP - (originalPriceGBP * product.discount) / 100
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || !user.token) return toast.warn("Please log in to submit a review.");

    if (editingReview) {
      axios
        .put(
          `${API_BASE_URL}/api/reviews/${editingReview._id}`,
          newReview,
          { headers: { Authorization: `Bearer ${user.token}` } }
        )
        .then((res) => {
          setReviews(reviews.map((rev) => (rev._id === res.data._id ? res.data : rev)));
          setEditingReview(null);
          setNewReview({ comment: "", rating: 5 });
        })
        .catch(console.error);
    } else {
      axios
        .post(
          `${API_BASE_URL}/api/reviews/${id}`,
          newReview,
          { headers: { Authorization: `Bearer ${user.token}` } }
        )
        .then((res) => {
          setReviews([res.data, ...reviews]);
          setNewReview({ comment: "", rating: 5 });
        })
        .catch(console.error);
    }
  };

  const handleDelete = (reviewId) => {
    if (!user || !user.token) return;
    axios
      .delete(`${API_BASE_URL}/api/reviews/${reviewId}`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(() => setReviews(reviews.filter((rev) => rev._id !== reviewId)))
      .catch(console.error);
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setNewReview({ comment: review.comment, rating: review.rating });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: "Check out this product!",
        url: window.location.href,
      }).catch(err => console.error("Error sharing:", err));
    } else {
      toast.error("Sharing not supported in this browser.");
    }
  };

  const handleAddToCart = () => {
    if (shouldShowSizeSelector()) {
      if (!selectedSize) {
        toast.error("Please select a size before adding to cart.");
        return;
      }

      if (getSizeStock(selectedSize) === 0) {
        toast.error("Selected size is out of stock.");
        return;
      }
    }

    addToCart({
      ...product,
      qty,
      selectedOptions,
      selectedSize,
      subCategory: product.subCategory || null,
      subSubCategory: product.subSubCategory || null,
      deliveryDate: deliveryInfo?.deliveryDate || null,
      deliveryDays: deliveryInfo?.deliveryDays || 10,
    });

    setIsInCart(true);
  };


  const handleGoToCart = () => {
    navigate("/cart");
  };

  const handleCheckout = () => {
    if (!user || !user.token) {
      toast.error("Please log in to proceed to checkout.");
      return;
    }

    // Check if size is required but not selected
    if (shouldShowSizeSelector()) {
      if (!selectedSize) {
        toast.error("Please select a size before checkout.");
        return;
      }

      if (getSizeStock(selectedSize) === 0) {
        toast.error("Selected size is out of stock.");
        return;
      }
    }

    const finalDeliveryDate =
      deliveryType === "EXPRESS"
        ? getExpressDeliveryDate().toISOString()
        : deliveryInfo?.deliveryDate ||
        new Date(new Date().setDate(new Date().getDate() + 10)).toISOString();

    navigate("/checkout", {
      state: {
        checkoutItems: [
          {
            ...product,
            qty,
            selectedOptions,
            selectedSize,
            deliveryType,                // ✅ NEW
            deliveryDate: finalDeliveryDate, // ✅ NEW
            expressFeeGBP:
              deliveryType === "EXPRESS" ? expressAmountGBP : 0, // ✅ NEW
          },
        ],
        currency,
      }
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="pd-star-icon pd-star-filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="pd-star-icon pd-star-half" />);
      } else {
        stars.push(<FaRegStar key={i} className="pd-star-icon" />);
      }
    }

    return <>{stars}</>;
  };

  const incrementQty = () => { if (qty < product.stock) setQty(qty + 1); };
  const decrementQty = () => { if (qty > 1) setQty(qty - 1); };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const isClothingCategory = () => {
    if (!product.category) return false;
    const category = product.category.toLowerCase();
    return category.includes('clothing') || category.includes('fashion') || category.includes('apparel');
  };

  const isFootwearCategory = () => {
    if (!product.category) return false;
    const category = product.category.toLowerCase();
    return category.includes('footwear') || category.includes('shoe');
  };

  const isHomeCategory = () => {
    if (!product.category) return false;
    const category = product.category.toLowerCase();
    return category.includes('home') || category.includes('furniture');
  };

  const isElectronicsCategory = () => {
    if (!product.category) return false;
    const category = product.category.toLowerCase();
    return category.includes("electronics") || category.includes("mobile");
  };

  const shouldShowSizeSelector = () => {

    const subSub = product.subSubCategory?.toLowerCase() || "";

    // ❌ Hide size selector for Sarees in subSubCategory
    if (subSub === "sarees" || subSub === "saree") return false;

    return (isClothingCategory() || isFootwearCategory()) && !isHomeCategory() && !isElectronicsCategory();
  };

  const shouldShowSizeInfo = () => {
    return product.size && !isHomeCategory() && !isElectronicsCategory();
  };

  const SizeSelector = () => {
    let sizes = [];
    if (product.size && Array.isArray(product.size) && product.size.length > 0) {
      sizes = product.size;
    } else if (product.size && typeof product.size === 'string') {
      sizes = product.size.split(',').map(s => s.trim());
    } else {
      sizes = isFootwearCategory() ? ["7", "8", "9", "10", "11", "12"] : ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL",];
    }

    return (
      <div className="pd-size-selector">
        <h4 className="pd-spec-subtitle">Select Size</h4>

        {shouldShowSizeSelector() && (
          <div className="pd-size-grid">
            {sizes.map((size) => {
              const stock = getSizeStock(size); // 🔥 size-wise stock
              const isOutOfStock = stock === 0;

              return (
                <div
                  key={size}
                  className={`pd-size-option
                ${selectedSize === size ? "pd-size-selected" : ""}
                ${isOutOfStock ? "pd-size-disabled" : ""}
              `}
                  onClick={() => {
                    if (!isOutOfStock) {
                      handleSizeSelect(size);
                    }
                  }}
                >
                  <div className="pd-size-label">{size}</div>

                </div>
              );
            })}
          </div>
        )}

        {!selectedSize && shouldShowSizeSelector() && (
          <div className="pd-size-warning">Please select a size</div>
        )}
      </div>
    );

  };

  const renderProductSpecifications = () => {
    // Category hierarchy
    const categorySpecs = [
      product.category,
      product.subCategory,
      product.subSubCategory,
    ].filter(Boolean);

    // Product detail mapping (label + dynamic value)
    const detailMapping = {
      Brand: product.brand,
      Color: product.color,
      Material: product.material,
      Fit: product.fit,
      RAM: Array.isArray(product.ram) ? product.ram.join(", ") : product.ram,
      ROM: Array.isArray(product.storage) ? product.storage.join(", ") : product.storage,
      Type: Array.isArray(product.type) ? product.type.join(", ") : product.type,
      Processor: product.processor,
      "Display Size": product.displaySize,
      Battery: product.battery,
      Camera: product.camera,
      "Screen Size": product.screenSize,
      Inches: product.inchs,
      Size: shouldShowSizeInfo()
        ? Array.isArray(product.size)
          ? product.size.join(", ")
          : product.size
        : null,
      "Skin Type": product.skinType,
      "Hair Type": product.hairType,
      "Fragrance Type": product.fragranceType,
      Language: product.language,
      Author: product.author,
      Genre: product.genre,
      Format: product.format,
      "Pack Size": product.packSize,
      Organic: product.organic,
      Model: product.model,
      Power: product.power,
      Capacity: product.capacity,
      Weight: product.weight,
    };

    // Filter out only non-empty fields
    const productDetails = Object.entries(detailMapping).filter(([_, value]) => Boolean(value));

    return (
      <div className="pd-specs-container">
        {/* Category Hierarchy */}
        {categorySpecs.length > 0 && (
          <div className="pd-category-section">
            <h4 className="pd-spec-section-title">Category</h4>
            <div className="pd-category-hierarchy">
              {categorySpecs.map((category, index) => (
                <div key={index} className="pd-category-level">
                  <span className="pd-category-value">{category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Details */}
        {productDetails.length > 0 && (
          <div className="pd-details-section">
            <h4 className="pd-spec-section-title">Product Details</h4>
            <div className="pd-details-grid">
              {productDetails.map(([label, value], index) => (
                <div key={index} className="pd-detail-item">
                  <span className="pd-detail-label">{label}:</span>{" "}
                  <span className="pd-detail-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };


  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

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


      <div className="homePageContainer">
        <div className="pd-container" style={{ background: "white" }}>
          {/* Currency Selector */}
          {/* <div className="pd-currency-selector">
            <label htmlFor="currency">Select Currency: </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => changeCurrency(e.target.value)}
              className="pd-currency-select"
            >
              {Object.keys(currencySymbols).map((cur) => (
                <option key={cur} value={cur}>
                  {cur} ({currencySymbols[cur]})
                </option>
              ))}
            </select>
          </div> */}

          <div className="pd-product-layout" style={{marginTop:"40px"}}>
            {/* Image Gallery */}
            <div className="pd-gallery-column">
              <div className="pd-main-image zoom-wrapper">
                <img
                  src={selectedImage || "/placeholder.png"}
                  alt={product.name}
                  className="pd-main-img zoom-image"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    transform: isZooming ? "scale(2)" : "scale(1)",
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                />
              </div>

              <div className="pd-thumbnail-container">
                {(product.images && product.images.length > 0 ? product.images : [product.image]).map((img, index) => (
                  <img
                    key={index}
                    src={img || "/placeholder.png"}
                    alt={`${product.name}-${index}`}
                    className={`pd-thumbnail ${selectedImage === img ? 'pd-thumbnail-active' : ''}`}
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>

            </div>

            <div className="pd-info-column">
              <h1 className="pd-product-name">{product.name}</h1>

              {/* Rating and Reviews */}
              <div className="pd-rating-container">
                <div className="pd-stars">
                  {renderStars(Number(overallRating))}
                  <span className="pd-rating-value">{overallRating}</span>
                </div>
                <span className="pd-review-count">({reviews.length} Ratings, {reviews.length} Reviews)</span>
              </div>

              {/* Price Section */}
              <div className="pd-price-container">
                {product.discount ? (
                  <div className="pd-price-discount">
                    <span className="pd-original-price">
                      {currencySymbols[currency]} {convertPrice(originalPriceGBP)}
                    </span>
                    <span className="pd-current-price">
                      {currencySymbols[currency]} {convertPrice(discountedPriceGBP)}
                    </span>
                    <span className="pd-discount-percent">{product.discount}% OFF</span>
                  </div>
                ) : (
                  <span className="pd-current-price">
                    {currencySymbols[currency]} {convertPrice(originalPriceGBP)}
                  </span>
                )}
              </div>

              {/* Delivery Info */}
              <div className="pd-delivery-info">

                {/* FREE DELIVERY OPTION */}
                <label className="pd-delivery-option">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="FREE"
                    checked={deliveryType === "FREE"}
                    onChange={() => setDeliveryType("FREE")}
                  />
                  <span>
                    Free Delivery by{" "}
                    <strong>
                      {formatDeliveryDate(
                        applyUTCTimeToExistingDate(
                          deliveryInfo
                            ? deliveryInfo.deliveryDate
                            : new Date(new Date().setDate(new Date().getDate() + 10)),
                          freeTimeUTC // ✅ ADMIN CUSTOM TIME
                        )
                      )}
                    </strong>
                  </span>
                </label>


                {/* EXPRESS DELIVERY OPTION */}
                {expressAmountGBP > 0 && (
                  <label className="pd-delivery-option pd-express">
                    <input
                      type="radio"
                      name="deliveryType"
                      value="EXPRESS"
                      checked={deliveryType === "EXPRESS"}
                      onChange={() => setDeliveryType("EXPRESS")}
                    />
                    <FaShippingFast className="pd-express-icon" />
                    <span>
                      Express Delivery by{" "}
                      <strong>
                        {formatDeliveryDate(
                          applyUTCTimeToExistingDate(
                            getExpressDeliveryDate(), // date logic stays
                            expressTimeUTC             // ✅ ADMIN CUSTOM TIME
                          )
                        )}
                      </strong>
                    </span>
                    <span className="pd-express-price">
                      + {currencySymbols[currency]}
                      {getExpressAmountConverted()}
                    </span>
                  </label>
                )}

              </div>






              {/* Size Selector */}
              {shouldShowSizeSelector() && <SizeSelector />}

              {/* Quantity Selector */}
              <div className="pd-quantity-selector">
                <span className="pd-quantity-label">Quantity:</span>
                <div className="pd-quantity-controls">
                  <button onClick={decrementQty} className="pd-qty-btn">-</button>
                  <span className="pd-qty-value">{qty}</span>
                  <button onClick={incrementQty} className="pd-qty-btn">+</button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pd-action-buttons">

                {/* 🔥 HIDE ALL BUTTONS EXCEPT SHARE FOR ADMIN */}
                {!isAdmin && (
                  <>
                    {isInCart ? (
                      <button
                        onClick={handleGoToCart}
                        className="pd-add-cart-btn"
                      >
                        <FaShoppingCart className="pd-cart-icon" />
                        Go to Cart
                      </button>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="pd-add-cart-btn"
                      >
                        <FaShoppingCart className="pd-cart-icon" />
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                    )}

                    <button
                      onClick={handleCheckout}
                      disabled={product.stock === 0}
                      className="pd-checkout-btn"
                    >
                      <FaCashRegister className="pd-cart-icon" />
                      Checkout
                    </button>

                    <button onClick={handleWishlist} className="pd-add-cart-btn">
                      <FaHeart className={`pd-heart-icon ${isWishlisted ? "pd-heart-active" : ""}`} />
                      {isWishlisted ? "Go to Wishlist" : "Add to Wishlist"}
                    </button>
                  </>
                )}

                {/* SHARE BUTTON ALWAYS VISIBLE */}
                <button onClick={handleShare} className="pd-share-btn">
                  <FaShare className="pd-share-icon" />
                  Share
                </button>

              </div>


              {/* Seller Info */}
              {company && (
                <div className="pd-seller-info">
                  <h3 className="pd-seller-title">Sold By</h3>
                  <div className="pd-seller-card">
                    <div className="pd-seller-header">
                      <span className="pd-seller-name">
                        <FaStore className="pd-store-icon" />
                        {company.name}
                      </span>
                      <div className="pd-seller-rating">
                        <span className="pd-seller-rating-value">{company.rating || 3.8}</span>
                        <div className="pd-seller-stars">
                          {renderStars(company.rating || 3.8)}
                        </div>
                        <span className="pd-seller-review-count">{formatNumber(company.ratingsCount || 6166)} Ratings</span>
                      </div>
                    </div><Link to="/">
                      <button className="pd-view-shop-btn">View Shop</button></Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Tabs */}
          <div className="pd-tabs-section">
            <div className="pd-tab-container">
              <button className={`pd-tab ${activeTab === "description" ? 'pd-tab-active' : ''}`} onClick={() => setActiveTab("description")}>
                Product Details
              </button>
              <button className={`pd-tab ${activeTab === "specifications" ? 'pd-tab-active' : ''}`} onClick={() => setActiveTab("specifications")}>
                Specifications
              </button>
              <button className={`pd-tab ${activeTab === "reviews" ? 'pd-tab-active' : ''}`} onClick={() => setActiveTab("reviews")}>
                Reviews & Ratings
              </button>
              <button className={`pd-tab ${activeTab === "warranty" ? 'pd-tab-active' : ''}`} onClick={() => setActiveTab("warranty")}>
                Warranty & Support
              </button>
            </div>

            <div className="pd-tab-content">
              {activeTab === "description" && (
                <div className="pd-tab-panel">
                  <h3 className="pd-tab-title">Product Description</h3>
                  <p className="pd-description">{product.description}</p>

                  <div className="pd-features-list">
                    <h4>Key Features:</h4>
                    <ul>
                      <li>Premium quality material</li>
                      <li>Enhanced protection</li>
                      <li>Stylish design</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="pd-tab-panel">
                  <h3 className="pd-tab-title">Product Specifications</h3>
                  {renderProductSpecifications()}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="pd-tab-panel">
                  <div className="pd-reviews-header">
                    <div className="pd-overall-rating">
                      <h3>{overallRating} ★</h3>
                      <p>Based on {reviews.length} reviews</p>
                    </div>
                    <div className="pd-rating-distribution">
                      <div className="pd-rating-bar">
                        <span>5 ★</span>
                        <div className="pd-bar-container">
                          <div className="pd-bar-fill" style={{ width: '70%' }}></div>
                        </div>
                        <span>70%</span>
                      </div>
                      <div className="pd-rating-bar">
                        <span>4 ★</span>
                        <div className="pd-bar-container">
                          <div className="pd-bar-fill" style={{ width: '20%' }}></div>
                        </div>
                        <span>20%</span>
                      </div>
                      <div className="pd-rating-bar">
                        <span>3 ★</span>
                        <div className="pd-bar-container">
                          <div className="pd-bar-fill" style={{ width: '7%' }}></div>
                        </div>
                        <span>7%</span>
                      </div>
                      <div className="pd-rating-bar">
                        <span>2 ★</span>
                        <div className="pd-bar-container">
                          <div className="pd-bar-fill" style={{ width: '2%' }}></div>
                        </div>
                        <span>2%</span>
                      </div>
                      <div className="pd-rating-bar">
                        <span>1 ★</span>
                        <div className="pd-bar-container">
                          <div className="pd-bar-fill" style={{ width: '1%' }}></div>
                        </div>
                        <span>1%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pd-reviews-list">
                    {reviews.length > 0 ? (
                      reviews.map((rev) => (
                        <div key={rev._id} className="pd-review-card">
                          <div className="pd-review-header">
                            <strong className="pd-review-author">{rev.name}</strong>
                            <div className="pd-review-rating">
                              {renderStars(rev.rating)}
                              <span className="pd-review-date">
                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ""}
                              </span>
                            </div>
                          </div>
                          <p className="pd-review-comment">{rev.comment}</p>
                          <div className="pd-review-helpful">
                            <span>Helpful ({Math.floor(Math.random() * 20)})</span>
                          </div>
                          {user && user.id === rev.user && (
                            <div className="pd-review-actions">
                              <button className="pd-edit-btn" onClick={() => handleEdit(rev)}>Edit</button>
                              <button className="pd-delete-btn" onClick={() => handleDelete(rev._id)}>Delete</button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="pd-no-reviews">No reviews yet. Be the first to review!</p>
                    )}
                  </div>

                  {user && (
                    <form className="pd-review-form" onSubmit={handleSubmit}>
                      <h4 className="pd-form-title">{editingReview ? "Edit Your Review" : "Write a Review"}</h4>
                      <div className="pd-rating-input">
                        <label>Rating:</label>
                        <select
                          value={newReview.rating}
                          onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                          className="pd-rating-select"
                        >
                          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                        </select>
                      </div>
                      <textarea
                        placeholder="Share your experience with this product..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        className="pd-review-textarea"
                        rows="4"
                      />
                      <div className="pd-form-actions">
                        <button type="submit" className="pd-submit-btn">
                          {editingReview ? "Update Review" : "Submit Review"}
                        </button>
                        {editingReview && (
                          <button
                            type="button"
                            className="pd-cancel-btn"
                            onClick={() => {
                              setEditingReview(null);
                              setNewReview({ comment: "", rating: 5 });
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}

              {activeTab === "warranty" && (
                <div className="pd-tab-panel">
                  <h3 className="pd-tab-title">Warranty & Support</h3>
                  <div className="pd-warranty-info">
                    <div className="pd-warranty-card">
                      <h4>Warranty Information</h4>
                      <p>{product.warranty || "This product comes with a standard manufacturer warranty against manufacturing defects."}</p>
                      <ul>
                        <li><strong>Support:</strong> Email and phone support available</li>
                      </ul>
                    </div>

                    <div className="pd-support-info">
                      <h4>Customer Support</h4>
                      <p>Our customer support team is available to help you with any questions or issues:</p>
                      <div className="pd-support-channels">
                        <div className="pd-support-channel">
                          <strong>Email:</strong> {company.email || "support@example.com"}
                        </div>
                        <div className="pd-support-channel">
                          <strong>Phone:</strong> {company.phone || "+1-800-123-4567"}
                        </div>
                        <div className="pd-support-channel">
                          <strong>Hours:</strong> Mon-Fri, 9AM-6PM EST
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="pd-related-products">
            <div className="pd-related-grid">
              {relatedProducts.map(product => (
                <RelatedProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
        <Chatbot />
        <Footer />
      </div>
    </>
  );
};

export default ProductDetails;