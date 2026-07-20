import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import "../styles/CategoryImageUpload.css";
import "../styles/LoadingAnimation.css";

import { FaUpload, FaSpinner, FaImage, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

export default function CategoryImageUpload() {

    const [categories, setCategories] = useState([]);
    const [selectedImage, setSelectedImage] = useState({});
    const [imagePreview, setImagePreview] = useState({});
    const [loadingId, setLoadingId] = useState(null);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    // Cleanup preview URLs when component unmounts
    useEffect(() => {
        return () => {
            Object.values(imagePreview).forEach(previewUrl => {
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
            });
        };
    }, [imagePreview]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const res = await axios.get(`${API_BASE_URL}/api/categories`);
            setCategories(res.data);
        } catch (err) {
            toast.error("Failed to fetch categories");
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleFileChange = (categoryId, file) => {
        // Clean up previous preview URL for this category
        if (imagePreview[categoryId]) {
            URL.revokeObjectURL(imagePreview[categoryId]);
        }

        // Create new preview URL
        const previewUrl = file ? URL.createObjectURL(file) : null;

        setSelectedImage(prev => ({
            ...prev,
            [categoryId]: file
        }));

        setImagePreview(prev => ({
            ...prev,
            [categoryId]: previewUrl
        }));
    };

    const clearSelectedImage = (categoryId) => {
        // Clean up preview URL
        if (imagePreview[categoryId]) {
            URL.revokeObjectURL(imagePreview[categoryId]);
        }

        setSelectedImage(prev => ({
            ...prev,
            [categoryId]: null
        }));

        setImagePreview(prev => ({
            ...prev,
            [categoryId]: null
        }));

        // Reset file input
        const fileInput = document.getElementById(`file-input-${categoryId}`);
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleUpload = async (categoryId) => {
        if (!selectedImage[categoryId]) {
            toast.warning("Please select an image first");
            return;
        }

        try {
            setLoadingId(categoryId);

            const formData = new FormData();
            formData.append("image", selectedImage[categoryId]);

            await axios.post(
                `${API_BASE_URL}/api/categories/${categoryId}/image`,
                formData
            );

            toast.success("Category image uploaded successfully");
            
            // Clear preview after successful upload
            clearSelectedImage(categoryId);
            
            fetchCategories();

        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (categoryId) => {
        const result = await Swal.fire({
            title: "Delete Image?",
            text: "This will remove the category image.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#e53935",
            confirmButtonText: "Yes, Delete"
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/categories/${categoryId}/image`);
            toast.success("Image deleted successfully");
            fetchCategories();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    /* Loading animation */
    if (loadingCategories) {
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
        <div className="category-image-page">
            <h2>Category Image Upload</h2>

            <div className="category-image-grid">
                {categories.map(cat => (
                    <div key={cat._id} className="category-image-card">
                        {/* Category Name */}
                        <div className="category-header">
                            <h3>{cat.name}</h3>
                        </div>

                        {/* Image Preview */}
                        <div className="category-image-preview">
                            {imagePreview[cat._id] ? (
                                <div className="preview-container">
                                    <img 
                                        src={imagePreview[cat._id]} 
                                        alt={`Preview ${cat.name}`}
                                        className="preview-image"
                                    />
                                    <button 
                                        className="clear-preview-btn"
                                        onClick={() => clearSelectedImage(cat._id)}
                                        title="Remove selected image"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ) : cat.imageUrl ? (
                                <img 
                                    src={cat.imageUrl} 
                                    alt={cat.name}
                                    className="saved-image"
                                />
                            ) : (
                                <div className="image-placeholder">
                                    <FaImage className="upload-icon" />
                                    <p>Upload Category Image</p>
                                </div>
                            )}
                        </div>

                        {/* File Input */}
                        <input
                            id={`file-input-${cat._id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                handleFileChange(cat._id, e.target.files[0])
                            }
                        />

                        {/* Buttons */}
                        <div className="image-action-buttons">
                            <button
                                onClick={() => handleUpload(cat._id)}
                                className="upload-btn"
                                disabled={loadingId === cat._id || !selectedImage[cat._id]}
                            >
                                {loadingId === cat._id ? (
                                    <>
                                        <FaSpinner className="spinner" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <FaUpload /> Upload
                                    </>
                                )}
                            </button>

                            {cat.imageUrl && (
                                <button
                                    onClick={() => handleDelete(cat._id)}
                                    className="delete-btn"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}