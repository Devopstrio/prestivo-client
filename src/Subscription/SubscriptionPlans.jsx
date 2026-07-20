import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import SubscriptionPopupForm from "./SubscriptionPopupForm";
import FeatureSection from "./FeatureSection";
import { FaCheck, FaCrown, FaPaperPlane, FaLock, FaStar, FaTag } from "react-icons/fa";
import Select from "react-select";
import countryList from "react-select-country-list";
import countryData from "country-telephone-data";
import "../styles/SubscriptionPlans.css";
import API_BASE_URL from "../config";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";

export default function SubscriptionPlans() {
  const { user } = useContext(AuthContext);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isYearly, setIsYearly] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  const [queryForm, setQueryForm] = useState({
    name: "",
    email: "",
    phone: "",
    regionCode: "",
    country: null,
    message: "",
  });

  const options = countryList().getData();

  useEffect(() => {
    if (user?.subscriptionId) {
      setSubscriptionId(user.subscriptionId);
    }
  }, [user]);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user?.email) return;

      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/subscriptionstatus`,
          {
            params: { email: user.email }
          }
        );

        setSubscriptionInfo(res.data);
      } catch (err) {
        console.error("Failed to fetch subscription status", err);
      }
    };

    fetchSubscriptionStatus();
  }, [user?.email]);


  useEffect(() => {
    console.log("📦 Current Plan:", user?.subscriptionPlan || "No plan found");
  }, [user]);

  const handleCountryChange = (value) => {
    const foundCountry =
      countryData.allCountries.find(
        (c) =>
          c.name.toLowerCase() === value.label.toLowerCase() ||
          c.iso2.toLowerCase() === value.value.toLowerCase()
      ) || {};

    const dialCode = foundCountry.dialCode ? `+${foundCountry.dialCode}` : "";
    setQueryForm((prev) => ({
      ...prev,
      country: value,
      regionCode: dialCode,
    }));
  };

  const handleQueryChange = (e) => {
    const { name, value } = e.target;
    setQueryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();

    if (!queryForm.name || !queryForm.email || !queryForm.phone || !queryForm.message) {
      toast.warn("Please fill all required fields.");
      return;
    }

    setLoading(true);
    setSuccessMsg("");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/subscription/query`, {
        name: queryForm.name,
        email: queryForm.email,
        phone: queryForm.phone,
        regionCode: queryForm.regionCode,
        message: queryForm.message,
      });

      if (res.status === 201) {
        setSuccessMsg("Thank you! Your query has been submitted successfully.");
        setQueryForm({
          name: "",
          email: "",
          phone: "",
          regionCode: "",
          country: null,
          message: "",
        });
      }
    } catch (error) {
      console.error("❌ Error submitting query:", error);
      toast.error("Something went wrong while sending your query.");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: "SUB_FREE",
      name: "Free Plan",
      gbp: 0.0,
      discount: "7 Days Free Trial",
      period: "7 Days Trial",
      description: "Explore our platform with limited access",
      features: [
        "Add up to 10 products",
        "3 stock per product",
        "10 AI requests limit",
        "Email Service",
        "Limited Storage",
        "Low Priority Support",
      ],
    },
    {
      id: "SUB_MONTH",
      name: "Monthly Plan",
      gbp: 49.99,
      discount: "Save more with Yearly Plan",
      period: "month",
      description: "Perfect for small businesses and startups",
      features: [
        "Add up to 1000 products",
        "30 stock per product",
        "80 AI requests limit",
        "Unlimited orders",
        "Email Service",
        "Limited Storage",
        "Average Priority Support",
      ],
    },
    {
      id: "SUB_YEAR",
      name: "Yearly Plan",
      gbp: 549.99,
      discount: "Pay for 11 months, get 1 month FREE • Save £49.99",
      period: "year",
      recommended: true,
      description: "Best value with unlimited access and priority support",
      features: [
        "Unlimited products",
        "Unlimited stock per product",
        "Unlimited orders",
        "Unlimited AI requests",
        "Unlimited Email Service",
        "Unlimited Storage",
        "High Priority Support",
      ],
      icon: <FaCrown />,
    },
  ];

  const handlePlanSelect = (plan, index) => {
    setActiveCard(index);
    setSelectedPlan(plan);
  };

  const handleClosePopup = () => {
    setSelectedPlan(null);
    setActiveCard(null);
  };

  const currentPlan = (subscriptionInfo?.plan || "NA").trim();
  const subscriptionStatus = subscriptionInfo?.status
    ? subscriptionInfo.status.charAt(0).toUpperCase() +
    subscriptionInfo.status.slice(1).toLowerCase()
    : "None";

  const isFreePlan =
    currentPlan.toLowerCase().includes("free") ||
    currentPlan.toLowerCase().includes("trial");

  const showCurrentPlan = user && !isFreePlan;
  const isPaidPlan =
    currentPlan.toLowerCase().includes("month") ||
    currentPlan.toLowerCase().includes("year");

  const getPlanDisplayNameFromCurrent = (planName = "") => {
    const name = planName.toLowerCase();

    if (name.includes("free") || name.includes("trial")) return "Free";
    if (name.includes("month")) return "Professional";
    if (name.includes("year")) return "Enterprise";

    return planName; // fallback safety
  };


  return (
    <>
      <Navbar />
      <div className="pricing-section">
        <div className="pricing-hero" style={{ marginTop: "40px" }}>
          <h1>Choose Your Subscription Plan</h1>
          <p className="hero-description">
            Select the perfect plan for your business needs. All plans include our
            core e-commerce platform with advanced features.
          </p>

          {showCurrentPlan && (
            <div
              className="current-plan-info"
              style={{
                marginTop: "15px",
                fontSize: "16px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              <strong>Your Current Plan:</strong>{" "}
              {getPlanDisplayNameFromCurrent(currentPlan)}{" "}
              <span
                style={{
                  color:
                    subscriptionStatus.toLowerCase() === "active"
                      ? "green"
                      : subscriptionStatus.toLowerCase() === "expired"
                        ? "red"
                        : "gray",
                  fontWeight: "600",
                }}
              >
                ({subscriptionStatus})
              </span>
            </div>
          )}

        </div>

        <div className="pricing-cards">
          {plans.map((plan, index) => {
            const borderColor =
              plan.name.toLowerCase().includes("year")
                ? "#ffb400"
                : plan.name.toLowerCase().includes("month")
                  ? "#007bff"
                  : "#ddd";

            const isCurrent =
              plan.name.toLowerCase().trim() ===
              (currentPlan?.toLowerCase().trim() || "");

            const isMonthlyOrYearly =
              currentPlan?.toLowerCase().includes("month") ||
              currentPlan?.toLowerCase().includes("year");

            const disableFreePlan =
              isMonthlyOrYearly && plan.name.toLowerCase().includes("free");

            const isExpired = subscriptionStatus?.toLowerCase() === "expired";
            const isActiveOrNone =
              subscriptionStatus?.toLowerCase() === "active" ||
              subscriptionStatus?.toLowerCase() === "none";

            const isFreePlan = plan.name.toLowerCase().includes("free");

            return (
              <div
                key={plan.id}
                className={`pricing-card ${activeCard === index ? "active" : ""} ${isCurrent ? "active-plan" : ""}
       ${plan.id === "SUB_YEAR" ? "yearly-plan" : ""}`}
                style={{
                  border:
                    activeCard === index
                      ? `3px solid ${borderColor}`
                      : `2px solid ${borderColor}`,
                  transition: "border-color 0.3s ease",
                  opacity: disableFreePlan ? 0.6 : 1,
                  pointerEvents: disableFreePlan ? "none" : "auto",
                }}
              >
                {plan.icon && <div className="plan-icon-top">{plan.icon}</div>}

                {plan.recommended && (
                  <div className="recommended-badge">
                    <FaStar className="rec-icon" /> Recommended
                  </div>
                )}

                <div className="plan-header">
                  <h3>
                    {plan.id === "SUB_FREE"
                      ? "Free"
                      : plan.id === "SUB_MONTH"
                        ? "Professional"
                        : plan.id === "SUB_YEAR"
                          ? "Enterprise"
                          : plan.name}
                  </h3>
                </div>


                <div className="price">
                  <span className="amount">£{plan.gbp.toFixed(2)}</span>
                  <span className="period">/{plan.period}</span>
                </div>

                {plan.discount && (
                  <div className="discount-badge-inline">
                    <FaTag className="discount-icon" /> {plan.discount}
                  </div>
                )}

                <p className="plan-description">{plan.description}</p>

                <ul className="features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="feature-item">
                      <span className="checkmark">
                        <FaCheck />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* ------------------------- */}
                {/*  UPDATED FINAL BUTTON UI  */}
                {/* ------------------------- */}

                {isPaidPlan && isFreePlan ? (
                  // USER ALREADY HAS MONTHLY/YEARLY → CANNOT SELECT FREE PLAN
                  <button className="select-button secondary" id="select-button" disabled>
                    <FaLock style={{ marginRight: "6px" }} />
                    You can't access this plan
                  </button>
                ) : isFreePlan && isExpired ? (
                  // FREE PLAN + EXPIRED → Can't Access
                  <button className="select-button secondary" id="select-button" disabled>
                    <FaLock style={{ marginRight: "6px" }} />
                    You can't access this plan
                  </button>
                ) : isExpired ? (
                  // MONTH/YEAR PLAN + EXPIRED → Upgrade
                  <button
                    className="select-button primary"
                    id="select-button"
                    style={{ border: "none" }}
                    onClick={() => handlePlanSelect(plan, index)}
                  >
                    Upgrade
                  </button>
                ) : isCurrent ? (
                  // CURRENT ACTIVE PLAN → Your Current Plan
                  <button className="select-button secondary" id="select-button" disabled>
                    Your Current Plan
                  </button>
                ) : isFreePlan ? (
                  // FREE PLAN (Active)
                  <button
                    className="select-button primary"
                    id="select-button"
                    onClick={() => handlePlanSelect(plan, index)}
                  >
                    Try Free
                  </button>
                ) : (
                  // NORMAL PAID PLAN (Not Current)
                  <button
                    className="select-button primary"
                    id="select-button"
                    onClick={() => handlePlanSelect(plan, index)}
                  >
                    Upgrade
                  </button>
                )}
              </div>
            );

          })}
        </div>

        <FeatureSection />

        {selectedPlan && (
          <SubscriptionPopupForm
            plan={selectedPlan}
            onClose={handleClosePopup}
            subscriptionId={subscriptionId || user?.subscriptionId || null}
          />
        )}

        <div className="query-form-section">
          <h2>Have Any Questions?</h2>
          <p>
            Fill out the form below and our support team will get back to you shortly.
          </p>

          <form className="query-form" onSubmit={handleQuerySubmit}>
            <div className="form-row">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={queryForm.name}
                onChange={handleQueryChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={queryForm.email}
                onChange={handleQueryChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="country-select" style={{ textAlign: "left" }}>
                <Select
                  options={options}
                  value={queryForm.country}
                  onChange={handleCountryChange}
                  placeholder="Select Country"
                />
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={queryForm.phone}
                onChange={handleQueryChange}
                required
              />
            </div>

            <textarea
              name="message"
              rows="4"
              placeholder="Type your query here..."
              value={queryForm.message}
              onChange={handleQueryChange}
              required
            ></textarea>

            <button type="submit" className="query-submit-btn" disabled={loading}>
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  <FaPaperPlane /> Send Message
                </>
              )}
            </button>

            {successMsg && <p className="success-msg">{successMsg}</p>}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}