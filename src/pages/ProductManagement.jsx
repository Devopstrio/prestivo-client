import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";
import "../styles/ProductManagement.css";
import imageCompression from "browser-image-compression";
import "../styles/LoadingAnimation.css";
import {
  FaBox, FaMoneyBillWave, FaTag, FaWarehouse, FaAlignLeft,
  FaList, FaPlusCircle, FaTrash, FaImage, FaSave,
  FaCog, FaTshirt, FaMobile, FaHome, FaInfoCircle,
  FaMapMarkerAlt, FaGlobe, FaCity, FaMapPin, FaMinus, FaPlus, FaSpinner, FaExclamationTriangle,
  FaFileExport, FaFileExcel, FaCloudUploadAlt, FaBoxes
} from "react-icons/fa";

// Currency conversion rates relative to GBP
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

const defaultCurrency = Object.keys(currencySymbols)[0];


// Category-specific attributes
const categoryAttributes = {
  Books: ["language", "author", "genre", "format"],
  Electronics: ["brand", "ram", "storage", "processor", "displaySize", "battery", "camera", "screenSize", "type"],
  Accessories: ["brand", "material", "color"],
  Clothing: ["size", "color", "material", "fit", "brand"],
  Footwear: ["size", "color", "material", "brand"],
  Home: ["material", "inchs", "color"],
  Beauty: ["brand", "skinType", "hairType", "fragranceType"],
  Sports: ["brand", "size", "material", "weight"],
  Fitness: ["brand", "size", "material", "weight"],
  Personal: ["brand", "skinType", "hairType", "fragranceType"],
  Kitchen: ["brand", "material", "power", "capacity"],
  Stationery: ["brand", "type", "color"],
  "Vehicle Accessories": ["brand", "model"],
  Grocery: ["brand", "packSize", "organic"],
  Default: ["color", "material", "brand"],
};

// Predefined options
const sizeOptions = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL"];
const ramOptions = ["2GB", "4GB", "6GB", "8GB", "12GB", "16GB"];
const storageOptions = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"];
const typeOptions = ["Mobile", "Laptop", "Desktop"];
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


