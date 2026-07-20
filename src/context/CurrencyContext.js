import React, { createContext, useState, useEffect, useContext } from "react"; 
import { AuthContext } from "./AuthContext";
import axios from "axios";
import API_BASE_URL from "../config";

export const CurrencyContext = createContext();

const CurrencyProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [currency, setCurrency] = useState("GBP"); // default
  const [rates, setRates] = useState({ GBP: 1 }); // store live rates

  // Fetch currency rates from a free API (base GBP)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axios.get("https://open.er-api.com/v6/latest/GBP");
        setRates(res.data.rates); // store all rates relative to GBP
      } catch (err) {
        console.error("Failed to fetch currency rates:", err);
      }
    };
    fetchRates();
  }, []);

  // Load user's preferred currency from DB
  useEffect(() => {
    const fetchCurrency = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setCurrency(res.data.currency || "GBP");
      } catch (err) {
        console.error("Failed to fetch currency:", err);
      }
    };
    fetchCurrency();
  }, [user]);

  // Change currency and save to DB
  const changeCurrency = async (newCurrency) => {
    setCurrency(newCurrency);
    if (!user) return; // only save for logged-in users
    try {
      await axios.put(
        `${API_BASE_URL}/api/users/currency`,
        { currency: newCurrency },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (err) {
      console.error("Failed to update currency:", err);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyProvider;
