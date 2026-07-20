// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { GoogleOAuthProvider } from '@react-oauth/google';

// const clientId = "1088613513020-5lluflk9o4k8ltgfoqjrhdljq27nrl0b.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <CartProvider>
    <GoogleOAuthProvider clientId="1088613513020-5lluflk9o4k8ltgfoqjrhdljq27nrl0b.apps.googleusercontent.com">
      <App />
      </GoogleOAuthProvider>
    </CartProvider>
  </AuthProvider>
);
