import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiSettings,
  FiSave,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiPackage,
  FiClock,
  FiCalendar,
  FiUpload
} from "react-icons/fi";
import API_BASE_URL from "../config";
import "../styles/Customization.css";

/* ===============================
   TIME CONVERSION HELPERS
================================ */
// IST ➜ UTC (store)
const istToUtcTime = (istTime) => {
  if (!istTime) return "00:00:00";
  const today = new Date().toISOString().split("T")[0];
  const istDate = new Date(`${today}T${istTime}:00+05:30`);
  return istDate.toISOString().split("T")[1].split(".")[0];
};

// UTC ➜ IST (show)
const utcToIstTime = (utcTime) => {
  if (!utcTime) return "00:00";
  const today = new Date().toISOString().split("T")[0];
  const utcDate = new Date(`${today}T${utcTime}Z`);
  return utcDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const Customization = () => {
  const [amount, setAmount] = useState(0);
  const [invoiceReferenceNumber, setInvoiceReferenceNumber] = useState("");
  const [employeeCharge, setEmployeeCharge] = useState(0);

  // ⏰ TIME (IST)
  const [freeTimeIST, setFreeTimeIST] = useState("10:00");
  const [expressTimeIST, setExpressTimeIST] = useState("09:00");
  const [codMaxAmount, setCodMaxAmount] = useState(0);

  // 📦 DELIVERY DAYS
  const [free1Days, setFree1Days] = useState(5);
  const [free2Days, setFree2Days] = useState(7);
  const [expressDays, setExpressDays] = useState(2);

  const [loading, setLoading] = useState(false);

  const [defaultProductImage, setDefaultProductImage] = useState(null);
  const [defaultProductImageUrl, setDefaultProductImageUrl] = useState("");

  // SIZE PRICE RULES (GBP)
  const [level1Price, setLevel1Price] = useState(0);
  const [level2Price, setLevel2Price] = useState(0);
  const [level3Price, setLevel3Price] = useState(0);

  // 👶 KIDS SIZE PRICE RULES (GBP)
  const [kidsLevel1Price, setKidsLevel1Price] = useState(0);
  const [kidsLevel2Price, setKidsLevel2Price] = useState(0);
  const [kidsLevel3Price, setKidsLevel3Price] = useState(0);
  const [kidsLevel4Price, setKidsLevel4Price] = useState(0);

  const [standardVat, setStandardVat] = useState(20);
  const [reducedVat, setReducedVat] = useState(5);
  const [zeroVat] = useState(0); // locked


  /* ===============================
     FETCH (NO EXISTING LOGIC BROKEN)
  ================================ */
  useEffect(() => {
    const fetchCustomization = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/customization`);

        setAmount(res.data.expressDeliveryAmountGBP || 0);
        setEmployeeCharge(res.data.deliveryEmployeeChargeGBP || 0);
        setInvoiceReferenceNumber(res.data.invoiceReferenceNumber || "");
        setCodMaxAmount(res.data.cashOnDeliveryMaxAmountGBP || 0);
        setDefaultProductImageUrl(res.data.defaultProductImage || "");

        setStandardVat(res.data.vatRules?.STANDARD?.percentage ?? 20);
        setReducedVat(res.data.vatRules?.REDUCED?.percentage ?? 5);

        // ⏰ TIME
        setFreeTimeIST(
          utcToIstTime(res.data.freeDeliveryTimeUTC || "06:00:00")
        );
        setExpressTimeIST(
          utcToIstTime(res.data.expressDeliveryTimeUTC || "02:00:00")
        );

        // 📦 DAYS
        setFree1Days(res.data.free1DeliveryDays ?? 5);
        setFree2Days(res.data.free2DeliveryDays ?? 7);
        setExpressDays(res.data.expressDeliveryDays ?? 2);

        setLevel1Price(res.data.sizePriceRules?.level1?.extraAmount || 0);
        setLevel2Price(res.data.sizePriceRules?.level2?.extraAmount || 0);
        setLevel3Price(res.data.sizePriceRules?.level3?.extraAmount || 0);

        setKidsLevel1Price(res.data.kidsSizePriceRules?.level1?.extraAmount || 0);
        setKidsLevel2Price(res.data.kidsSizePriceRules?.level2?.extraAmount || 0);
        setKidsLevel3Price(res.data.kidsSizePriceRules?.level3?.extraAmount || 0);
        setKidsLevel4Price(res.data.kidsSizePriceRules?.level4?.extraAmount || 0);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load customization data");
      }
    };

    fetchCustomization();
  }, []);

  /* ===============================
   SAVE (IST ➜ UTC + DAYS)
================================ */
  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      // 🔒 EXISTING (NO CHANGE)
      formData.append("expressDeliveryAmountGBP", amount);
      formData.append("deliveryEmployeeChargeGBP", employeeCharge);
      formData.append("invoiceReferenceNumber", invoiceReferenceNumber);
      formData.append(
        "cashOnDeliveryMaxAmountGBP",
        Number(codMaxAmount)
      );

      formData.append(
        "freeDeliveryTimeUTC",
        istToUtcTime(freeTimeIST)
      );
      formData.append(
        "expressDeliveryTimeUTC",
        istToUtcTime(expressTimeIST)
      );

      formData.append(
        "vatRules",
        JSON.stringify({
          STANDARD: { percentage: standardVat },
          REDUCED: { percentage: reducedVat },
          ZERO: { percentage: 0 }
        })
      );


      // 📦 DELIVERY DAYS
      formData.append("free1DeliveryDays", Number(free1Days));
      formData.append("free2DeliveryDays", Number(free2Days));
      formData.append("expressDeliveryDays", Number(expressDays));

      // ✅ SIZE PRICE RULES (GBP ONLY)
      formData.append(
        "sizePriceRules",
        JSON.stringify({
          level1: { extraAmount: level1Price },
          level2: { extraAmount: level2Price },
          level3: { extraAmount: level3Price },
        })
      );

      formData.append(
        "kidsSizePriceRules",
        JSON.stringify({
          level1: { extraAmount: kidsLevel1Price },
          level2: { extraAmount: kidsLevel2Price },
          level3: { extraAmount: kidsLevel3Price },
          level4: { extraAmount: kidsLevel4Price },
        })
      );

      // 📸 DEFAULT PRODUCT IMAGE (OPTIONAL)
      if (defaultProductImage) {
        formData.append("defaultProductImage", defaultProductImage);
      }

      await axios.put(
        `${API_BASE_URL}/api/customization`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Data's saved successfully!");

    } catch (err) {
      console.error(err);
      toast.error("Failed to save data's. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="customization-container">
      {/* HEADER */}
      <div className="customization-header">
        <div className="customization-header-icon">
          <FiSettings size={36} />
        </div>
        <div className="customization-header-content">
          <h2>Customization</h2>
          <p>Configure delivery pricing, timing & days</p>
        </div>
        <div className="customization-header-badge">
          <FiPackage size={20} />
          <span>Admin Settings</span>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="customization-summary">
        <div className="customization-summary-card">
          <div className="customization-summary-icon customization-express-icon">
            <FiTruck size={28} />
          </div>
          <div className="customization-summary-content">
            <h3>Delivery Configuration</h3>
            <p>Configure the additional charge for priority shipping. This setting applies globally to all orders with express delivery selected.</p>
          </div>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="customization-card">
        <div className="customization-card-header">
          <div className="customization-card-title">
            <h3>Delivery Settings</h3>
            <p className="customization-card-subtitle">
              Global delivery configuration
            </p>
          </div>
        </div>

        {/* EXPRESS AMOUNT - SINGLE LINE WITH PREFIX */}
        <div className="customization-input-group">
          <label className="customization-label">Additional Charge (GBP)</label>
          <div className="customization-input-wrapper">
            <div className="customization-input-prefix">
              <span className="customization-currency-symbol">£</span>
              <span>GBP</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="customization-input"
              min="0"
              step="0.01"
              placeholder="Enter amount"
            />
          </div>
          <p className="customization-label-hint">
            This additional charge will be applied to express delivery orders only. Free delivery options remain unaffected.
          </p>
        </div>

        <div className="customization-input-group">
          <label className="customization-label">Invoice Reference Number</label>

          <div className="customization-input-wrapper">
            <input
              type="text"
              value={invoiceReferenceNumber}
              onChange={(e) => setInvoiceReferenceNumber(e.target.value)}
              className="customization-input"
              placeholder="Enter invoice reference (e.g. INV2025A)"
            />
          </div>

          <p className="customization-label-hint">
            This reference will be used in invoices for identification purposes.
            Alphanumeric values are allowed.
          </p>
        </div>

        <div className="customization-input-group">
          <label className="customization-label">
            Cash on Delivery Max Amount (GBP)
          </label>

          <div className="customization-input-wrapper">
            <div className="customization-input-prefix">
              <span className="customization-currency-symbol">£</span>
              <span>GBP</span>
            </div>
            <input
              type="number"
              value={codMaxAmount}
              onChange={(e) => setCodMaxAmount(e.target.value)}
              className="customization-input"
              min="0"
              step="0.01"
              placeholder="Enter COD limit amount"
            />
          </div>

          <p className="customization-label-hint">
            Cash on Delivery will be disabled if order total exceeds this amount.
            Set <strong>0</strong> to disable COD completely.
          </p>
        </div>

        <div className="customization-input-group">
          <label className="customization-label">
            Default Product Image
          </label>

          <div
            className="customization-image-upload-box"
            onClick={() => document.getElementById("defaultImageInput").click()}
          >
            {/* IMAGE PREVIEW */}
            {(defaultProductImage || defaultProductImageUrl) ? (
              <img
                src={
                  defaultProductImage
                    ? URL.createObjectURL(defaultProductImage)
                    : defaultProductImageUrl
                }
                alt="Default Product"
                className="customization-image-preview"
              />
            ) : (
              <div className="customization-image-placeholder">
                <FiPackage size={48} />
                <p>Click to upload image</p>
              </div>
            )}

            <button
              type="button"
              className="customization-choose-file-btn"
            >
              Choose File
            </button>
          </div>

          <input
            id="defaultImageInput"
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setDefaultProductImage(e.target.files[0])}
          />

          <p className="customization-label-hint">
            This image will be used if a product has no images.
          </p>
        </div>



        {/* DELIVERY TIMES SECTION - TWO TIMES IN SAME ROW */}
        <div className="customization-section-title">
          <FiClock size={20} />
          <span>Delivery Cut-off Times</span>
        </div>
        <div className="customization-row">
          <div className="customization-column">
            <label className="customization-label">
              Free Delivery Cut-off
              <span className="customization-label-description">
                Orders placed before this time qualify for free delivery
              </span>
            </label>
            <div className="customization-input-wrapper">
              <input
                type="time"
                value={freeTimeIST}
                onChange={(e) => setFreeTimeIST(e.target.value)}
                className="customization-input"
              />
            </div>
          </div>

          <div className="customization-column">
            <label className="customization-label">
              Express Delivery Cut-off
              <span className="customization-label-description">
                Orders placed before this time qualify for express delivery
              </span>
            </label>
            <div className="customization-input-wrapper">
              <input
                type="time"
                value={expressTimeIST}
                onChange={(e) => setExpressTimeIST(e.target.value)}
                className="customization-input"
              />
            </div>
          </div>
        </div>

        {/* DELIVERY DAYS SECTION - FIRST 2 IN SAME ROW, NEXT 1 IN NEW ROW */}
        <div className="customization-section-title">
          <FiCalendar size={20} />
          <span>Delivery Timeframes (Days)</span>
        </div>

        {/* First Row - Free1 and Free2 Days */}
        <div className="customization-row">
          <div className="customization-column">
            <label className="customization-label">
              Free1 Delivery Days
              <span className="customization-label-description">
                Standard free delivery timeframe
              </span>
            </label>
            <div className="customization-input-wrapper">
              <input
                type="number"
                value={free1Days}
                onChange={(e) => setFree1Days(e.target.value)}
                className="customization-input"
                min="1"
                placeholder="Enter days"
              />
              <div className="customization-input-suffix">days</div>
            </div>
          </div>

          <div className="customization-column">
            <label className="customization-label">
              Free2 Delivery Days
              <span className="customization-label-description">
                Extended free delivery timeframe
              </span>
            </label>
            <div className="customization-input-wrapper">
              <input
                type="number"
                value={free2Days}
                onChange={(e) => setFree2Days(e.target.value)}
                className="customization-input"
                min="1"
                placeholder="Enter days"
              />
              <div className="customization-input-suffix">days</div>
            </div>
          </div>
        </div>

        {/* Second Row - Express Days Only */}
        <div className="customization-row">
          <div className="customization-column">
            <label className="customization-label">
              Express Delivery Days
              <span className="customization-label-description">
                Priority delivery timeframe (with additional charge)
              </span>
            </label>
            <div className="customization-input-wrapper">
              <input
                type="number"
                value={expressDays}
                onChange={(e) => setExpressDays(e.target.value)}
                className="customization-input"
                min="1"
                placeholder="Enter days"
              />
              <div className="customization-input-suffix">days</div>
            </div>
          </div>

          {/* Empty column for alignment */}
          <div className="customization-column"></div>
        </div>

        <div className="customization-section-title">
          <FiCheckCircle size={20} />
          <span>VAT Configuration (UK)</span>
        </div>

        <div className="customization-row">
          <div className="customization-column">
            <label className="customization-label">Standard VAT (%)</label>
            <div className="customization-input-wrapper">
              <input
                type="number"
                value={standardVat}
                onChange={(e) => setStandardVat(e.target.value)}
                className="customization-input"
                min="0"
                step="0.1"
                placeholder="Enter VAT %"
              />
              <div className="customization-input-suffix">%</div>
            </div>
          </div>

          <div className="customization-column">
            <label className="customization-label">Reduced VAT (%)</label>
            <div className="customization-input-wrapper">
              <input
                type="number"
                value={reducedVat}
                onChange={(e) => setReducedVat(e.target.value)}
                className="customization-input"
                min="0"
                step="0.1"
                placeholder="Enter VAT %"
              />
              <div className="customization-input-suffix">%</div>
            </div>
          </div>
        </div>

        <div className="customization-row">
          <div className="customization-column">
            <label className="customization-label">Zero VAT (%)</label>
            <div className="customization-input-wrapper">
              <input
                type="number"
                value={0}
                disabled
                className="customization-input"
              />
              <div className="customization-input-suffix">%</div>
            </div>
          </div>
        </div>


        {/* <div className="customization-row">
          <div className="customization-column">
            <label className="customization-label">Standard VAT (%)</label>
            <input
              type="number"
              value={standardVat}
              onChange={(e) => setStandardVat(e.target.value)}
              className="customization-input"
              min="0"
              step="0.1"
            />
          </div>

          <div className="customization-column">
            <label className="customization-label">Reduced VAT (%)</label>
            <input
              type="number"
              value={reducedVat}
              onChange={(e) => setReducedVat(e.target.value)}
              className="customization-input"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        <div className="customization-row">
          <div className="customization-column">
            <label className="customization-label">Zero VAT (%)</label>
            <input
              type="number"
              value={0}
              disabled
              className="customization-input"
            />
          </div>
        </div> */}

        <div className="customization-input-group">
  <label className="customization-label">
    Delivery Employee Charge (GBP)
  </label>

  <div className="customization-input-wrapper">
    <div className="customization-input-prefix">
      <span>£</span>
      <span>GBP</span>
    </div>

    <input
      type="number"
      value={employeeCharge}
      onChange={(e) => setEmployeeCharge(e.target.value)}
      className="customization-input"
      min="0"
      step="0.01"
      placeholder="Enter employee earning per order"
    />
  </div>
</div>


        {/* CLOTHING SIZE PRICE RULES */}
        <div className="customization-section-title">
          <FiPackage size={20} />
          <span>Clothing Size Price Rules (GBP)</span>
        </div>

        {/* First Row - L, XL, 2XL & 3XL, 4XL, 5XL */}
        <div className="customization-row">
          <div className="customization-column">
            <label className="customization-label">
              L, XL, 2XL
              <span className="customization-label-description">
                Extra charge added to base price for these sizes
              </span>
            </label>
            <div className="customization-input-wrapper">
              <input
                type="number"
                value={level1Price}
                onChange={(e) => setLevel1Price(e.target.value)}
                className="customization-input"
                min="0"
                placeholder="Enter extra amount"
              />
              <div className="customization-input-suffix">GBP</div>
            </div>
          </div>

          <div className="customization-column">
            <label className="customization-label">
              3XL, 4XL, 5XL
              <span className="customization-label-description">
                Extra charge added to base price for these sizes
              </span>
            </label>
            <div className="customization-input-wrapper">
              <input
                type="number"
                value={level2Price}
                onChange={(e) => setLevel2Price(e.target.value)}
                className="customization-input"
                min="0"
                placeholder="Enter extra amount"
              />
              <div className="customization-input-suffix">GBP</div>
            </div>
          </div>
        </div>

        {/* Second Row - 6XL, 7XL */}
        <div className="customization-row">
          <div className="customization-column">
            <label className="customization-label">
              6XL, 7XL
              <span className="customization-label-description">
                Extra charge added to base price for these sizes
              </span>
            </label>
            <div className="customization-input-wrapper">
              <input
                type="number"
                value={level3Price}
                onChange={(e) => setLevel3Price(e.target.value)}
                className="customization-input"
                min="0"
                placeholder="Enter extra amount"
              />
              <div className="customization-input-suffix">GBP</div>
            </div>
          </div>

          {/* Empty column for alignment (same as Delivery Days section) */}
          <div className="customization-column"></div>
        </div>

        {/* 👶 KIDS SIZE PRICE RULES */}
        <div className="customization-section-title">
          <FiPackage size={20} />
          <span>Kids Size Price Rules (GBP)</span>
        </div>

        {/* First Row - 3–6M, 6–9M, 6–12M & 9–12M, 12–18M, 18–24M */}
        <div className="customization-row">
          <div className="customization-column">
            <label className="customization-label">
              3–6M, 6–9M, 6–12M
              <span className="customization-label-description">
                Base sizes (0–6 Months) have no extra charge
              </span>
            </label>
            <div className="customization-input-wrapper">
              <input
                type="number"
                value={kidsLevel1Price}
                onChange={(e) => setKidsLevel1Price(e.target.value)}
                className="customization-input"
                min="0"
                placeholder="Enter extra amount"
              />
              <div className="customization-input-suffix">GBP</div>
            </div>
          </div>

          <div className="customization-column">
            <label className="customization-label">
              9–12M, 12–18M, 18–24M
              <span className="customization-label-description">
                Extra charge added for larger baby sizes
              </span>
            </label>
            <div className="customization-input-wrapper">
              <input
                type="number"
                value={kidsLevel2Price}
                onChange={(e) => setKidsLevel2Price(e.target.value)}
                className="customization-input"
                min="0"
                placeholder="Enter extra amount"
              />
              <div className="customization-input-suffix">GBP</div>
            </div>
          </div>
        </div>

        {/* Second Row - 0–1Y, 1–2Y, 2–3Y & 3–4Y, 4–5Y, 5–6Y */}
        <div className="customization-row">
          <div className="customization-column">
            <label className="customization-label">
              0–1Y, 1–2Y, 2–3Y
              <span className="customization-label-description">
                Toddler size pricing adjustment
              </span>
            </label>
            <div className="customization-input-wrapper">
              <input
                type="number"
                value={kidsLevel3Price}
                onChange={(e) => setKidsLevel3Price(e.target.value)}
                className="customization-input"
                min="0"
                placeholder="Enter extra amount"
              />
              <div className="customization-input-suffix">GBP</div>
            </div>
          </div>

          <div className="customization-column">
            <label className="customization-label">
              3–4Y, 4–5Y, 5–6Y
              <span className="customization-label-description">
                Extra charge for bigger kids sizes
              </span>
            </label>
            <div className="customization-input-wrapper">
              <input
                type="number"
                value={kidsLevel4Price}
                onChange={(e) => setKidsLevel4Price(e.target.value)}
                className="customization-input"
                min="0"
                placeholder="Enter extra amount"
              />
              <div className="customization-input-suffix">GBP</div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="customization-actions">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`customization-save-btn ${loading ? "customization-loading" : ""}`}
          >
            {loading ? (
              <>
                <FiLoader className="customization-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave size={20} />
                Save Settings
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Customization;