const ProductManagement = ({ products, categories, fetchProducts }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [showWarehouseStock, setShowWarehouseStock] = useState(false);
  const [warehouseStockForm, setWarehouseStockForm] = useState({
    warehouseId: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    stock: ""
  });
  const [warehouseStocks, setWarehouseStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  // 👕 Size-wise stock per warehouse
  const [sizeStocksByWarehouse, setSizeStocksByWarehouse] = useState({});
  const [excelFile, setExcelFile] = useState(null);
  const [isUploadingExcel, setIsUploadingExcel] = useState(false);
  const [showExcelInstructions, setShowExcelInstructions] = useState(false);


  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);


  // Fetch warehouses on component mount
  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/warehouse`);
      // console.log("Fetched warehouses:", response.data);
      setWarehouses(response.data);
      // console.log("Warehouses state after set:", warehouses);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
    }
  };


  const createInitialForm = () => {
    const allAttributes = new Set();
    Object.values(categoryAttributes).forEach(attrs => attrs.forEach(attr => allAttributes.add(attr)));

    return {
      name: "",
      price: "1",
      discount: "0",
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
      ram: "",
      storage: [],
      processor: "",
      displaySize: "",
      battery: "",
      camera: "",
      screenSize: "",
      type: [],
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
      warranty: "",
      inchs: "",
    };
  };

  const [productForm, setProductForm] = useState(createInitialForm());
  const [editingProductId, setEditingProductId] = useState(null);
  const [currentAttributes, setCurrentAttributes] = useState(categoryAttributes.Default);
  const [subCategories, setSubCategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [extraDetails, setExtraDetails] = useState([{ key: "", value: "" }]);

  const isKidsCategory =
    productForm.category === "Kids" ||
    productForm.subCategory === "Kids" ||
    productForm.subCategory === "Kids Clothing";

  const isSareeCategory =
    productForm.category === "Clothing" &&
    productForm.subSubCategory?.toLowerCase() === "sarees";



  // Update attributes and subcategories when category changes
  useEffect(() => {
    const selectedCategory = categories.find(cat => cat.name === productForm.category);
    setCurrentAttributes(categoryAttributes[productForm.category] || categoryAttributes.Default);
    setSubCategories(selectedCategory?.subCategories || []);
    setProductForm(prev => ({ ...prev, subCategory: "", subSubCategory: "" }));
    setSubSubCategories([]);
  }, [productForm.category, categories]);

  // Update sub-subcategories when subcategory changes
  useEffect(() => {
    const selectedSub = subCategories.find(sub => sub.name === productForm.subCategory);
    setSubSubCategories(selectedSub?.subSubCategories || []);
    setProductForm(prev => ({ ...prev, subSubCategory: "" }));
  }, [productForm.subCategory, subCategories]);


  // useEffect(() => {
  //   console.log("Warehouses updated in state:", warehouses);
  // }, [warehouses]);

  const handleExcelFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
      toast.error("Please select a valid .xlsx file");
      return;
    }

    setExcelFile(file);
  };

  const handleConfirmExcelUpload = async () => {
    if (!excelFile) {
      toast.error("No Excel file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile);

    setIsUploadingExcel(true);
    const toastId = toast.loading("Uploading Excel, please wait...");

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/products/import/create/excel`,
        formData
      );

      toast.update(toastId, {
        render: res.data.message || "Excel uploaded successfully",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      setExcelFile(null);
      fetchProducts();
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "Excel upload failed",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsUploadingExcel(false);
    }
  };



  // Update total stock when warehouse stocks change
  useEffect(() => {
    let total = 0;

    if (productForm.category === "Clothing" && !isSareeCategory) {
      // size-wise
      total = warehouseStocks.reduce((sum, ws) => {
        const s = (ws.sizeStocks || []).reduce((a, b) => a + b.stock, 0);
        return sum + s;
      }, 0);
    } else {
      // Sarees + others
      total = warehouseStocks.reduce(
        (sum, ws) => sum + Number(ws.stock || 0),
        0
      );
    }

    setProductForm(prev => ({ ...prev, stock: total }));
  }, [warehouseStocks, isSareeCategory]);


  // Handle warehouse stock form changes
  const handleWarehouseStockChange = (e) => {
    const { name, value } = e.target;
    setWarehouseStockForm(prev => ({ ...prev, [name]: value }));

    // Auto-fill location details when warehouse is selected
    if (name === "warehouseId" && value) {
      const selectedWarehouse = warehouses.find(w => w._id === value);
      if (selectedWarehouse) {
        setWarehouseStockForm(prev => ({
          ...prev,
          country: selectedWarehouse.country || "",
          state: selectedWarehouse.state || "",
          city: selectedWarehouse.city || "",
          postalCode: selectedWarehouse.postalCode || ""
        }));
      }
    }
  };

  // Add warehouse stock
  const addWarehouseStock = () => {
    const { warehouseId } = warehouseStockForm;
    if (!warehouseId) {
      toast.error("Select a warehouse");
      return;
    }

    const selectedWarehouse = warehouses.find(w => w._id === warehouseId);

    let sizeStocks = [];
    let totalStock = 0;

    // 👕 Clothing → build sizeStocks
    if (productForm.category === "Clothing" && !isSareeCategory) {
      const sizeMap = sizeStocksByWarehouse[warehouseId] || {};

      sizeStocks = Object.entries(sizeMap).map(([size, stock]) => ({
        size,
        stock: Number(stock || 0)
      }));

      totalStock = sizeStocks.reduce((s, v) => s + v.stock, 0);

      if (totalStock <= 0) {
        toast.error("Enter size-wise stock");
        return;
      }
    } else {
      totalStock = Number(warehouseStockForm.stock || 0);
      if (totalStock <= 0) {
        toast.error("Enter stock quantity");
        return;
      }
    }

    if (warehouseStocks.find(ws => ws.warehouseId === warehouseId)) {
      toast.error("Warehouse already added");
      return;
    }

    setWarehouseStocks(prev => [
      ...prev,
      {
        warehouseId,
        warehouseName: selectedWarehouse?.name,
        country: selectedWarehouse?.country,
        state: selectedWarehouse?.state,
        city: selectedWarehouse?.city,
        postalCode: selectedWarehouse?.postalCode,
        stock: totalStock,
        sizeStocks: productForm.category === "Clothing" ? sizeStocks : []
      }
    ]);

    setWarehouseStockForm({
      warehouseId: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
      stock: ""
    });
  };


  // Remove warehouse stock
  const removeWarehouseStock = (warehouseId) => {
    setWarehouseStocks(prev => prev.filter(ws => ws.warehouseId !== warehouseId));
  };

  // Update warehouse stock
  const updateWarehouseStock = (warehouseId, newStock) => {
    setWarehouseStocks(prev =>
      prev.map(ws =>
        ws.warehouseId === warehouseId
          ? { ...ws, stock: parseInt(newStock) || 0 }
          : ws
      )
    );
  };

  // Handle input changes
  const handleProductChange = (e) => {
    const { name, value, files, checked } = e.target;

    if (name === "images") {
      handleImageUpload(e);
    } else if (["size"].includes(name)) {
      let updated = [...productForm[name]];
      if (checked) updated.push(value);
      else updated = updated.filter(v => v !== value);
      setProductForm({ ...productForm, [name]: updated });
    }
    else if (["ram", "storage", "type"].includes(name)) {
      setProductForm({ ...productForm, [name]: value }); // simple assignment for radios
    } else {
      setProductForm({ ...productForm, [name]: value });
    }
  };

  // Extra details handling
  const handleExtraChange = (index, field, val) => {
    const updated = [...extraDetails];
    updated[index][field] = val;
    setExtraDetails(updated);
  };
  const addExtraField = () => setExtraDetails([...extraDetails, { key: "", value: "" }]);
  const removeExtraField = (index) => setExtraDetails(extraDetails.filter((_, idx) => idx !== index));

  // Add/update product
  const handleAddOrUpdateProduct = async () => {
    const { name, price, discount, stock, category, subCategory, subSubCategory, currency: productCurrency } = productForm;
    if (!name || !price || !stock || !category || !productCurrency) return toast.error("Please fill all required fields");

    const priceInGBP = Number(price);
    const discountPercent = Number(discount || 0);
    const discountInGBP = priceInGBP * (discountPercent / 100);
    const totalPriceInGBP = priceInGBP - (priceInGBP * discountPercent) / 100;



    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", priceInGBP.toFixed(2));
    formData.append("discount", discountPercent.toFixed(2));
    formData.append("totalPrice", totalPriceInGBP.toFixed(2));
    formData.append("stock", stock);
    formData.append("description", productForm.description);
    formData.append("category", category);
    formData.append("subCategory", subCategory);
    formData.append("subSubCategory", subSubCategory);
    formData.append("currency", "GBP");

    // Add warehouse stocks
    formData.append("warehouseStocks", JSON.stringify(warehouseStocks));

    if (
      category === "Clothing" &&
      !isSareeCategory &&
      productForm.size.length > 0
    ) {
      formData.append("size", productForm.size.join(","));
    }

    else if (["Footwear", "Sports", "Fitness"].includes(category) && productForm.sizes) formData.append("size", productForm.sizes);
    if (category === "Home" && productForm.inchs) formData.append("inchs", productForm.inchs);

    currentAttributes.forEach(attr => {
      if (["ram", "storage", "type"].includes(attr)) {
        const value = productForm[attr];
        if (Array.isArray(value) && value.length > 0) {
          formData.append(attr, value.join(","));
        } else if (value) { // handle single string (radio button)
          formData.append(attr, value);
        }
      } else if (attr !== "size" && attr !== "inchs" && productForm[attr]) {
        formData.append(attr, productForm[attr]);
      }
    });

    if (productForm.warranty) formData.append("warranty", productForm.warranty);

    extraDetails.forEach(detail => {
      if (detail.key && detail.value) formData.append(detail.key, detail.value);
    });

    productForm.images.forEach(file => formData.append("images", file));

    try {
      if (editingProductId) {
        await axios.put(`${API_BASE_URL}/api/products/${editingProductId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product updated successfully!");
        setEditingProductId(null);
      } else {
        const response = await axios.post(`${API_BASE_URL}/api/products`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success(response.data.message || "Product added successfully!");
        // ✅ Show plan limit alert if present
        if (response.data.alertMessage) {
          toast.warn(response.data.alertMessage);
        }
      }
      setProductForm(createInitialForm());
      setPreviewImages([]);
      setExtraDetails([{ key: "", value: "" }]);
      setWarehouseStocks([]);
      fetchProducts();
    } catch (err) {
      // console.error("Upload error:", err.response?.data || err);

      // ✅ Show meaningful backend message
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err.message.includes("Network Error")) {
        toast.error("Network error: Please check your connection.");
      } else {
        toast.error("An unexpected error occurred while uploading. Please try again.");
      }
    }
  };


  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) return toast.error("Maximum 3 images allowed per product");

    setIsRemovingBg(true);

    try {
      // ✅ 1. Initial Compression
      let compressedFiles = await Promise.all(
        files.map(file =>
          imageCompression(file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1024,
          })
        )
      );

      const finalFiles = [];

      for (let file of compressedFiles) {
        // ✅ 2. Convert to 1×1 Square (no removeBG, no upscale)
        const squareImage = await new Promise((resolve) => {
          const img = new Image();
          img.src = URL.createObjectURL(file);

          img.onload = () => {
            const size = Math.max(img.width, img.height); // Largest side
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = size;
            canvas.height = size;

            const offsetX = (size - img.width) / 2;
            const offsetY = (size - img.height) / 2;

            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, offsetX, offsetY, img.width, img.height);

            canvas.toBlob(async (blob) => {
              let finalSquare = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, "_1x1.png"),
                { type: "image/png" }
              );

              // ✅ 3. If still > 0.5MB → Compress again
              if (finalSquare.size > 500 * 1024) {
                finalSquare = await imageCompression(finalSquare, {
                  maxSizeMB: 0.5,
                  maxWidthOrHeight: 1024,
                });
              }

              resolve(finalSquare);
            }, "image/png");
          };
        });

        finalFiles.push(squareImage);
      }

      // ✅ 4. Save to State & Preview
      setProductForm({ ...productForm, images: finalFiles });
      setPreviewImages(finalFiles.map(img => URL.createObjectURL(img)));

    } catch (error) {
      // console.error("Error while processing images:", error);
      toast.error("Error while processing images. Please try again.");
    } finally {
      setIsRemovingBg(false); // Hide loader
    }
  };



  // Remove a selected image
  const handleRemoveImage = (index) => {
    const updatedImages = productForm.images.filter((_, i) => i !== index);
    const updatedPreviews = previewImages.filter((_, i) => i !== index);
    setProductForm({ ...productForm, images: updatedImages });
    setPreviewImages(updatedPreviews);
  };

  if (isLoading) {
    return (
      <div className="pp-loading-container">
        <div className="pp-loading-content">
          <FaSpinner className="pp-loading-spinner" />
          <h3>Loading </h3>
          <p>Please wait page is Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-management-container" style={{ background: "none" }}>

      {/* ================= EXCEL ACTION BAR ================= */}
      <div className="product-excel-header">

        {/* LEFT SIDE TEXT */}
        <div className="product-excel-text">
          <h3 className="product-excel-title">
            <FaBoxes style={{ marginRight: "8px" }} />
            Add Product Management
          </h3>

          <p className="product-excel-subtitle">
            Bulk product upload use Excel sheet
          </p>
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div className="product-excel-actions-inner">

          {/* EXPORT */}
          <button
            className="product-excel-btn export"
            onClick={() =>
              window.open(`${API_BASE_URL}/api/products/export/create/excel`, "_blank")
            }
            disabled={isUploadingExcel}
          >
            <FaFileExport style={{ marginRight: "6px" }} />
            Export Excel
          </button>

          {/* IMPORT */}
          <label className="product-excel-btn import">
            <FaFileExcel style={{ marginRight: "6px" }} />
            Import Excel
            <input
              type="file"
              accept=".xlsx"
              hidden
              onChange={handleExcelFileSelect}
              disabled={isUploadingExcel}
            />
          </label>

          {/* CONFIRM */}
          {excelFile && (
            <button
              className="product-excel-btn confirm"
              onClick={handleConfirmExcelUpload}
              disabled={isUploadingExcel} style={{ color: "white" }}
            >
              {isUploadingExcel ? (
                <>
                  <FaSpinner className="spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FaCloudUploadAlt style={{ marginRight: "6px" }} />
                  Confirm Upload
                </>
              )}
            </button>
          )}

          {/* ✅ INSTRUCTIONS BUTTON (NOW SAME ROW) */}
          <button
            className="product-excel-btn info"
            onClick={() => setShowExcelInstructions(prev => !prev)}
          >
            <FaInfoCircle style={{ marginRight: "6px" }} />
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
              <FaFileExcel className="icon" />
              Use this Excel upload method only for <strong>bulk product creation</strong>.
            </li>

            <li>
              <FaExclamationTriangle className="icon warning" />
              <strong>Do NOT change, rename, delete, or reorder</strong> any Excel header columns.
            </li>

            <li>
              <FaExclamationTriangle className="icon warning" />
              Changing Excel headers may cause <strong>product data mismatch or failure</strong>.
            </li>

            <li>
              <FaWarehouse className="icon" />
              Stock values must be entered correctly based on warehouse and category rules.
            </li>

            <li>
              <FaBoxes className="icon" />
              Clothing products use <strong>size-based stock</strong> (except Sarees).
            </li>

            <li>
              <FaCloudUploadAlt className="icon" />
              After selecting Excel, always click <strong>Confirm Upload</strong>.
            </li>
          </ul>
        </div>
      )}

      <div className="product-form-wrapper">
        {/* Currency + Categories Section */}
        <div className="product-form-section">
          <div className="product-section-title"><FaCog className="product-management-icon" /> Basic Information</div>
          <div className="product-form-row">
            <div className="product-form-group">
              <label>
                <FaMoneyBillWave className="product-management-icon" /> Currency
              </label>
              <input
                type="text"
                className="product-form-input"
                value={`${Object.keys(currencySymbols)[0]} (${currencySymbols[Object.keys(currencySymbols)[0]]})`}
                disabled
              />
            </div>


            <div className="product-form-group">
              <label><FaList className="product-management-icon" /> Category</label>
              <select className="product-form-input" name="category" value={productForm.category} onChange={handleProductChange}>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>

            {subCategories.length > 0 && (
              <div className="product-form-group">
                <label><FaList className="product-management-icon" /> Subcategory</label>
                <select className="product-form-input" name="subCategory" value={productForm.subCategory} onChange={handleProductChange}>
                  <option value="">Select Subcategory</option>
                  {subCategories.map(sub => <option key={sub._id} value={sub.name}>{sub.name}</option>)}
                </select>
              </div>
            )}

            {subSubCategories.length > 0 && (
              <div className="product-form-group">
                <label><FaList className="product-management-icon" /> Sub-subcategory</label>
                <select className="product-form-input" name="subSubCategory" value={productForm.subSubCategory} onChange={handleProductChange}>
                  <option value="">Select Sub-subcategory</option>
                  {subSubCategories.map((subSub, idx) => {
                    const ssName = typeof subSub === "string" ? subSub : subSub?.name || "";
                    return (
                      <option key={idx} value={ssName}>
                        {ssName}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        </div>


        {/* Size handling (Default + Kids) */}
        {currentAttributes.includes("size") &&
          productForm.category === "Clothing" &&
          !isSareeCategory && (
            <div className="product-form-section">
              <div className="product-section-title">Sizes</div>

              <div className="product-checkbox-group">
                {sizeOptions.map((size) => (
                  <div className="product-checkbox-item" key={size}>
                    <input
                      type="checkbox"
                      name="size"
                      value={size}
                      checked={productForm.size.includes(size)}
                      onChange={handleProductChange}
                    />
                    <label>{size}</label>
                  </div>
                ))}
              </div>
            </div>
          )}



        {["Footwear", "Sports", "Fitness"].includes(productForm.category) && (
          <div className="product-form-section">
            <div className="product-section-title"><FaTshirt className="product-management-icon" /> Size</div>
            <div className="product-form-group">
              <input className="product-form-input" type="text" name="sizes" placeholder="Enter size (e.g. 7, 8, 9)" value={productForm.sizes || ""} onChange={handleProductChange} />
            </div>
          </div>
        )}

        {/* Inches for Home category */}
        {productForm.category === "Home" && (
          <div className="product-form-section">
            <div className="product-section-title"><FaHome className="product-management-icon" /> Inches</div>
            <div className="product-form-group">
              <input className="product-form-input" type="text" name="inchs" placeholder="Enter inches (e.g. 32, 40, 55)" value={productForm.inchs || ""} onChange={handleProductChange} />
            </div>
          </div>
        )}

        {/* RAM - Changed to radio buttons */}
        {currentAttributes.includes("ram") && (
          <div className="product-form-section">
            <div className="product-section-title"><FaMobile className="product-management-icon" /> RAM</div>
            <div className="product-checkbox-group">
              {ramOptions.map(ram => (
                <div className="product-checkbox-item" key={ram}>
                  <input type="radio" name="ram" value={ram} checked={productForm.ram === ram} onChange={handleProductChange} />
                  <label>{ram}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Storage - Changed to radio buttons */}
        {currentAttributes.includes("storage") && (
          <div className="product-form-section">
            <div className="product-section-title"><FaMobile className="product-management-icon" /> ROM/Storage</div>
            <div className="product-checkbox-group">
              {storageOptions.map(storage => (
                <div className="product-checkbox-item" key={storage}>
                  <input type="radio" name="storage" value={storage} checked={productForm.storage === storage} onChange={handleProductChange} />
                  <label>{storage}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Type (ONLY for Electronics) - Changed to radio buttons */}
        {productForm.category === "Electronics" && currentAttributes.includes("type") && (
          <div className="product-form-section">
            <div className="product-section-title"><FaMobile className="product-management-icon" /> Type</div>
            <div className="product-checkbox-group">
              {typeOptions.map(tp => (
                <div className="product-checkbox-item" key={tp}>
                  <input type="radio" name="type" value={tp} checked={productForm.type === tp} onChange={handleProductChange} />
                  <label>{tp}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Basic Fields Section */}
        <div className="product-form-section">
          <div className="product-section-title">
            <FaInfoCircle className="product-management-icon" /> Product Details
          </div>

          <div className="product-form-row">
            {/* Product Name */}
            <div className="product-form-group">
              <label>Name</label>
              <input
                className="product-form-input"
                name="name"
                placeholder="Product Name"
                value={productForm.name || ""}
                onChange={handleProductChange}
              />
            </div>

            {/* Price Input + Convert Section */}
            <div className="product-form-group">
              <label>
                <FaMoneyBillWave /> Price (£)
              </label>
              <input
                className="product-form-input"
                name="price"
                type="number"
                min="1"
                placeholder="Enter price in GBP"
                value={productForm.price}
                onChange={handleProductChange}
              />
            </div>

          </div>

          {/* Discount & Stock */}
          <div className="product-form-row">
            <div className="product-form-group">
              <label><FaTag className="product-management-icon" /> Discount (%)</label>
              <input
                className="product-form-input"
                name="discount"
                type="number"
                min="0"
                max="100"
                placeholder="Discount"
                value={productForm.discount || ""}
                onChange={handleProductChange}
              />
            </div>
            <div className="product-form-group">
              <label><FaWarehouse className="product-management-icon" /> Total Stock</label>
              <input
                className="product-form-input"
                name="stock"
                type="number"
                placeholder="Total Stock (Auto-calculated)"
                value={productForm.stock || ""}
                onChange={handleProductChange}
                readOnly
              />
              <small className="product-form-hint">Auto-calculated from warehouse stocks</small>
            </div>
          </div>

          {/* Description */}
          <div className="product-form-group">
            <label><FaAlignLeft className="product-management-icon" /> Description</label>
            <input
              className="product-form-input"
              name="description"
              placeholder="Product Description"
              value={productForm.description || ""}
              onChange={handleProductChange}
            />
          </div>
        </div>


        {/* Warehouse Stock Management */}
        <div className="product-form-section">
          <div className="product-section-title">
            <FaWarehouse className="product-management-icon" /> Warehouse Stock
            <button
              type="button"
              className="product-toggle-warehouse-btn"
              onClick={() => setShowWarehouseStock(!showWarehouseStock)}
            >
              {showWarehouseStock ? <FaMinus /> : <FaPlus />}
            </button>
          </div>

          {showWarehouseStock && (
            <div className="product-warehouse-form">
              <div className="product-form-row">
                <div className="product-form-group">
                  <label><FaMapMarkerAlt className="product-management-icon" /> Select Warehouse</label>
                  <select
                    className="product-form-input"
                    name="warehouseId"
                    value={warehouseStockForm.warehouseId}
                    onChange={handleWarehouseStockChange}
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse._id} value={warehouse._id}>
                        {warehouse.name} - {warehouse.city}, {warehouse.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="product-form-group">
                  <label><FaGlobe className="product-management-icon" /> Country</label>
                  <input
                    className="product-form-input"
                    type="text"
                    name="country"
                    value={warehouseStockForm.country}
                    onChange={handleWarehouseStockChange}
                    readOnly
                  />
                </div>
              </div>

              <div className="product-form-row">
                <div className="product-form-group">
                  <label><FaMapMarkerAlt className="product-management-icon" /> State</label>
                  <input
                    className="product-form-input"
                    type="text"
                    name="state"
                    value={warehouseStockForm.state}
                    onChange={handleWarehouseStockChange}
                    readOnly
                  />
                </div>

                <div className="product-form-group">
                  <label><FaCity className="product-management-icon" /> City</label>
                  <input
                    className="product-form-input"
                    type="text"
                    name="city"
                    value={warehouseStockForm.city}
                    onChange={handleWarehouseStockChange}
                    readOnly
                  />
                </div>
              </div>

              <div className="product-form-row">
                <div className="product-form-group">
                  <label><FaMapPin className="product-management-icon" /> Postal Code</label>
                  <input
                    className="product-form-input"
                    type="text"
                    name="postalCode"
                    value={warehouseStockForm.postalCode}
                    onChange={handleWarehouseStockChange}
                    readOnly
                  />
                </div>

                {productForm.category === "Clothing" && !isSareeCategory ? (
                  /* 👕 Size-wise stock (Shirts, Kurtis, etc.) */
                  <div className="product-form-group">
                    <label>Size-wise Stock</label>

                    {productForm.size.length === 0 ? (
                      <p style={{ color: "#888", fontSize: "13px" }}>
                        Please select sizes above to enter stock
                      </p>
                    ) : (
                      productForm.size.map((sz) => (
                        <div key={sz} style={{ display: "flex", gap: "10px" }}>
                          <span style={{ width: "50px" }}>{sz}</span>
                          <input
                            type="number"
                            min="0"
                            className="product-form-input"
                            value={
                              sizeStocksByWarehouse?.[warehouseStockForm.warehouseId]?.[sz] || ""
                            }
                            onChange={(e) => {
                              const qty = Number(e.target.value || 0);
                              setSizeStocksByWarehouse((prev) => ({
                                ...prev,
                                [warehouseStockForm.warehouseId]: {
                                  ...(prev?.[warehouseStockForm.warehouseId] || {}),
                                  [sz]: qty,
                                },
                              }));
                            }}
                          />
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  /* 📦 Sarees + Other categories → warehouse stock */
                  <div className="product-form-group">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      name="stock"
                      min="1"
                      value={warehouseStockForm.stock}
                      onChange={handleWarehouseStockChange}
                      className="product-form-input"
                    />
                  </div>
                )}



              </div>

              <button
                type="button"
                className="product-add-warehouse-btn"
                onClick={addWarehouseStock}
              >
                <FaPlusCircle /> Add Warehouse Stock
              </button>
            </div>
          )}

          {/* Warehouse Stocks List */}
          {warehouseStocks.length > 0 && (
            <div className="product-warehouse-list">
              <h4>Warehouse Stocks</h4>
              {warehouseStocks.map((ws) => (
                <div key={ws.warehouseId} className="product-warehouse-item">
                  <div className="product-warehouse-info">
                    <strong>{ws.warehouseName}</strong>
                    <span>{ws.city}, {ws.state}, {ws.country} - {ws.postalCode}</span>
                  </div>
                  <div className="product-warehouse-controls">
                    <input
                      type="number"
                      min="0"
                      value={ws.stock}
                      onChange={(e) => updateWarehouseStock(ws.warehouseId, e.target.value)}
                      className="product-stock-input"
                    />
                    <button
                      type="button"
                      className="product-remove-warehouse-btn"
                      onClick={() => removeWarehouseStock(ws.warehouseId)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
              <div className="product-total-stock">
                <strong>Total Stock: {productForm.stock} units</strong>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic attributes */}
        {currentAttributes.filter(attr => !["size", "ram", "storage", "type", "inchs"].includes(attr)).length > 0 && (
          <div className="product-form-section">
            <div className="product-section-title"><FaCog className="product-management-icon" /> Attributes</div>
            <div className="product-form-row">
              {currentAttributes.filter(attr => !["size", "ram", "storage", "type", "inchs"].includes(attr)).map(attr => (
                <div className="product-form-group" key={attr}>
                  <label>{attr.charAt(0).toUpperCase() + attr.slice(1)}</label>
                  <input
                    className="product-form-input"
                    name={attr}
                    placeholder={attr.charAt(0).toUpperCase() + attr.slice(1)}
                    value={productForm[attr] || ""}
                    onChange={handleProductChange}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warranty */}
        <div className="product-form-section">
          <div className="product-form-group">
            <label><FaInfoCircle className="product-management-icon" /> Warranty & Support</label>
            <input className="product-form-input" name="warranty" placeholder="Warranty Information" value={productForm.warranty || ""} onChange={handleProductChange} />
          </div>
        </div>

        {/* Extra Details */}
        <div className="product-form-section">
          <div className="product-section-title"><FaPlusCircle className="product-management-icon" /> Extra Details</div>
          <div className="product-extra-details">
            {extraDetails.map((detail, idx) => (
              <div className="product-extra-row" key={idx}>
                <input
                  className="product-form-input"
                  type="text"
                  placeholder="Key"
                  value={detail.key || ""}
                  onChange={e => handleExtraChange(idx, "key", e.target.value)}
                />
                <input
                  className="product-form-input"
                  type="text"
                  placeholder="Value"
                  value={detail.value || ""}
                  onChange={e => handleExtraChange(idx, "value", e.target.value)}
                />
                <button className="product-remove-detail-btn" type="button" onClick={() => removeExtraField(idx)}>
                  <FaTrash />
                </button>
              </div>
            ))}
            <button className="product-add-detail-btn" type="button" onClick={addExtraField}>
              <FaPlusCircle /> Add New Field
            </button>
          </div>
        </div>

        {/* Images */}
        <div className="product-form-group">
          <label><FaImage className="product-management-icon" /> Product Images</label>
          <input
            type="file"
            name="images"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="p-img"
          />

          {/* Loader only for this section */}
          {isRemovingBg && (
            <div className="image-loader">
              <div className="spinner"></div>
              <p>Processing image, please wait a few seconds...</p>
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
              <a href="https://www.aiseesoft.com/image-upscaler/" target="_blank" rel="noopener noreferrer">
                &nbsp;Click here to enhance the image before uploading
              </a>
            </span>
          </p>


        </div>


        {/* Image Preview with Remove Button */}
        {previewImages.length > 0 && (
          <div className="product-image-preview-container">
            {previewImages.map((img, index) => (
              <div key={index} className="product-image-preview-item">
                <img src={img} alt={`Preview ${index}`} className="product-preview-image" />
                <button
                  type="button"
                  className="product-remove-image-btn"
                  onClick={() => handleRemoveImage(index)}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}


        {/* Submit Button */}
        <button className="product-submit-btn" onClick={handleAddOrUpdateProduct}>
          <FaSave /> {editingProductId ? "Update Product" : "Add Product"}
        </button>

        {/* Final Price */}
        {productForm.price && (
          <div className="product-price-display">
            <p>
              Final Price: £{" "}
              {(Number(productForm.price) * (1 - Number(productForm.discount || 0) / 100)).toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;