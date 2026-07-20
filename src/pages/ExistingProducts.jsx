import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import API_BASE_URL from "../config";
import "../styles/ExistingProducts.css";
import "../styles/LoadingAnimation.css";
import imageCompression from "browser-image-compression";

// Import icons
import {
  FaEdit, FaTrash, FaMoneyBillWave, FaBox,
  FaTag, FaWarehouse, FaAlignLeft, FaPlusCircle,
  FaTimes, FaSave, FaUndo, FaImage, FaList,
  FaCog, FaTshirt, FaHome, FaMobile, FaLaptop,
  FaSearch, FaFilter, FaExchangeAlt, FaSpinner, FaExclamationTriangle,
  FaFileExport, FaFileImport, FaCheckCircle, FaBoxes, FaInfoCircle
} from "react-icons/fa";

// Conversion rates relative to GBP
const currencyRates = {
  GBP: 1
};

// Currency symbols
const currencySymbols = {
  GBP: "£",
  INR: "₹",
  USD: "$",
  EUR: "€",
  AUD: "A$",
  CAD: "C$",
  JPY: "¥",
};

// Get default currency code dynamically
const defaultCurrency = Object.keys(currencyRates)[0];
// Category attributes
const categoryAttributes = {
  Books: ["language", "author", "genre", "format"],
  Electronics: ["brand", "processor", "displaySize", "battery", "camera", "screenSize", "ram", "storage", "type"],
  Accessories: ["brand", "material", "color"],
  Clothing: ["size", "color", "material", "fit", "brand"],
  Footwear: ["size", "color", "material", "brand"],
  Home: ["material", "inchs", "color", "type"],
  Beauty: ["brand", "skinType", "hairType", "fragranceType"],
  Sports: ["brand", "size", "material", "weight"],
  Fitness: ["brand", "size", "material", "weight"],
  Personal: ["brand", "skinType", "hairType", "fragranceType"],
  Kitchen: ["brand", "material", "power", "capacity"],
  Stationery: ["brand", "type", "color"],
  "Vehicle Accessories": ["brand", "model", "type"],
  Grocery: ["brand", "packSize", "organic", "type"],
  Default: ["size", "color", "material", "brand"],
};



// Predefined sizes
const sizeOptions = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"];

// Kids size options (age-based)
const kidsSizeOptions = [
  "0-2 Months",
  "0-3 Months",
  "0-6 Months",
  "3-6 Months",
  "6-9 Months",
  "6-12 Months",
  "9-12 Months",
  "12-18 Months",
  "18-24 Months",
  "0-1 Years",
  "1-2 Years",
  "2-3 Years",
  "3-4 Years",
  "4-5 Years",
  "5-6 Years",
];


