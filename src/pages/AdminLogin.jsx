// src/pages/AdminLogin.jsx
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import API_BASE_URL from "../config";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, form);
      const userData = res.data.user;

      if (!userData.isAdmin) {
        alert("Access denied. You are not an admin.");
        return;
      }

      login(userData);
      navigate("/admin"); // Redirect to admin dashboard
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "300px" }}>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
