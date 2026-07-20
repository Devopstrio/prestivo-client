import { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import HeroBannerSection from "../pages/HeroBannerSection";
import HomeFeaturesSection from "./HomeFeaturesSection";
import CategoryBanner from "./CategoryBanner";
import HomeCategory from "./HomeCategory";
import Contact from "../components/Contact";
import SmartInventorySection from "./SmartInventorySection";
import Chatbot from "../components/Chatbot";
import Footer from "../components/Footer";
import keywordMappings, { findKeyword } from "../utils/keywordMappings";
import "../styles/Home.css";
import {
  FaShoppingCart,
  FaFilter,
  FaChevronDown,
  FaChevronRight,
  FaTimes,
  FaSearch,
  FaArrowRight
} from "react-icons/fa";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.search) {
      setSearch(location.state.search);
    }
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    }
    if (location.state?.subCategory) {
      setSelectedSubCategory(location.state.subCategory);
    }
    if (location.state?.subSubCategory) {
      setSelectedSubSubCategory(location.state.subSubCategory);
    }

    if (location.state?.fromSearch) {
      scrollToProducts();
      return;
    }

    if (location.state?.category || location.state?.subCategory || location.state?.subSubCategory) {
      scrollToProducts();
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.fromSuggestion) {
      scrollToProducts();

      // Clear state so it doesn't trigger again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  useEffect(() => {
    if (
      user?.createdByDevopstrio &&
      user?.subscriptionStatus === "Expired"
    ) {
      navigate("/subscription", { replace: true });
    }
  }, [user]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState("Relevance");

  // Search states for filters
  const [categorySearch, setCategorySearch] = useState("");
  const [subCategorySearch, setSubCategorySearch] = useState("");
  const [subSubCategorySearch, setSubSubCategorySearch] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 51;
  const isSearching = search.trim().length > 0;


  const observerRef = useRef(null);
  useEffect(() => {
    if (!isSearching) return;

    const fetchAllProductsForSearch = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/products?page=1&limit=5000`
        );

        const data = res.data.products || [];

        const productsWithImages = data.map((p) => {
          const mainImage = p.image
            ? p.image
            : Array.isArray(p.images) && p.images.length > 0
              ? p.images[0]
              : "/placeholder.png";

          const imageUrl =
            typeof mainImage === "string" &&
              (mainImage.startsWith("http") || mainImage.startsWith("data:"))
              ? mainImage
              : `${API_BASE_URL}${mainImage}`;

          return { ...p, image: imageUrl };
        });

        // 🔥 Replace products completely
        setProducts(productsWithImages);
        setHasMore(false); // ⛔ disable infinite scroll
        setPage(1);
      } catch (err) {
        console.error("Search fetch failed:", err);
      }
    };

    fetchAllProductsForSearch();
  }, [search]);


  useEffect(() => {
    if (!hasMore || isSearching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore]);

  // Ref for the products section
  const productsSectionRef = useRef(null);

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Filter subcategories based on search
  const filteredSubCategories = selectedCategory
    ? categories.find(c => c.name === selectedCategory)?.subCategories?.filter(subCategory =>
      subCategory.name.toLowerCase().includes(subCategorySearch.toLowerCase())
    ) || []
    : [];

  // Filter sub-subcategories based on search
  const filteredSubSubCategories = selectedSubCategory
    ? categories.find(c => c.name === selectedCategory)
      ?.subCategories?.find(sc => sc.name === selectedSubCategory)
      ?.subSubCategories?.filter(subSubCategory => {
        const ssName = typeof subSubCategory === "string" ? subSubCategory : subSubCategory?.name || "";
        return ssName.toLowerCase().includes(subSubCategorySearch.toLowerCase());
      }) || []
    : [];

  useEffect(() => {
    if (!search) return;

    async function mapSearch() {
      const searchLower = search.toLowerCase().trim();
      let mapping = keywordMappings[searchLower];

      if (!mapping) {
        const normalized = searchLower.replace(/[-\s]/g, "");
        for (const key in keywordMappings) {
          if (normalized === key.replace(/[-\s]/g, "")) {
            mapping = keywordMappings[key];
            break;
          }
        }
      }

      if (!mapping) {
        mapping = await findKeyword(searchLower);
      }

      if (mapping) {
        if (mapping.category) setSelectedCategory(mapping.category);
        if (mapping.subCategory) setSelectedSubCategory(mapping.subCategory);
        if (mapping.subSubCategory) setSelectedSubSubCategory(mapping.subSubCategory);

        if (mapping.brand) {
          setSearch(mapping.brand);
        }
        return;
      }

      setSelectedCategory("");
      setSelectedSubCategory("");
      setSelectedSubSubCategory("");

      const matchedCategory = categories.find(c =>
        c.name.toLowerCase().includes(searchLower)
      );
      if (matchedCategory) {
        setSelectedCategory(matchedCategory.name);
        return;
      }

      for (const category of categories) {
        if (category.subCategories) {
          const matchedSubCategory = category.subCategories.find(sc =>
            sc.name.toLowerCase().includes(searchLower)
          );
          if (matchedSubCategory) {
            setSelectedCategory(category.name);
            setSelectedSubCategory(matchedSubCategory.name);
            return;
          }

          for (const subCategory of category.subCategories) {
            if (subCategory.subSubCategories) {
              const matchedSubSubCategory = subCategory.subSubCategories.find(ssc => {
                const sscName = typeof ssc === "string" ? ssc : ssc?.name || "";
                return sscName.toLowerCase().includes(searchLower);
              });
              if (matchedSubSubCategory) {
                const sscName = typeof matchedSubSubCategory === "string" ? matchedSubSubCategory : matchedSubSubCategory?.name || "";
                setSelectedCategory(category.name);
                setSelectedSubCategory(subCategory.name);
                setSelectedSubSubCategory(sscName);
                return;
              }
            }
          }
        }
      }
    }

    mapSearch();
  }, [search, categories]);

  // ================= FETCH PRODUCTS (PAGE-WISE – NO DUPLICATES) =================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/products?page=${page}&limit=${LIMIT}`
        );

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.products || [];

        // ⛔ If less than limit → no more pages
        if (data.length < LIMIT) {
          setHasMore(false);
        }

        const productsWithFullImage = data.map((p) => {
          const mainImage = p.image
            ? p.image
            : Array.isArray(p.images) && p.images.length > 0
              ? p.images[0]
              : "/placeholder.png";

          const imageUrl =
            typeof mainImage === "string" &&
              (mainImage.startsWith("http") || mainImage.startsWith("data:"))
              ? mainImage
              : `${API_BASE_URL}${mainImage}`;

          return { ...p, image: imageUrl };
        });

        // ✅ IMPORTANT: REPLACE products (NO DUPLICATES)
        setProducts((prev) => [...prev, ...productsWithFullImage]);

      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, [page]); // 🔥 page change triggers new fetch


  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/categories/home`);
        setCategories(res.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Listen for scroll event from Header
  useEffect(() => {
    const handleScrollToProducts = () => {
      scrollToProducts();
    };

    window.addEventListener('scrollToProducts', handleScrollToProducts);

    return () => {
      window.removeEventListener('scrollToProducts', handleScrollToProducts);
    };
  }, []);

  // Enhanced search functionality
  useEffect(() => {
    if (search) {
      const searchLower = search.toLowerCase();

      setSelectedCategory("");
      setSelectedSubCategory("");
      setSelectedSubSubCategory("");

      const matchedCategory = categories.find(c =>
        c.name.toLowerCase().includes(searchLower)
      );

      if (matchedCategory) {
        setSelectedCategory(matchedCategory.name);
        return;
      }

      for (const category of categories) {
        if (category.subCategories) {
          const matchedSubCategory = category.subCategories.find(sc =>
            sc.name.toLowerCase().includes(searchLower)
          );

          if (matchedSubCategory) {
            setSelectedCategory(category.name);
            setSelectedSubCategory(matchedSubCategory.name);
            return;
          }

          for (const subCategory of category.subCategories) {
            if (subCategory.subSubCategories) {
              const matchedSubSubCategory = subCategory.subSubCategories.find(ssc => {
                const sscName = typeof ssc === "string" ? ssc : ssc?.name || "";
                return sscName.toLowerCase().includes(searchLower);
              });

              if (matchedSubSubCategory) {
                const sscName = typeof matchedSubSubCategory === "string" ? matchedSubSubCategory : matchedSubSubCategory?.name || "";
                setSelectedCategory(category.name);
                setSelectedSubCategory(subCategory.name);
                setSelectedSubSubCategory(sscName);
                return;
              }
            }
          }
        }
      }
    }
  }, [search, categories]);

  // Filter products based on search and selected categories
  const filteredProducts = products.filter((p) => {
    const makeText = (text) => (text ? text.toString().toLowerCase() : "");

    const searchLower = search.toLowerCase();

    const matchesSearch = search
      ? (
        makeText(p.name).includes(searchLower) ||
        makeText(p.category).includes(searchLower) ||
        makeText(p.subCategory).includes(searchLower) ||
        makeText(p.subSubCategory).includes(searchLower) ||
        makeText(p.brand).includes(searchLower) ||
        makeText(p.model).includes(searchLower) ||
        makeText(p.description).includes(searchLower) ||
        makeText(p.color).includes(searchLower) ||
        makeText(p.material).includes(searchLower) ||
        makeText(p.fit).includes(searchLower) ||
        makeText(p.warranty).includes(searchLower) ||

        makeText(p.processor).includes(searchLower) ||
        makeText(p.displaySize).includes(searchLower) ||
        makeText(p.battery).includes(searchLower) ||
        makeText(p.camera).includes(searchLower) ||
        makeText(p.screenSize).includes(searchLower) ||
        makeText(p.inchs).includes(searchLower) ||

        makeText(p.skinType).includes(searchLower) ||
        makeText(p.hairType).includes(searchLower) ||
        makeText(p.fragranceType).includes(searchLower) ||
        makeText(p.language).includes(searchLower) ||
        makeText(p.author).includes(searchLower) ||
        makeText(p.genre).includes(searchLower) ||
        makeText(p.format).includes(searchLower) ||
        makeText(p.packSize).includes(searchLower) ||
        makeText(p.organic).includes(searchLower) ||

        makeText(p.power).includes(searchLower) ||
        makeText(p.capacity).includes(searchLower) ||
        makeText(p.weight).includes(searchLower) ||

        (Array.isArray(p.ram) && p.ram.some(r => makeText(r).includes(searchLower))) ||
        (Array.isArray(p.storage) && p.storage.some(s => makeText(s).includes(searchLower))) ||
        (Array.isArray(p.type) && p.type.some(t => makeText(t).includes(searchLower))) ||
        (Array.isArray(p.size) && p.size.some(sz => makeText(sz).includes(searchLower)))
      )
      : true;

    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesSubCategory = selectedSubCategory ? p.subCategory === selectedSubCategory : true;
    const matchesSubSubCategory = selectedSubSubCategory ? p.subSubCategory === selectedSubSubCategory : true;

    return matchesSearch && matchesCategory && matchesSubCategory && matchesSubSubCategory;
  });

  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "Price: Low to High":
        return a.price - b.price;
      case "Price: High to Low":
        return b.price - a.price;
      case "Newest First":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  // Function to scroll to products section
  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedSubCategory("");
    setSelectedSubSubCategory("");
    setSearch("");
    setCategorySearch(""); // Clear category search when selecting a category
    scrollToProducts();
  };

  const handleSubCategorySelect = (subCategoryName) => {
    setSelectedSubCategory(subCategoryName);
    setSelectedSubSubCategory("");
    setSearch("");
    setSubCategorySearch(""); // Clear subcategory search when selecting a subcategory
    scrollToProducts();
  };

  const handleSubSubCategorySelect = (subSubCategoryName) => {
    setSelectedSubSubCategory(subSubCategoryName);
    setSearch("");
    setSubSubCategorySearch(""); // Clear sub-subcategory search when selecting
    scrollToProducts();
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedSubSubCategory("");
    setSearch("");
    setSortBy("Relevance");
    // Clear all search inputs
    setCategorySearch("");
    setSubCategorySearch("");
    setSubSubCategorySearch("");

    // 🔥 RESET PRODUCTS & PAGINATION
    setProducts([]);
    setPage(1);
    setHasMore(true);

    // 🔥 VERY IMPORTANT: CLEAR ROUTER STATE
    navigate(location.pathname, { replace: true, state: {} });

    scrollToProducts();
  };

  // Function to handle Shop Now button click
  const handleShopNow = () => {
    clearFilters();
    scrollToProducts();
  };

  return (
    <div className="homePageContainer">
      <Header
        setSearch={setSearch}
        setSelectedCategory={setSelectedCategory}
        setSelectedSubCategory={setSelectedSubCategory}
        setSelectedSubSubCategory={setSelectedSubSubCategory}
      />

      {/* Hero Banner Section */}
      <HeroBannerSection onShopNow={handleShopNow} />

      {/* Removed AI Search Section */}

      <CategoryBanner />
      <HomeCategory onViewAll={scrollToProducts} />
      <HomeFeaturesSection onShopNow={handleShopNow} />
      <SmartInventorySection />

      {/* Products Listing Section */}
      <section className="homeProductsSection" id="products" ref={productsSectionRef}>
        <div className="homeContainer">
          <div className="homeProductsHeader">
            <h1 className="homeProductsMainTitle">
              Products For You
            </h1>
            <div className="homeProductsControls">
              <div className="homeSortContainer">
                <span className="homeSortLabel">Sort by : </span>
                <select
                  className="homeSortSelect"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="Relevance">Relevance</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                  <option value="Newest First">Newest First</option>
                </select>
              </div>
              <button
                className="homeMobileFilterToggle"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <FaFilter /> Filters
              </button>
            </div>
          </div>

          <div className="homeProductsContent">
            {/* Filters Sidebar */}
            <aside className={`homeFiltersSidebar ${showMobileFilters ? 'homeMobileVisible' : ''}`}>
              <div className="homeFiltersHeader">
                <h3>FILTERS</h3>
                <span className="homeProductsCount">{filteredProducts.length}+ Products</span>
                <button
                  className="homeCloseFiltersBtn"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Category Filter with Search */}
              <div className="homeFilterGroup">
                <h4 className="homeFilterGroupTitle">Category</h4>
                <div className="homeSearchFilter">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    className="homeFilterSearchInput"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                  />
                </div>
                <div className="homeFilterOptions">
                  {filteredCategories.map((category) => (
                    <div key={category._id} className="homeFilterOption">
                      <input
                        type="checkbox"
                        id={`category-${category._id}`}
                        checked={selectedCategory === category.name}
                        onChange={() => handleCategorySelect(category.name)}
                        className="homeFilterCheckbox"
                      />
                      <label htmlFor={`category-${category._id}`} className="homeFilterLabel">
                        {category.name}
                        {category.subCategories && category.subCategories.length > 0 && (
                          <FaChevronRight className="homeFilterExpandIcon" />
                        )}
                      </label>
                    </div>
                  ))}
                  {filteredCategories.length === 0 && (
                    <div className="homeNoResults">No categories found</div>
                  )}
                </div>
              </div>

              {/* Sub Category Filter with Search */}
              {selectedCategory && categories.find(c => c.name === selectedCategory)?.subCategories && (
                <div className="homeFilterGroup">
                  <h4 className="homeFilterGroupTitle">Sub Category</h4>
                  <div className="homeSearchFilter">
                    <input
                      type="text"
                      placeholder="Search sub categories..."
                      className="homeFilterSearchInput"
                      value={subCategorySearch}
                      onChange={(e) => setSubCategorySearch(e.target.value)}
                    />
                  </div>
                  <div className="homeFilterOptions">
                    {filteredSubCategories.map((subCategory) => (
                      <div key={subCategory._id} className="homeFilterOption">
                        <input
                          type="checkbox"
                          id={`subcategory-${subCategory._id}`}
                          checked={selectedSubCategory === subCategory.name}
                          onChange={() => handleSubCategorySelect(subCategory.name)}
                          className="homeFilterCheckbox"
                        />
                        <label htmlFor={`subcategory-${subCategory._id}`} className="homeFilterLabel">
                          {subCategory.name}
                          {subCategory.subSubCategories && subCategory.subSubCategories.length > 0 && (
                            <FaChevronRight className="homeFilterExpandIcon" />
                          )}
                        </label>
                      </div>
                    ))}
                    {filteredSubCategories.length === 0 && (
                      <div className="homeNoResults">No sub categories found</div>
                    )}
                  </div>
                </div>
              )}

              {/* Sub-Sub Category Filter with Search */}
              {selectedSubCategory &&
                categories.find(c => c.name === selectedCategory)?.subCategories
                  .find(sc => sc.name === selectedSubCategory)?.subSubCategories && (
                  <div className="homeFilterGroup">
                    <h4 className="homeFilterGroupTitle">Sub-Sub Category</h4>
                    <div className="homeSearchFilter">
                      <input
                        type="text"
                        placeholder="Search sub-sub categories..."
                        className="homeFilterSearchInput"
                        value={subSubCategorySearch}
                        onChange={(e) => setSubSubCategorySearch(e.target.value)}
                      />
                    </div>
                    <div className="homeFilterOptions">
                      {filteredSubSubCategories.map((subSubCategory, index) => {
                        const ssName = typeof subSubCategory === "string" ? subSubCategory : subSubCategory?.name || "";
                        return (
                          <div key={index} className="homeFilterOption">
                            <input
                              type="checkbox"
                              id={`subsubcategory-${index}`}
                              checked={selectedSubSubCategory === ssName}
                              onChange={() => handleSubSubCategorySelect(ssName)}
                              className="homeFilterCheckbox"
                            />
                            <label htmlFor={`subsubcategory-${index}`} className="homeFilterLabel">
                              {ssName}
                            </label>
                          </div>
                        );
                      })}
                      {filteredSubSubCategories.length === 0 && (
                        <div className="homeNoResults">No sub-sub categories found</div>
                      )}
                    </div>
                  </div>
                )}

              <div className="homeFilterActions">
                <button className="homeApplyFiltersBtn">
                  <i className="fas fa-filter"></i> Apply Filters
                </button>
                <button className="homeClearFiltersBtn" onClick={clearFilters}>
                  <i className="fas fa-times"></i> Clear All
                </button>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="homeProductsGridContainer">
              <div className="homeProductsGrid">
                {sortedProducts.length > 0 ? (
                  sortedProducts.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))
                ) : (
                  <p className="homeNoProductsMessage">
                    No products found for the selected category/subcategory.
                  </p>
                )}
              </div>

              {/* 👇 Infinite Scroll Trigger */}
              <div ref={observerRef} style={{ height: "30px" }} />

              {/* 👇 Loading Indicator */}
              {hasMore && (
                <p className="homeLoadingMoreText" style={{ textAlign: "center" }}>
                  Loading more products...
                </p>
              )}
            </div>


          </div>
        </div>
      </section>
      <Chatbot />
      <Footer />
    </div>
  );
};

export default Home;