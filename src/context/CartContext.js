import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";
import { AuthContext } from "./AuthContext";
import { Buffer } from "buffer";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [allCarts, setAllCarts] = useState([]);

  // Get localStorage cart
  const getLocalStorageCart = () => {
    try {
      const stored = localStorage.getItem("unauthorized_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Save to localStorage
  const saveToLocalStorage = (items) => {
    try {
      localStorage.setItem("unauthorized_cart", JSON.stringify(items));
    } catch { }
  };

  const getAuthConfig = () =>
    user?.token
      ? { headers: { Authorization: `Bearer ${user.token}` } }
      : null;

  const getImageUrl = (img) => {
    if (!img) return "/placeholder.png";
    if (typeof img === "string" && (img.startsWith("http") || img.startsWith("data:"))) {
      return img;
    }
    if (typeof img === "string" && img.startsWith("/")) {
      return `${API_BASE_URL}${img}`;
    }
    if (typeof img === "object" && img.data) {
      try {
        const base64 = Buffer.from(img.data).toString("base64");
        return `data:${img.contentType};base64,${base64}`;
      } catch {
        return "/placeholder.png";
      }
    }
    return "/placeholder.png";
  };

  // Fetch DB cart
  const fetchCart = async () => {
    if (!user?.token) return [];

    try {
      const config = getAuthConfig();
      const res = await axios.get(`${API_BASE_URL}/api/cart`, config);

      return res.data.products
        .filter((p) => p.product)
        .map((p) => ({
          ...p.product,
          qty: p.qty,
          stock: p.product.stock,
          selectedSize: p.selectedSize || "",
          deliveryDays: p.deliveryDays ?? 10,
          image: getImageUrl(p.product.image),
        }));
    } catch {
      return [];
    }
  };

  // ========== FIXED LOGIC ==========
  // MIGRATE local cart → DB (ONLY ON LOGIN)
  const migrateLocalCartToServer = async () => {
    const localCart = getLocalStorageCart();
    if (!user?.token || localCart.length === 0) return;

    try {
      const config = getAuthConfig();

      for (const item of localCart) {
        await axios.post(
          `${API_BASE_URL}/api/cart/add`,
          {
            productId: item._id,
            qty: item.qty,
            selectedSize: item.selectedSize || "",
          },
          config
        );
      }

      localStorage.removeItem("unauthorized_cart");
    } catch (err) {
      console.error("Failed migrating local cart:", err);
    }
  };

  // ========== IMPORTANT FIX ==========
  // Authorized user → load ONLY DB cart
  // Unauthorized user → load ONLY local cart
  useEffect(() => {
    if (user?.token) {
      // First migrate local → DB, then load DB cart fresh
      (async () => {
        await migrateLocalCartToServer();
        const dbCart = await fetchCart();
        setCart(dbCart);
      })();
    } else {
      setCart(getLocalStorageCart());
    }
  }, [user?.token]);

  // =======================================================================

  // ADD TO CART (unchanged)
  const addToCart = async (product) => {
    const productWithDetails = {
      ...product,
      qty: product.qty || 1,
      selectedSize: product.selectedSize || "",
      image: getImageUrl(product.image),
    };

    if (user?.token) {
      try {
        const config = getAuthConfig();
        await axios.post(
          `${API_BASE_URL}/api/cart/add`,
          {
            productId: product._id,
            qty: product.qty || 1,
            selectedSize: product.selectedSize || "",
            deliveryDays: product.deliveryDays || 10,
          },
          config
        );

        const existing = cart.find(
          (p) => p._id === product._id && p.selectedSize === product.selectedSize
        );

        if (existing) {
          setCart(
            cart.map((p) =>
              p._id === product._id && p.selectedSize === product.selectedSize
                ? { ...p, qty: p.qty + (product.qty || 1) }
                : p
            )
          );
        } else {
          setCart([...cart, productWithDetails]);
        }
      } catch (err) {
        alert(err.response?.data?.message || "Add to cart failed");
      }
    } else {
      const existing = cart.find(
        (p) => p._id === product._id && p.selectedSize === product.selectedSize
      );

      const updated =
        existing
          ? cart.map((p) =>
            p._id === product._id && p.selectedSize === product.selectedSize
              ? { ...p, qty: p.qty + (product.qty || 1) }
              : p
          )
          : [...cart, productWithDetails];

      setCart(updated);
      saveToLocalStorage(updated);
    }
  };

  // REMOVE FROM CART (unchanged)
  const removeFromCart = async (id, size = "") => {
    if (user?.token) {
      try {
        const config = getAuthConfig();
        await axios.delete(`${API_BASE_URL}/api/cart/remove`, {
          ...config,
          data: { productId: id, selectedSize: size },
        });

        setCart(cart.filter((p) => !(p._id === id && p.selectedSize === size)));
      } catch { }
    } else {
      const updated = cart.filter(
        (p) => !(p._id === id && p.selectedSize === size)
      );
      setCart(updated);
      saveToLocalStorage(updated);
    }
  };

  // UPDATE QUANTITY (EXTENDED – EXISTING OPERATION NOT CHANGED)
  const updateQty = async (
    id,
    qty,
    size = "",
    extra = {} // 🔥 NEW (OPTIONAL)
  ) => {
    if (qty < 1) return;

    const { deliveryDays, deliveryDate } = extra;

    if (user?.token) {
      try {
        const config = getAuthConfig();

        // 🔥 Send extra fields ONLY if available
        await axios.put(
          `${API_BASE_URL}/api/cart/update`,
          {
            productId: id,
            qty,
            selectedSize: size,
            ...(deliveryDays !== undefined && { deliveryDays }),
            ...(deliveryDate !== undefined && { deliveryDate }),
          },
          config
        );

        // 🔥 Update local cart state
        setCart(
          cart.map((p) =>
            p._id === id && p.selectedSize === size
              ? {
                ...p,
                qty,
                ...(deliveryDays !== undefined && { deliveryDays }),
                ...(deliveryDate !== undefined && { deliveryDate }),
              }
              : p
          )
        );
      } catch (err) {
        console.error("Failed to update cart", err);
      }
    } else {
      // 🧑 Guest user (localStorage only)
      const updated = cart.map((p) =>
        p._id === id && p.selectedSize === size
          ? {
            ...p,
            qty,
            ...(deliveryDays !== undefined && { deliveryDays }),
            ...(deliveryDate !== undefined && { deliveryDate }),
          }
          : p
      );

      setCart(updated);
      saveToLocalStorage(updated);
    }
  };


  // CLEAR CART (unchanged)
  const clearCart = async () => {
    if (user?.token) {
      try {
        const config = getAuthConfig();
        for (let item of cart) {
          await axios.delete(`${API_BASE_URL}/api/cart/remove`, {
            ...config,
            data: { productId: item._id, selectedSize: item.selectedSize },
          });
        }
        setCart([]);
      } catch { }
    } else {
      setCart([]);
      localStorage.removeItem("unauthorized_cart");
    }
  };

  const syncCartOnLogout = () => {
    if (!user?.token) return;
    saveToLocalStorage(cart);
  };

  const fetchAllCartsForAdmin = async () => {
    if (!user?.token || !user.isAdmin) return [];
    try {
      const config = getAuthConfig();
      const res = await axios.get(`${API_BASE_URL}/api/cart/admin/all`, config);

      const carts = res.data
        .filter((item) => item.product)
        .map((item) => ({
          ...item,
          product: {
            ...item.product,
            image: getImageUrl(item.product.image),
          },
        }));

      setAllCarts(carts);
      return carts;
    } catch {
      return [];
    }
  };

  const refreshUserCart = async () => {
    if (user?.token) {
      const dbCart = await fetchCart();
      setCart(dbCart);
    } else {
      setCart(getLocalStorageCart());
    }
  };

  const clearLocalStorageCart = () => {
    localStorage.removeItem("unauthorized_cart");
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        refreshUserCart,
        allCarts,
        fetchAllCartsForAdmin,
        migrateLocalCartToServer,
        clearLocalStorageCart,
        getLocalStorageCartData: getLocalStorageCart,
        syncCartOnLogout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
