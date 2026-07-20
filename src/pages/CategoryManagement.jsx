import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";
import CategoryImageUpload from "./CategoryImageUpload";

import { FaPlus, FaEdit, FaTrash, FaLayerGroup, FaSpinner, FaTimes, FaSave, FaImage } from "react-icons/fa";
import "../styles/CategoryManagement.css";
import "../styles/LoadingAnimation.css";
import Swal from "sweetalert2";
const CategoryManagement = ({ categories, fetchCategories }) => {
  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [editingSubId, setEditingSubId] = useState(null);
  const [editingSubName, setEditingSubName] = useState("");
  const [editingSubCatParentId, setEditingSubCatParentId] = useState("");
  const [subSubCategoryName, setSubSubCategoryName] = useState("");
  const [selectedSubId, setSelectedSubId] = useState("");
  const [editingSubSubIndex, setEditingSubSubIndex] = useState(null);
  const [editingSubSubName, setEditingSubSubName] = useState("");
  const [editingSubSubParentId, setEditingSubSubParentId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [vatRules, setVatRules] = useState({});
  const [subSubVatType, setSubSubVatType] = useState("");
  const [editingSubSubVatType, setEditingSubSubVatType] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);


  useEffect(() => {
    const fetchVatRules = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/customization`);
        setVatRules(res.data.vatRules || {});
      } catch (err) {
        toast.error("Failed to load VAT rules");
      }
    };

    fetchVatRules();
  }, []);

  // 🔒 SAFE helpers for old + new subSub data
  const getSubSubName = (subSub) =>
    typeof subSub === "string" ? subSub : subSub?.name || "";

  const getSubSubVatType = (subSub) =>
    typeof subSub === "string" ? "" : subSub?.vatType || "";

  const getSubSubVatRate = (subSub) =>
    typeof subSub === "string" ? "" : subSub?.vatRate ?? "";



  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // --- CATEGORY OPERATIONS ---
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return toast.error("Category name cannot be empty");
    try {
      await axios.post(`${API_BASE_URL}/api/categories`, { name: newCategory });
      toast.success("Category added successfully!");
      setNewCategory("");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add category");
    }
  };

  const startEditCategory = (cat) => {
    setEditingCategoryId(cat._id);
    setEditingCategoryName(cat.name);
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const handleUpdateCategory = async () => {
    if (!editingCategoryName.trim()) return toast.error("Category name cannot be empty");
    try {
      await axios.put(`${API_BASE_URL}/api/categories/${editingCategoryId}`, { name: editingCategoryName });
      toast.success("Category updated successfully!");
      setEditingCategoryId(null);
      setEditingCategoryName("");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = async (id) => {
    const result = await Swal.fire({
      title: "Delete Category?",
      text: "This will delete all subcategories and sub-subcategories!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/categories/${id}`);
      Swal.fire("Deleted!", "Category has been deleted.", "success");
      fetchCategories();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Delete failed", "error");
    }
  };


  // --- SUBCATEGORY OPERATIONS ---
  const handleAddSubCategory = async () => {
    if (!subCategoryName.trim() || !selectedCategoryId)
      return toast.error("Select category and enter subcategory name");
    try {
      await axios.post(`${API_BASE_URL}/api/categories/sub`, {
        categoryId: selectedCategoryId,
        subCategoryName,
      });
      toast.success("Subcategory added!");
      setSubCategoryName("");
      setSelectedCategoryId("");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add subcategory");
    }
  };

  const startEditSub = (sub, parentId) => {
    setEditingSubId(sub._id);
    setEditingSubName(sub.name);
    setEditingSubCatParentId(parentId);
  };

  const cancelEditSub = () => {
    setEditingSubId(null);
    setEditingSubName("");
    setEditingSubCatParentId("");
  };

  const handleUpdateSub = async () => {
    if (!editingSubName.trim()) return toast.error("Subcategory name cannot be empty");
    try {
      await axios.put(
        `${API_BASE_URL}/api/categories/${editingSubCatParentId}/sub/${editingSubId}`,
        { name: editingSubName }
      );
      toast.success("Subcategory updated!");
      setEditingSubId(null);
      setEditingSubName("");
      setEditingSubCatParentId("");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update subcategory");
    }
  };

  const handleDeleteSub = async (categoryId, subCategoryId) => {
    const result = await Swal.fire({
      title: "Delete Subcategory?",
      text: "This will delete all sub-subcategories!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/api/categories/${categoryId}/sub/${subCategoryId}`
      );
      Swal.fire("Deleted!", "Subcategory deleted successfully.", "success");
      fetchCategories();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Delete failed", "error");
    }
  };


  // --- SUB-SUBCATEGORY OPERATIONS ---
  const handleAddSubSub = async () => {
    if (!subSubCategoryName.trim() || !selectedSubId) {
      return toast.error("Select subcategory and enter name");
    }

    if (!subSubVatType) {
      return toast.error("Please select VAT type");
    }

    // ✅ FIND PARENT CATEGORY (THIS WAS MISSING)
    const parentCategory = categories.find((cat) =>
      cat.subCategories.some((sub) => sub._id === selectedSubId)
    );

    if (!parentCategory) {
      return toast.error("Parent category not found");
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/categories/${parentCategory._id}/sub/${selectedSubId}/subsub`,
        {
          subSubCategoryName,
          vatType: subSubVatType,
          vatRate: vatRules[subSubVatType]?.percentage
        }
      );

      toast.success("Sub-subcategory added!");
      setSubSubCategoryName("");
      setSubSubVatType("");
      setSelectedSubId("");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add sub-subcategory");
    }
  };


  const startEditSubSub = (index, subSub, parentId) => {
    setEditingSubSubIndex(index);
    setEditingSubSubName(getSubSubName(subSub));
    setEditingSubSubVatType(getSubSubVatType(subSub));
    setEditingSubSubParentId(parentId);
  };

  const cancelEditSubSub = () => {
    setEditingSubSubIndex(null);
    setEditingSubSubName("");
    setEditingSubSubParentId("");
  };

  const handleUpdateSubSub = async () => {
    if (!editingSubSubName.trim()) return toast.error("Sub-subcategory name cannot be empty");
    try {
      await axios.put(
        `${API_BASE_URL}/api/categories/${editingSubSubParentId.categoryId}/sub/${editingSubSubParentId.subCategoryId}/subsub/${editingSubSubIndex}`,
        {
          name: editingSubSubName,
          vatType: editingSubSubVatType,
          vatRate: vatRules[editingSubSubVatType]?.percentage

        }
      );
      toast.success("Sub-subcategory updated!");
      setEditingSubSubIndex(null);
      setEditingSubSubName("");
      setEditingSubSubParentId("");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update sub-subcategory");
    }
  };

  const handleDeleteSubSub = async (parentId, subId, index) => {
    const result = await Swal.fire({
      title: "Delete Sub-subcategory?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/api/categories/${parentId}/sub/${subId}/subsub/${index}`
      );
      Swal.fire("Deleted!", "Sub-subcategory removed.", "success");
      fetchCategories();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Delete failed", "error");
    }
  };


  // --- FILTERING ---
  const filteredCategories = categories
    .map((cat) => {
      const filteredSub = (cat.subCategories || []).filter(
        (sub) =>
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sub.subSubCategories || []).some((subSub) =>
            getSubSubName(subSub)
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
      );
      if (cat.name.toLowerCase().includes(searchTerm.toLowerCase())) return cat;
      if (filteredSub.length > 0) return { ...cat, subCategories: filteredSub };
      return null;
    })
    .filter(Boolean);

  if (isLoading) {
    return (
      <div className="pp-loading-container">
        <div className="pp-loading-content">
          <FaSpinner className="pp-loading-spinner" />
          <h3>Loading Category</h3>
          <p>Please Wait while categories are loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-management-container">
      <div className="category-title-row">
        <h2 className="category-heading">Category Management</h2>

        <button
          className="image-upload-open-btn"
          onClick={() => setShowImageUpload(true)}
        >
          <FaImage /> Upload Category Images
        </button>
      </div>

      {showImageUpload && (
        <div className="image-upload-modal-overlay">
          <div className="image-upload-modal">
            <div className="modal-header">
              <h3>Category Image Upload</h3>

              <button
                className="modal-close-btn"
                onClick={() => setShowImageUpload(false)}
              >
                <FaTimes />
              </button>
            </div>

            <CategoryImageUpload />
          </div>
        </div>
      )}

      <div className="search-container">
        <input
          placeholder="Search categories, subcategories, sub-subcategories"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add / Edit Category */}
      <div className="add-category-container">
        <input
          placeholder="New Category"
          value={editingCategoryId ? editingCategoryName : newCategory}
          onChange={(e) =>
            editingCategoryId ? setEditingCategoryName(e.target.value) : setNewCategory(e.target.value)
          }
        />
        <button onClick={editingCategoryId ? handleUpdateCategory : handleAddCategory}>
          <FaPlus /> {editingCategoryId ? "Update" : "Add"}
        </button>
        {editingCategoryId && (
          <button onClick={cancelEditCategory} className="cancel-btn">
            <FaTimes /> Cancel
          </button>
        )}
      </div>

      {/* Add Subcategory */}
      <div className="add-subcategory-container">
        <h4>Add Subcategory</h4>
        <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
        </select>
        <input
          placeholder="Subcategory Name"
          value={subCategoryName}
          onChange={(e) => setSubCategoryName(e.target.value)}
        />
        <button onClick={handleAddSubCategory}><FaPlus /> Add Subcategory</button>
      </div>

      {/* Add Sub-subcategory */}
      <div className="add-subsubcategory-container">
        <h4>Add Sub-subcategory</h4>
        <select value={selectedSubId} className="arrow" onChange={(e) => setSelectedSubId(e.target.value)}>
          <option value="">Select Subcategory</option>
          {categories.flatMap((cat) =>
            (cat.subCategories || []).map((sub) => (
              <option key={sub._id} value={sub._id}>{cat.name} ➝ {sub.name}</option>
            ))
          )}
        </select>
        <input
          placeholder="Sub-subcategory Name"
          value={subSubCategoryName}
          onChange={(e) => setSubSubCategoryName(e.target.value)}
        />

        <select
          value={subSubVatType}
          onChange={(e) => setSubSubVatType(e.target.value)}
        >
          <option value="">Select VAT Type</option>
          {Object.entries(vatRules).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label} ({value.percentage}%)
            </option>
          ))}
        </select>

        <button onClick={handleAddSubSub}><FaPlus /> Add Sub-subcategory</button>
      </div>

      <ul className="category-list">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((cat) => {
            const subCategories = cat.subCategories || [];
            return (
              <li key={cat._id} className="category-item">
                <div className="category-header">
                  <FaLayerGroup className="category-icon" />
                  {editingCategoryId === cat._id ? (
                    <div className="edit-mode-container">
                      <input
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="edit-input"
                      />
                      <div className="edit-actions">
                        <button onClick={handleUpdateCategory} className="save-btn">
                          <FaSave /> Save
                        </button>
                        <button onClick={cancelEditCategory} className="cancel-btn">
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="category-name">{cat.name}</span>
                      <div className="category-actions">
                        <button onClick={() => startEditCategory(cat)}><FaEdit id="edit" /></button>
                        <button onClick={() => handleDeleteCategory(cat._id)}><FaTrash id="delete" /></button>
                      </div>
                    </>
                  )}
                </div>

                {/* Subcategories */}
                {subCategories.length > 0 && (
                  <ul className="subcategory-list">
                    {subCategories.map((sub) => (
                      <li key={sub._id} className="subcategory-item">
                        {editingSubId === sub._id ? (
                          <div className="edit-mode-container">
                            <input
                              value={editingSubName}
                              onChange={(e) => setEditingSubName(e.target.value)}
                              className="edit-input"
                            />
                            <div className="edit-actions">
                              <button onClick={handleUpdateSub} className="save-btn">
                                <FaSave /> Save
                              </button>
                              <button onClick={cancelEditSub} className="cancel-btn">
                                <FaTimes /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span>{sub.name}</span>
                            <div className="subcategory-actions">
                              <button onClick={() => startEditSub(sub, cat._id)}><FaEdit id="edit" /></button>
                              <button onClick={() => handleDeleteSub(cat._id, sub._id)}><FaTrash id="delete" /></button>
                            </div>
                          </>
                        )}

                        {/* Sub-subcategories */}
                        {sub.subSubCategories && sub.subSubCategories.length > 0 && (
                          <ul className="sub-subcategory-list">
                            {sub.subSubCategories.map((subSub, index) => (
                              <li key={`${sub._id}-${index}`} className="sub-subcategory-item">
                                {editingSubSubIndex === index &&
                                  editingSubSubParentId.subCategoryId === sub._id ? (
                                  <div className="edit-mode-container">
                                    <input
                                      value={editingSubSubName}
                                      onChange={(e) => setEditingSubSubName(e.target.value)}
                                      className="edit-input"
                                    />

                                    <select
                                      value={editingSubSubVatType}
                                      onChange={(e) => setEditingSubSubVatType(e.target.value)}
                                    >
                                      {Object.entries(vatRules).map(([key, value]) => (
                                        <option key={key} value={key}>
                                          {value.label} ({value.percentage}%)
                                        </option>
                                      ))}
                                    </select>
                                    <div className="edit-actions">
                                      <button onClick={handleUpdateSubSub} className="save-btn">
                                        <FaSave /> Save
                                      </button>
                                      <button onClick={cancelEditSubSub} className="cancel-btn">
                                        <FaTimes /> Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <span className="subsub-name">
                                      {subSub.name}
                                    </span> &nbsp;&nbsp;

                                    {subSub.vatType && (
                                      <span className="vat-badge">
                                        {subSub.vatType} ({subSub.vatRate}%)
                                      </span>
                                    )}


                                    <div className="sub-subcategory-actions">
                                      <button onClick={() => startEditSubSub(index, subSub, { categoryId: cat._id, subCategoryId: sub._id })}>
                                        <FaEdit id="edit" />
                                      </button>
                                      <button onClick={() => handleDeleteSubSub(cat._id, sub._id, index)}>
                                        <FaTrash id="delete" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })
        ) : (
          <p>No categories match your search.</p>
        )}
      </ul>

    </div>
  );
};

export default CategoryManagement;