const ExistingProducts = ({ products, fetchProducts }) => {
  const [editingProductId, setEditingProductId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [sizeStocks, setSizeStocks] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [isExcelUploading, setIsExcelUploading] = useState(false);
  const [showExcelInstructions, setShowExcelInstructions] = useState(false);


  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);


  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    discount: "",
    stock: "",
    description: "",
    category: "",
    subCategory: "",
    subSubCategory: "",
    images: [],
    currency: "GBP",
    size: [],
    sizes: "",
    color: "",
    material: "",
    fit: "",
    brand: "",
    warranty: "",
    type: "",
    ram: "",
    storage: "",
    processor: "",
    displaySize: "",
    battery: "",
    camera: "",
    screenSize: "",
    inchs: "",
    skinType: "",
    hairType: "",
    fragranceType: "",
    language: "",
    author: "",
    genre: "",
    format: "",
    packSize: "",
    organic: "",
    model: "",
    power: "",
    capacity: "",
    weight: "",
    extraDetails: {},
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [extraDetails, setExtraDetails] = useState([{ key: "", value: "" }]);
  const [currentAttributes, setCurrentAttributes] = useState(categoryAttributes.Default);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [allCategories, setAllCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseStocks, setWarehouseStocks] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);


  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/categories`);
        setAllCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/warehouse`);
        setWarehouses(response.data);
      } catch (error) {
        console.error("Error fetching warehouses:", error);
      }
    };

    fetchWarehouses();
  }, []);

  // Auto-update main stock when warehouseStocks change
  useEffect(() => {
    let totalStock = 0;

    // 👕 Clothing + Sarees → warehouse-wise stock
    if (isSareeCategory) {
      totalStock = warehouseStocks.reduce(
        (sum, ws) => sum + (Number(ws.stock) || 0),
        0
      );
    }
    // 👕 Other Clothing → size-wise stock
    else if (productForm.category === "Clothing") {
      totalStock = warehouseStocks.reduce((sum, ws) => {
        const sizeTotal = (ws.sizeStocks || []).reduce(
          (s, sz) => s + (Number(sz.stock) || 0),
          0
        );
        return sum + sizeTotal;
      }, 0);
    }
    // 📦 Other categories
    else {
      totalStock = warehouseStocks.reduce(
        (sum, ws) => sum + (Number(ws.stock) || 0),
        0
      );
    }

    setProductForm(prev => ({ ...prev, stock: totalStock }));
  }, [warehouseStocks, productForm.category, productForm.subCategory]);




  // Category change
  useEffect(() => {
    setCurrentAttributes(categoryAttributes[productForm.category] || categoryAttributes.Default);

    // Find subcategories for the selected category
    if (productForm.category) {
      const category = allCategories.find(cat => cat.name === productForm.category);
      setSubCategories(category?.subCategories || []);
    } else {
      setSubCategories([]);
    }
  }, [productForm.category, allCategories]);

  // Subcategory change
  useEffect(() => {
    // Find sub-subcategories for the selected subcategory
    if (productForm.subCategory && productForm.category) {
      const category = allCategories.find(cat => cat.name === productForm.category);
      if (category) {
        const subCategory = category.subCategories.find(sub => sub.name === productForm.subCategory);
        setSubSubCategories(subCategory?.subSubCategories || []);
      }
    } else {
      setSubSubCategories([]);
    }
  }, [productForm.subCategory, productForm.category, allCategories]);

  // Function to calculate total price
  const calculateTotalPrice = () => {
    const price = parseFloat(productForm.price || 0);
    const discount = parseFloat(productForm.discount || 0);
    const total = price - (price * discount / 100);
    return total;
  };

  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const search = searchTerm.toLowerCase();

    const name = product.name ? product.name.toLowerCase() : "";
    const category = product.category ? product.category.toLowerCase() : "";
    const description = product.description ? product.description.toLowerCase() : "";

    const matchesSearch =
      name.includes(search) ||
      category.includes(search) ||
      description.includes(search);

    const matchesCategory =
      filterCategory === "All" || product.category === filterCategory;

    return matchesSearch && matchesCategory;
  });


  // Get unique categories for filter
  const categories = ["All", ...new Set(products.map(p => p.category))];

  // Detect kids category safely
  const isKidsCategory =
    productForm.category === "Kids" ||
    productForm.subCategory === "Kids" ||
    productForm.subCategory === "Kids Clothing";


  const startEditProduct = async (product) => {
    try {
      setEditingProductId(product._id);


      // 🔥 FETCH FULL PRODUCT DATA (IMPORTANT FIX)
      const res = await axios.get(
        `${API_BASE_URL}/api/products/${product._id}`
      );

      const fullProduct = res.data;

      // Handle size attribute based on category
      let sizeValue = [];
      let sizesValue = "";

      if (fullProduct.category === "Clothing") {
        sizeValue = Array.isArray(fullProduct.size)
          ? fullProduct.size
          : fullProduct.size
            ? String(fullProduct.size).split(",")
            : [];
      } else if (
        ["Footwear", "Sports", "Fitness"].includes(fullProduct.category)
      ) {
        sizesValue = fullProduct.size || "";
      }

      const priceInSelectedCurrency = Number(fullProduct.price || 0).toFixed(2);

      // ✅ Populate form with FULL DATA
      setProductForm({
        name: fullProduct.name || "",
        price: priceInSelectedCurrency || "",
        discount: fullProduct.discount || "",
        stock: fullProduct.stock || "",
        description: fullProduct.description || "",
        category: fullProduct.category || "",
        subCategory: fullProduct.subCategory || "",
        subSubCategory: fullProduct.subSubCategory || "",
        images: [],
        currency: fullProduct.currency || "GBP",

        size: sizeValue,
        sizes: sizesValue,

        color: fullProduct.color || "",
        material: fullProduct.material || "",
        fit: fullProduct.fit || "",
        brand: fullProduct.brand || "",
        warranty: fullProduct.warranty || "",

        type: Array.isArray(fullProduct.type)
          ? fullProduct.type.join(", ")
          : fullProduct.type || "",

        ram: Array.isArray(fullProduct.ram)
          ? fullProduct.ram.join(", ")
          : fullProduct.ram || "",

        storage: Array.isArray(fullProduct.storage)
          ? fullProduct.storage.join(", ")
          : fullProduct.storage || "",

        processor: fullProduct.processor || "",
        displaySize: fullProduct.displaySize || "",
        battery: fullProduct.battery || "",
        camera: fullProduct.camera || "",
        screenSize: fullProduct.screenSize || "",
        inchs: fullProduct.inchs || "",

        skinType: fullProduct.skinType || "",
        hairType: fullProduct.hairType || "",
        fragranceType: fullProduct.fragranceType || "",

        language: fullProduct.language || "",
        author: fullProduct.author || "",
        genre: fullProduct.genre || "",
        format: fullProduct.format || "",
        packSize: fullProduct.packSize || "",
        organic: fullProduct.organic || "",

        model: fullProduct.model || "",
        power: fullProduct.power || "",
        capacity: fullProduct.capacity || "",
        weight: fullProduct.weight || "",

        extraDetails: fullProduct.extraDetails || {},
      });

      // ✅ Extra details (key-value UI)
      const extras = fullProduct.extraDetails
        ? Object.entries(fullProduct.extraDetails).map(([key, value]) => ({
          key,
          value,
        }))
        : [{ key: "", value: "" }];
      setExtraDetails(extras);

      // ✅ Set subcategories & sub-subcategories
      if (fullProduct.category) {
        const category = allCategories.find(
          (cat) => cat.name === fullProduct.category
        );
        setSubCategories(category?.subCategories || []);

        if (fullProduct.subCategory && category) {
          const subCategory = category.subCategories.find(
            (sub) => sub.name === fullProduct.subCategory
          );
          setSubSubCategories(subCategory?.subSubCategories || []);
        }
      }

      // ✅ SHOW EXISTING IMAGES IN EDIT MODE
      if (fullProduct.images && Array.isArray(fullProduct.images)) {
        setImagePreviews(fullProduct.images); // Azure URLs
      } else if (fullProduct.image) {
        setImagePreviews([fullProduct.image]);
      } else {
        setImagePreviews([]);
      }

      // ✅ Warehouse stocks
      setWarehouseStocks(fullProduct.warehouseStocks || []);

    } catch (err) {
      console.error("Failed to load product for edit:", err);
      toast.error("Failed to load product details for editing");
    }
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => {
      const updated = [...prev];
      const removed = updated.splice(index, 1)[0];

      // If it's an existing image URL, track it
      if (typeof removed === "string") {
        setRemovedImages((prev) => [...prev, removed]);
      }

      return updated;
    });

    // Also update newly selected images (Files)
    setProductForm((prev) => {
      const updatedImages = [...prev.images];
      if (updatedImages[index]) {
        updatedImages.splice(index, 1);
      }
      return { ...prev, images: updatedImages };
    });
  };



  const cancelEdit = () => {
    setEditingProductId(null);
    setProductForm({
      name: "",
      price: "",
      discount: "",
      stock: "",
      description: "",
      category: "",
      subCategory: "",
      subSubCategory: "",
      images: [],
      currency: "GBP",
      size: [],
      sizes: "",
      color: "",
      material: "",
      fit: "",
      brand: "",
      type: "",
      warranty: "",
      ram: "",
      storage: "",
      inchs: "",
      extraDetails: {},
    });
    setImagePreviews([]);
    setExtraDetails([{ key: "", value: "" }]);
  };

  const handleWarehouseStockChange = (index, value) => {
    const updated = [...warehouseStocks];
    updated[index].stock = Number(value);
    setWarehouseStocks(updated);
  };


  const handleUpdateProduct = async () => {

    if (!productForm.price || Number(productForm.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const {
      name, price, discount, stock, category, currency,
      subCategory, subSubCategory, warranty, type, ram, storage,
      color, material, fit, brand, processor, displaySize,
      battery, camera, screenSize, inchs, skinType, hairType,
      fragranceType, language, author, genre, format,
      packSize, organic, model, power, capacity, weight, images
    } = productForm;

    if (!name || !price || !stock || !category || !currency) return toast.error("Fill required fields");

    // Convert price from product currency back to GBP for storage
    const priceInGBP = Number(price);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", priceInGBP);
    formData.append("discount", discount || 0);
    formData.append("stock", stock);
    formData.append("description", productForm.description);
    formData.append("category", category);
    formData.append("subCategory", subCategory);
    formData.append("subSubCategory", subSubCategory);
    formData.append("currency", "GBP");
    // ✅ Append all static attributes dynamically
    const staticAttrs = {
      warranty, type, ram, storage, color, material, fit, brand,
      processor, displaySize, battery, camera, screenSize,
      inchs, skinType, hairType, fragranceType, language,
      author, genre, format, packSize, organic, model,
      power, capacity, weight,
    };

    Object.entries(staticAttrs).forEach(([key, val]) => {
      if (val !== undefined && val !== "") {
        // Convert arrays to comma-separated strings
        if (Array.isArray(val)) {
          formData.append(key, val.join(", "));
        } else {
          formData.append(key, val);
        }
      }
    });

    if (removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages));
    }


    formData.append("warehouseStocks", JSON.stringify(warehouseStocks));
    formData.append("sizeStocks", JSON.stringify(sizeStocks));

    // 👕 Clothing (NON-SAREES) → size-based
    if (
      category === "Clothing" &&
      !isSareeCategory &&
      productForm.size.length > 0
    ) {
      formData.append("size", productForm.size.join(","));
    } else if (["Footwear", "Sports", "Fitness"].includes(category) && productForm.sizes) {
      formData.append("size", productForm.sizes);
    }

    // Handle inchs for Home category
    if (category === "Home" && productForm.inchs) {
      formData.append("inchs", productForm.inchs);
    }

    // Handle other attributes
    currentAttributes.forEach((attr) => {
      if (attr !== "size" && attr !== "inchs" && productForm[attr]) {
        formData.append(attr, productForm[attr]);
      }
    });

    const extraDetailsObj = {};
    extraDetails.forEach((detail) => {
      if (detail.key && detail.value) extraDetailsObj[detail.key] = detail.value;
    });
    formData.append("extraDetails", JSON.stringify(extraDetailsObj));

    // ✅ Only upload images if user selected new ones
    if (images && images.length > 0) {
      images.forEach((img) => formData.append("images", img));
    }
    setRemovedImages([]);


    try {
      await axios.put(`${API_BASE_URL}/api/products/${editingProductId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product updated successfully!");
      cancelEdit();
      fetchProducts();
    } catch (err) {
      // console.group("🔥 PRODUCT UPDATE ERROR DETAILS");
      // console.error("Full Error:", err);
      // console.error("Response:", err.response?.data);
      console.groupEnd();

      let errorMessage = "Failed to update product";

      if (err.response) {
        if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    }

  };

  const handleDeleteProduct = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This product will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/products/${id}`);

      Swal.fire({
        title: "Deleted!",
        text: "Product has been removed successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchProducts();
    } catch (err) {
      console.error(err);

      Swal.fire({
        title: "Error!",
        text: err.response?.data?.message || "Failed to delete product",
        icon: "error",
      });
    }
  };



  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      toast.warn("Maximum 3 images allowed per product");
      return;
    }

    setIsRemovingBg(true);

    try {
      const finalFiles = await Promise.all(
        files.map(async (file) => {
          try {
            // Step 1: Initial Compression (Fast)
            let compressedFile = await imageCompression(file, {
              maxSizeMB: 0.5,
              maxWidthOrHeight: 1024,
              useWebWorker: true,
            });

            // Step 2: Convert to Square (1×1 Ratio)
            const bitmap = await createImageBitmap(compressedFile);
            const size = Math.max(bitmap.width, bitmap.height);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = size;
            canvas.height = size;

            const offsetX = (size - bitmap.width) / 2;
            const offsetY = (size - bitmap.height) / 2;
            ctx.drawImage(bitmap, offsetX, offsetY);
            // console.log(`Converted to 1×1 → Width: ${canvas.width}, Height: ${canvas.height}`);

            const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
            let final1x1 = new File([blob], file.name.replace(/\.[^.]+$/, "_1x1.png"), {
              type: "image/png",
            });


            // Step 3: Compress Again Only if File > 0.5MB
            if (final1x1.size > 500 * 1024) {
              final1x1 = await imageCompression(final1x1, {
                maxSizeMB: 0.5,
                useWebWorker: true,
              });
            }

            return final1x1;
          } catch (err) {
            console.error("Error processing file:", err);
            return file;
          }

        })
      );

      // Save Processed Images to State
      setProductForm({ ...productForm, images: finalFiles });
      setImagePreviews(finalFiles.map((img) => URL.createObjectURL(img)));
    } catch (error) {
      console.error("Image processing failed:", error);
      toast.error("Image processing failed. Try again!");
    } finally {
      setIsRemovingBg(false);
    }
  };




  const handleExtraChange = (index, field, value) => {
    const updated = [...extraDetails];
    updated[index][field] = value;
    setExtraDetails(updated);

    const extrasObj = {};
    updated.forEach((d) => {
      if (d.key && d.value) extrasObj[d.key] = d.value;
    });
    setProductForm({ ...productForm, extraDetails: extrasObj });
  };

  const addExtraField = () => {
    setExtraDetails([...extraDetails, { key: "", value: "" }]);
  };

  const removeExtraField = (index) => {
    const updated = [...extraDetails];
    updated.splice(index, 1);
    setExtraDetails(updated);
  };

  const getImageUrl = (img) => {
    if (!img) return "/placeholder.png";

    if (
      typeof img === "string" &&
      (img.startsWith("http") || img.startsWith("data:"))
    ) {
      return img;
    }

    if (typeof img === "string") {
      return `${API_BASE_URL}${img}`;
    }

    return "/placeholder.png";
  };

  const isSareeCategory =
    productForm.category === "Clothing" &&
    productForm.subSubCategory?.toLowerCase() === "sarees";

  const handleCardClick = (e, productId) => {
    // Prevent redirect when clicking Edit or Delete buttons
    if (
      e.target.closest(".product-edit-button") ||
      e.target.closest(".product-delete-button")
    ) {
      return;
    }

    // Prevent redirect when clicking anything inside edit mode modal
    if (editingProductId) return;

    // Redirect to product details page
    window.location.href = `/product/${productId}`;
  };

  const handleExportExcel = () => {
    window.open(`${API_BASE_URL}/api/products/export/excel`, "_blank");
  };


  const handleImportExcel = async () => {
    if (!excelFile) {
      toast.error("Please select an Excel file");
      return;
    }

    const confirm = await Swal.fire({
      title: "Import Stock from Excel?",
      text: "This will update existing product stocks.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Import",
    });

    if (!confirm.isConfirmed) return;

    try {
      setIsExcelUploading(true);

      const formData = new FormData();
      formData.append("file", excelFile);

      await axios.post(
        `${API_BASE_URL}/api/products/import/excel`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Excel stock imported successfully");
      setExcelFile(null);
      fetchProducts(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Excel import failed");
    } finally {
      setIsExcelUploading(false);
    }
  };



  if (isLoading || isExcelUploading) {
    return (
      <div className="pp-loading-container">
        <div className="pp-loading-content">
          <FaSpinner className="pp-loading-spinner" />
          <h3>
            {isExcelUploading ? "Importing Excel..." : "Loading"}
          </h3>
          <p>
            {isExcelUploading
              ? "Please wait while Excel data is being processing..."
              : "Please wait while products are loading..."}
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="product-management-container">
      <div className="product-header-bar">

        {/* LEFT SIDE TEXT */}
        <div className="product-excel-text">
          <h3 className="product-excel-title">
            <FaBoxes style={{ marginRight: "8px" }} />
            Product Management
          </h3>

          <p className="product-excel-subtitle">
            Bulk product upload use Excel sheet
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="product-excel-actions">

          {/* EXPORT */}
          <button
            className="product-excel-btn export"
            onClick={handleExportExcel}
          >
            <FaFileExport size={14} />
            Export Excel
          </button>

          {/* IMPORT */}
          <label className="product-excel-btn import">
            <FaFileImport size={14} />
            Import Excel
            <input
              type="file"
              accept=".xlsx"
              hidden
              onChange={(e) => setExcelFile(e.target.files[0])}
            />
          </label>

          {/* CONFIRM */}
          {excelFile && (
            <button
              className="product-excel-btn confirm"
              onClick={handleImportExcel}
              disabled={isExcelUploading}
            >
              {isExcelUploading ? (
                <>
                  <FaSpinner className="spin" size={14} />
                  Uploading...
                </>
              ) : (
                <>
                  <FaCheckCircle size={14} />
                  Confirm Import
                </>
              )}
            </button>
          )}

          <button
            className="product-excel-btn info"
            onClick={() => setShowExcelInstructions(prev => !prev)}
          >
            <FaInfoCircle size={14} />
            Instructions
          </button>


        </div>
      </div>

      {showExcelInstructions && (
        <div className="product-excel-instructions">
          <h4>
            <FaInfoCircle style={{ marginRight: "6px" }} />
            Bulk Product Upload Instructions
          </h4>

          <ul>
            <li>
              <FaFileImport className="icon" />
              Use this Excel upload method only for
              <strong> bulk product creation or stock updates</strong>.
            </li>

            <li>
              <FaExclamationTriangle className="icon warning" />
              <strong>Do NOT change, rename, delete, or reorder</strong>
              any Excel header columns.
            </li>

            <li>
              <FaExclamationTriangle className="icon warning" />
              Changing Excel headers may cause
              <strong> data mismatch or import failure</strong>.
            </li>

            <li>
              <FaWarehouse className="icon" />
              Stock values must be entered correctly based on
              <strong> warehouse and category rules</strong>.
            </li>

            <li>
              <FaBoxes className="icon" />
              Clothing products use
              <strong> size-based stock</strong>
              (except Sarees).
            </li>

            <li>
              <FaCheckCircle className="icon" />
              After selecting Excel, always click
              <strong> Confirm Import</strong>.
            </li>
          </ul>
        </div>
      )}




      {/* Search and Filter Controls */}
      <div className="product-management-controls">
        <div
          className="product-search-box"
          style={{
            boxShadow: "none",
            padding: "10px",
            backgroundColor: "white",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            cursor: "default"
          }}
        >
          <FaSearch
            className="product-search-icon"
            style={{ marginRight: "10px", color: "#7f8c8d" }}
          />
          <input
            type="text"
            placeholder="Search by name, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="product-search-input"
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              padding: "8px 0",
              backgroundColor: "transparent",
              fontSize: "14px",
              color: "#2c3e50"
            }}
          />
        </div>


        <div className="product-filter-box">
          <FaFilter className="product-filter-icon" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="product-filter-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="product-currency-selector">
          <label><FaMoneyBillWave className="product-management-icon" /> Currency:</label>
          <span>{Object.keys(currencyRates).includes("GBP") ? `GBP (${currencySymbols["GBP"]})` : "GBP"}</span>
        </div>

      </div>

      {filteredProducts.length === 0 ? (
        <div className="product-management-empty">
          <FaBox className="product-management-empty-icon" />
          <p>No products found.</p>
        </div>
      ) : (
        <div className="product-management-grid">
          {filteredProducts.map((p) => (
            <div key={p._id} className="product-management-card" onClick={(e) => handleCardClick(e, p._id)}>
              <div className="product-card-header-section">
                {p.image && (
                  <img
                    src={getImageUrl(p.image)}
                    className="product-card-image-view"
                    alt={p.name} style={{ cursor: "pointer" }}
                  />
                )}
                <div className="product-card-info-section">
                  <div className="product-management-name" title={p.name}>{p.name}</div>
                  <div className="product-management-price">
                    {p.discount > 0 ? (
                      <>
                        <span className="product-original-price">
                          £ {Number(p.price).toFixed(2)}
                        </span>&nbsp;&nbsp;
                        <span className="product-discounted-price">
                          £ {(p.price * (1 - p.discount / 100)).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span>£ {Number(p.price).toFixed(2)}</span>
                    )}
                  </div>

                  <div className="product-management-category">{p.category}</div>
                </div>

              </div>

              {/* Price breakdown section */}
              {p.discount > 0 && (
                <div className="product-price-breakdown">

                  <div className="product-price-item">
                    <span>Original Price:</span>
                    <span>
                      £ {Number(p.price).toFixed(2)}
                    </span>
                  </div>

                  <div className="product-price-item">
                    <span>Discount:</span>
                    <span>{p.discount}%</span>
                  </div>

                  <div className="product-price-item product-total-price">
                    <span>Total Amount:</span>
                    <span>
                      £ {(p.price * (1 - p.discount / 100)).toFixed(2)}
                    </span>
                  </div>

                </div>
              )}


              <div className="product-card-details-section">
                <div className="product-detail-item">
                  <FaWarehouse className="product-detail-icon" />
                  <span>Stock: {p.stock}</span>
                </div>
                {p.discount > 0 && (
                  <div className="product-detail-item">
                    <FaTag className="product-detail-icon" />
                    <span>Discount: {p.discount}%</span>
                  </div>
                )}
                {p.subCategory && (
                  <div className="product-detail-item">
                    <FaList className="product-detail-icon" />
                    <span>Sub: {p.subCategory}</span>
                  </div>
                )}
                {p.subSubCategory && (
                  <div className="product-detail-item">
                    <FaList className="product-detail-icon" />
                    <span>Sub: {p.subSubCategory}</span>
                  </div>
                )}
              </div>

              <div className="product-management-actions">
                <button className="product-edit-button" onClick={() => startEditProduct(p)}>
                  <FaEdit /> Edit
                </button>
                <button className="product-delete-button" onClick={() => handleDeleteProduct(p._id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingProductId && (
        <div className="product-edit-modal-overlay">
          <div className="product-edit-modal">
            <div className="product-modal-content">
              <div className="product-modal-header">
                <h4>Edit Product</h4>
                <button className="product-modal-close" onClick={cancelEdit}>
                  <FaTimes />
                </button>
              </div>

              <div className="product-modal-body">
                <div className="product-form-section">
                  <h4><FaCog className="product-management-icon" /> Basic Information</h4>
                  <div className="product-form-grid">
                    <div className="product-form-group">
                      <label><FaBox className="product-management-icon" /> Name</label>
                      <input
                        className="product-form-control"
                        name="name"
                        placeholder="Product Name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      />
                    </div>


                    <div className="product-form-group">
                      <label><FaMoneyBillWave className="product-management-icon" /> Price ({currencySymbols[productForm.currency]})</label>
                      <input
                        className="product-form-control"
                        name="price"
                        type="number"
                        placeholder="Price (GBP)"
                        value={productForm.price}
                        onChange={(e) =>
                          setProductForm({ ...productForm, price: e.target.value })
                        }
                      />
                    </div>
                    <div className="product-form-group">
                      <label><FaTag className="product-management-icon" /> Discount (%)</label>
                      <input
                        className="product-form-control"
                        name="discount"
                        type="number"
                        placeholder="Discount"
                        value={productForm.discount}
                        onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                      />
                    </div>

                    <div className="product-form-group">
                      <label>
                        <FaWarehouse className="product-management-icon" /> Select Warehouse
                      </label>

                      <select
                        className="product-form-control"
                        value={productForm.warehouse || ""}
                        onChange={(e) => {
                          const selectedWarehouseId = e.target.value;

                          // ✅ Existing behavior (UNCHANGED)
                          setProductForm({ ...productForm, warehouse: selectedWarehouseId });

                          // 🔥 NEW FIX (ONLY FOR CLOTHING)
                          if (
                            productForm.category === "Clothing" &&
                            !isSareeCategory &&
                            selectedWarehouseId
                          ) {
                            const alreadyExists = warehouseStocks.some(
                              (ws) => ws.warehouseId === selectedWarehouseId
                            );

                            if (!alreadyExists) {
                              const wh = warehouses.find(w => w._id === selectedWarehouseId);

                              if (wh) {
                                setWarehouseStocks(prev => [
                                  ...prev,
                                  {
                                    warehouseId: wh._id,
                                    warehouseName: wh.name,
                                    country: wh.country,
                                    state: wh.state,
                                    city: wh.city,
                                    postalCode: wh.postalCode,
                                    stock: 0,          // ❌ not used for clothing
                                    sizeStocks: []     // ✅ IMPORTANT
                                  }
                                ]);
                              }
                            }
                          }
                        }}
                      >
                        <option value="">Select Warehouse</option>
                        {warehouses.map((wh) => (
                          <option key={wh._id} value={wh._id}>
                            {wh.name} - {wh.city}
                          </option>
                        ))}
                      </select>
                    </div>


                    {/* ======================================================
     WAREHOUSE STOCK TABLE (NON-CLOTHING ONLY)
====================================================== */}
                    {(productForm.category !== "Clothing" || isSareeCategory) && (
                      <div className="product-warehouse-section product-form-group">
                        <label>
                          <FaBox className="product-management-icon" /> Warehouse Stock Details
                        </label>

                        <table className="product-warehouse-table">
                          <thead>
                            <tr>
                              <th>Warehouse Name</th>
                              <th>Location</th>
                              <th>Current Stock</th>
                            </tr>
                          </thead>

                          <tbody>
                            {warehouses
                              .filter((wh) => {
                                const existingStock =
                                  warehouseStocks.find(
                                    (ws) => ws.warehouseId === wh._id
                                  )?.stock || 0;

                                return existingStock > 0 || wh._id === productForm.warehouse;
                              })
                              .map((wh) => {
                                const existingStock =
                                  warehouseStocks.find(
                                    (ws) => ws.warehouseId === wh._id
                                  )?.stock || 0;

                                return (
                                  <tr key={wh._id}>
                                    <td>{wh.name}</td>
                                    <td>{wh.city}</td>
                                    <td>
                                      <input
                                        type="number"
                                        className="product-form-control product-stock-input"
                                        value={existingStock}
                                        onChange={(e) => {
                                          const updated = [...warehouseStocks];
                                          const existing = updated.find(
                                            (ws) => ws.warehouseId === wh._id
                                          );

                                          if (existing) {
                                            existing.stock = Number(e.target.value);
                                          } else {
                                            updated.push({
                                              warehouseId: wh._id,
                                              stock: Number(e.target.value),
                                            });
                                          }
                                          setWarehouseStocks(updated);
                                        }}
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}


                  </div>

                  <div className="product-form-group">
                    <label><FaWarehouse className="product-management-icon" /> Stock</label>
                    <input
                      className="product-form-control"
                      name="stock"
                      type="number"
                      placeholder="Stock"
                      value={productForm.stock}
                      readOnly
                      disabled
                    />
                    <small className="product-form-hint">Auto-calculated from warehouse stocks</small>
                  </div>

                  {/* Total Price Display */}
                  <div className="product-total-section">
                    <div className="product-price-breakdown-edit">
                      <div className="product-price-line">
                        <span>Original Price:</span>
                        <span>{currencySymbols[productForm.currency]} {parseFloat(productForm.price || 0).toFixed(2)}</span>
                      </div>
                      <div className="product-price-line">
                        <span>Discount:</span>
                        <span>{productForm.discount || 0}%</span>
                      </div>
                      <div className="product-price-line product-total-line">
                        <span>Total Amount:</span>
                        <span>{currencySymbols[productForm.currency]} {calculateTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="product-form-section">
                  <h4><FaAlignLeft className="product-management-icon" /> Description</h4>
                  <textarea
                    className="product-form-control"
                    name="description"
                    placeholder="Product Description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows="3" style={{ width: "100%" }}
                  />
                </div>

                <div className="product-form-section">
                  <h4><FaList className="product-management-icon" /> Categories</h4>
                  <div className="product-form-grid">
                    <div className="product-form-group">
                      <label>Category</label>
                      <select
                        className="product-form-control"
                        value={productForm.category}
                        onChange={(e) =>
                          setProductForm({ ...productForm, category: e.target.value, subCategory: "", subSubCategory: "" })
                        }
                      >
                        <option value="">Select Category</option>
                        {Object.keys(categoryAttributes).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {subCategories.length > 0 && (
                      <div className="product-form-group">
                        <label>SubCategory</label>
                        <select
                          className="product-form-control"
                          value={productForm.subCategory}
                          onChange={(e) =>
                            setProductForm({ ...productForm, subCategory: e.target.value, subSubCategory: "" })
                          }
                        >
                          <option value="">Select SubCategory</option>
                          {subCategories.map((sub) => (
                            <option key={sub.name || sub} value={sub.name || sub}>
                              {sub.name || sub}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {subSubCategories.length > 0 && (
                      <div className="product-form-group">
                        <label>SubSubCategory</label>
                        <select
                          className="product-form-control"
                          value={productForm.subSubCategory}
                          onChange={(e) => setProductForm({ ...productForm, subSubCategory: e.target.value })}
                        >
                          <option value="">Select SubSubCategory</option>
                          {subSubCategories.map((subsub) => (
                            <option key={subsub.name || subsub} value={subsub.name || subsub}>
                              {subsub.name || subsub}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Size for Clothing */}
                {productForm.category === "Clothing" && !isSareeCategory && currentAttributes.includes("size") && (
                  <div className="product-form-section">
                    <h4> Sizes</h4>

                    <div className="product-checkbox-group">
                      {/* ✅ Default sizes (ALWAYS shown) */}
                      {sizeOptions.map((size) => (
                        <div className="product-checkbox-item" key={size}>
                          <input
                            type="checkbox"
                            name="size"
                            value={size}
                            checked={productForm.size.includes(size)}
                            onChange={(e) => {
                              const updated = [...productForm.size];
                              if (e.target.checked) updated.push(size);
                              else updated.splice(updated.indexOf(size), 1);
                              setProductForm({ ...productForm, size: updated });
                            }}
                          />
                          <label>{size}</label>
                        </div>
                      ))}

                      {/* 👶 Kids sizes (ONLY for kids category) */}
                      {isKidsCategory &&
                        kidsSizeOptions.map((size) => (
                          <div className="product-checkbox-item" key={size}>
                            <input
                              type="checkbox"
                              name="size"
                              value={size}
                              checked={productForm.size.includes(size)}
                              onChange={(e) => {
                                const updated = [...productForm.size];
                                if (e.target.checked) updated.push(size);
                                else updated.splice(updated.indexOf(size), 1);
                                setProductForm({ ...productForm, size: updated });
                              }}
                            />
                            <label>{size}</label>
                          </div>
                        ))}
                    </div>

                  </div>
                )}

                {productForm.category === "Clothing" &&
                  !isSareeCategory &&
                  productForm.size.length > 0 && (
                    <div className="product-form-section">
                      <h4>Warehouse Size-wise Stock</h4>

                      {warehouseStocks.map((wh, whIndex) => (
                        <div
                          key={wh.warehouseId}
                          className="warehouse-size-stock"
                        >
                          <strong className="warehouse-name">
                            {wh.warehouseName}
                          </strong>

                          <div className="warehouse-size-grid">
                            {productForm.size.map((size) => {
                              const sizeEntry =
                                wh.sizeStocks?.find((s) => s.size === size) || {
                                  size,
                                  stock: 0,
                                };

                              return (
                                <div
                                  key={size}
                                  className="warehouse-size-item"
                                >
                                  <label className="warehouse-size-label">
                                    {size}
                                  </label>

                                  <input
                                    type="number"
                                    min="0"
                                    value={sizeEntry.stock}
                                    onChange={(e) => {
                                      const updated = [...warehouseStocks];
                                      const ws = updated[whIndex];

                                      if (!ws.sizeStocks) ws.sizeStocks = [];

                                      const idx = ws.sizeStocks.findIndex(
                                        (s) => s.size === size
                                      );

                                      if (idx !== -1) {
                                        ws.sizeStocks[idx].stock = Number(e.target.value);
                                      } else {
                                        ws.sizeStocks.push({
                                          size,
                                          stock: Number(e.target.value),
                                        });
                                      }

                                      setWarehouseStocks(updated);
                                    }}
                                    className="warehouse-size-input"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}





                {/* Size for Footwear, Sports, Fitness */}
                {["Footwear", "Sports", "Fitness"].includes(productForm.category) && currentAttributes.includes("size") && (
                  <div className="product-form-section">
                    <h4><FaTshirt className="product-management-icon" /> Size</h4>
                    <input
                      className="product-form-control"
                      type="text"
                      name="sizes"
                      placeholder="Enter size (e.g. 7, 8, 9 or S, M, L)"
                      value={productForm.sizes}
                      onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                    />
                  </div>
                )}

                {/* Inches for Home category */}
                {productForm.category === "Home" && currentAttributes.includes("inchs") && (
                  <div className="product-form-section">
                    <h4><FaHome className="product-management-icon" /> Inches</h4>
                    <input
                      className="product-form-control"
                      type="text"
                      name="inchs"
                      placeholder="Enter inches (e.g. 32, 40, 55)"
                      value={productForm.inchs}
                      onChange={(e) => setProductForm({ ...productForm, inchs: e.target.value })}
                    />
                  </div>
                )}

                {/* Type, RAM, Storage for Electronics */}
                {productForm.category === "Electronics" && (
                  <div className="product-form-section">
                    <h4>{productForm.subCategory === "Mobile" ? <FaMobile className="product-management-icon" /> : <FaLaptop className="product-management-icon" />} Specifications</h4>
                    <div className="product-form-grid">
                      {currentAttributes.includes("type") && (
                        <div className="product-form-group">
                          <label>Type</label>
                          <input
                            className="product-form-control"
                            type="text"
                            placeholder="Enter type"
                            value={productForm.type}
                            onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                          />
                        </div>
                      )}
                      {currentAttributes.includes("ram") && (
                        <div className="product-form-group">
                          <label>RAM</label>
                          <input
                            className="product-form-control"
                            type="text"
                            placeholder="Enter RAM"
                            value={productForm.ram}
                            onChange={(e) => setProductForm({ ...productForm, ram: e.target.value })}
                          />
                        </div>
                      )}
                      {currentAttributes.includes("storage") && (
                        <div className="product-form-group">
                          <label>Storage</label>
                          <input
                            className="product-form-control"
                            type="text"
                            placeholder="Enter Storage"
                            value={productForm.storage}
                            onChange={(e) => setProductForm({ ...productForm, storage: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Other attributes */}
                {currentAttributes
                  .filter((attr) => attr !== "size" && attr !== "inchs")
                  .map((attr) => (
                    <div className="product-form-group" key={attr}>
                      <label>{attr.charAt(0).toUpperCase() + attr.slice(1)}</label>
                      <input
                        className="product-form-control"
                        name={attr}
                        placeholder={attr.charAt(0).toUpperCase() + attr.slice(1)}
                        value={productForm[attr] || ""}
                        onChange={(e) => setProductForm({ ...productForm, [attr]: e.target.value })}
                      />
                    </div>
                  ))}

                {/* Extra Details */}
                <div className="product-form-section">
                  <h4><FaList className="product-management-icon" /> Extra Details</h4>
                  <div className="product-extra-details">
                    {extraDetails.map((detail, idx) => (
                      <div className="product-extra-row" key={idx}>
                        <input
                          className="product-form-control"
                          type="text"
                          placeholder="Key"
                          value={detail.key}
                          onChange={(e) => handleExtraChange(idx, "key", e.target.value)}
                        />
                        <input
                          className="product-form-control"
                          type="text"
                          placeholder="Value"
                          value={detail.value}
                          onChange={(e) => handleExtraChange(idx, "value", e.target.value)}
                        />
                        <button className="product-remove-extra" onClick={() => removeExtraField(idx)}>
                          <FaTimes className="product-management-icon" />
                        </button>
                      </div>
                    ))}
                    <button className="product-add-extra" type="button" onClick={addExtraField}>
                      <FaPlusCircle style={{ color: "white" }} /> Add Field
                    </button>
                  </div>
                </div>

                {/* Images */}
                <div className="product-form-section">
                  <h4><FaImage className="product-management-icon" /> Product Images</h4>
                  <input
                    className="product-form-control"
                    type="file"
                    name="images"
                    multiple
                    onChange={handleImageChange}
                  />

                  {/* Loader only for this section */}
                  {isRemovingBg && (
                    <div className="image-loader">
                      <div className="spinner"></div>
                      <p>Processing image, please wait a few seconds...</p>
                    </div>
                  )}

                  {imagePreviews.length > 0 && (
                    <div className="product-image-previews">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="product-image-wrapper">
                          <img
                            src={typeof src === "string" ? src : URL.createObjectURL(src)}
                            alt={`preview-${idx}`}
                            className="product-image-preview"
                          />
                          <button
                            type="button"
                            className="product-image-remove-btn"
                            onClick={() => handleRemoveImage(idx)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Warning / Info Text with Icon */}
                  <p className="image-warning">
                    <FaExclamationTriangle className="warning-icon" />
                    Please upload images between <strong>50KB and 400KB</strong>.
                  </p>
                  <p className="image-warning">
                    <FaExclamationTriangle className="warning-icon" />
                    Please upload <strong>white background images</strong>.
                  </p>
                  <p className="image-warning">
                    <FaExclamationTriangle className="warning-icon" />
                    If your image resolution is low quality, please
                    <span className="highlight-link">
                      <a href="https://www.aiseesoft.com/image-upscaler" target="_blank" rel="noopener noreferrer">
                        &nbsp;Click here to enhance the image before uploading
                      </a>
                    </span>
                  </p>


                </div>

                {/* Currency */}
                <div className="product-form-section">
                  <h4><FaMoneyBillWave className="product-management-icon" /> Currency</h4>
                  <span className="product-fixed-currency">
                    GBP ({currencySymbols["GBP"]})
                  </span>
                </div>


                {/* Form Actions */}
                <div className="product-modal-actions">
                  <button className="product-save-button" onClick={handleUpdateProduct}>
                    <FaSave style={{ color: "white" }} /> Update Product
                  </button>
                  <button className="product-cancel-button" onClick={cancelEdit}>
                    <FaUndo style={{ color: "white" }} /> Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExistingProducts;