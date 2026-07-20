import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaMoneyBillWave, 
  FaCreditCard, 
  FaCalendarAlt, 
  FaChartBar,
  FaUser,
  FaEnvelope,
  FaShoppingBag,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaDollarSign,
  FaReceipt,
  FaChartLine,
  FaShoppingCart,
  FaSpinner
} from "react-icons/fa";
import { toast } from "react-toastify";
import API_BASE_URL from "../config";
import "../styles/PaymentDetails.css";
import "../styles/LoadingAnimation.css";

const PaymentDetails = () => {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("completed"); // Default to completed tab
  const [subTab, setSubTab] = useState("online");

  // Currency Symbols
  const currencySymbols = {
    GBP: "£",
    INR: "₹",
    USD: "$",
    EUR: "€",
    AUD: "A$",
    CAD: "C$",
    JPY: "¥",
  };

    const [isLoading, setIsLoading] = useState(true);

  // Only show loading for 0.3 seconds on initial page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  };

  // ❌ Remove all cancelled orders
const activeOrders = orders.filter(
  (o) => !o.cancellationStatus || o.cancellationStatus === "none"
);

  

  // Filter by completed / incomplete
  const filteredOrders = activeOrders.filter((o) => {
    
    const isCompleted = o.deliveryCompleted === true;
    const isOnline = o.paymentMethod !== "cod";

    const matchesTab = tab === "completed" ? isCompleted : !isCompleted;
    const matchesSubTab =
      subTab === "online" ? isOnline : o.paymentMethod === "cod";

    return matchesTab && matchesSubTab;
  });

  // COMPLETED ORDERS SUMMARY
  const completedOrders = activeOrders.filter((o) => o.deliveryCompleted);


  const onlineCount = completedOrders.filter((o) => o.paymentMethod !== "cod")
    .length;

  const codCount = completedOrders.filter((o) => o.paymentMethod === "cod")
    .length;

  // Revenue Summary
  const totalRevenue = completedOrders.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );

  const currentMonth = new Date().getMonth();
  const thisMonthRevenue = completedOrders
    .filter((o) => new Date(o.createdAt).getMonth() === currentMonth)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const sixMonthRevenue = completedOrders
    .filter((o) => new Date(o.createdAt) >= sixMonthsAgo)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const lastYear = new Date();
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  const oneYearRevenue = completedOrders
    .filter((o) => new Date(o.createdAt) >= lastYear)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Default currency for summary (take first completed order currency)
  const defaultCurrency = completedOrders[0]?.currency || "GBP";

  // Format currency values
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

    if (isLoading) {
      return (
        <div className="pp-loading-container">
          <div className="pp-loading-content">
            <FaSpinner className="pp-loading-spinner" />
            <h3>Loading </h3>
            <p>Please wait while details are Loading...</p>
          </div>
        </div>
      );
    }

  return (
    <div className="paymentDetailsWrapper">
      {/* Professional Header */}
      <div className="paymentHeaderSection">
        <div className="paymentHeaderContent">
          <div className="paymentHeaderIcon">
            <FaReceipt />
          </div>
          <div className="paymentHeaderText">
            <h1 className="paymentMainTitle">Payment Management</h1>
            <p className="paymentSubtitle">
              Monitor and manage all payment transactions and revenue analytics
            </p>
          </div>
        </div>
        <div className="paymentHeaderStats">
          <div className="headerStatItem">
            <FaShoppingCart className="headerStatIcon" />
            <div>
              <span className="headerStatLabel">Total Orders</span>
              <span className="headerStatValue">{activeOrders.length}</span>
            </div>
          </div>
          <div className="headerStatItem">
            <FaCheckCircle className="headerStatIcon" />
            <div>
              <span className="headerStatLabel">Completed</span>
              <span className="headerStatValue">{completedOrders.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards - only in Completed tab */}
      {tab === "completed" && (
        <div className="paymentSummarySection">
          <h3 className="paymentSectionTitle">
            <FaChartLine className="sectionTitleIcon" />
            Revenue Overview
          </h3>
          <div className="paymentSummaryGrid">
            <div className="paymentSummaryCard paymentSummaryOnline">
              <div className="paymentSummaryIcon">
                <FaCreditCard />
              </div>
              <div className="paymentSummaryContent">
                <p className="paymentSummaryLabel">Online Payments</p>
                <h3 className="paymentSummaryValue">{onlineCount}</h3>
                <span className="paymentSummarySubtext">Completed transactions</span>
              </div>
            </div>

            <div className="paymentSummaryCard paymentSummaryCOD">
              <div className="paymentSummaryIcon">
                <FaMoneyBillWave />
              </div>
              <div className="paymentSummaryContent">
                <p className="paymentSummaryLabel">COD Payments</p>
                <h3 className="paymentSummaryValue">{codCount}</h3>
                <span className="paymentSummarySubtext">Cash on delivery</span>
              </div>
            </div>

            <div className="paymentSummaryCard paymentSummaryMonth">
              <div className="paymentSummaryIcon">
                <FaCalendarAlt />
              </div>
              <div className="paymentSummaryContent">
                <p className="paymentSummaryLabel">This Month</p>
                <h3 className="paymentSummaryValue">
                  {currencySymbols[defaultCurrency]}{formatCurrency(thisMonthRevenue)}
                </h3>
                <span className="paymentSummarySubtext">Current month revenue</span>
              </div>
            </div>

            <div className="paymentSummaryCard paymentSummarySixMonths">
              <div className="paymentSummaryIcon">
                <FaChartBar />
              </div>
              <div className="paymentSummaryContent">
                <p className="paymentSummaryLabel">6 Months</p>
                <h3 className="paymentSummaryValue">
                  {currencySymbols[defaultCurrency]}{formatCurrency(sixMonthRevenue)}
                </h3>
                <span className="paymentSummarySubtext">Half-year performance</span>
              </div>
            </div>

            <div className="paymentSummaryCard paymentSummaryYear">
              <div className="paymentSummaryIcon">
                <FaChartLine />
              </div>
              <div className="paymentSummaryContent">
                <p className="paymentSummaryLabel">1 Year</p>
                <h3 className="paymentSummaryValue">
                  {currencySymbols[defaultCurrency]}{formatCurrency(oneYearRevenue)}
                </h3>
                <span className="paymentSummarySubtext">Annual revenue</span>
              </div>
            </div>

            <div className="paymentSummaryCard paymentSummaryTotal">
              <div className="paymentSummaryIcon">
                <FaDollarSign />
              </div>
              <div className="paymentSummaryContent">
                <p className="paymentSummaryLabel">Total Revenue</p>
                <h3 className="paymentSummaryValue">
                  {currencySymbols[defaultCurrency]}{formatCurrency(totalRevenue)}
                </h3>
                <span className="paymentSummarySubtext">All-time earnings</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="paymentNavigationSection">
        <div className="paymentTabsContainer">
          <button
            className={tab === "incomplete" ? "paymentActiveTab" : "paymentTab"}
            onClick={() => setTab("incomplete")}
          >
            <FaClock className="paymentTabIcon" />
            Pending Orders Payments
            <span className="tabBadge">
              {orders.filter(o => !o.deliveryCompleted).length}
            </span>
          </button>

          <button
            className={tab === "completed" ? "paymentActiveTab" : "paymentTab"}
            onClick={() => setTab("completed")}
          >
            <FaCheckCircle className="paymentTabIcon" />
            Completed Orders Payments
            <span className="tabBadge">
              {completedOrders.length}
            </span>
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="paymentSubTabsContainer">
          <button
            className={subTab === "online" ? "paymentActiveSubTab" : "paymentSubTab"}
            onClick={() => setSubTab("online")}
          >
            <FaCreditCard className="paymentSubTabIcon" />
            Online Payments
          </button>

          <button
            className={subTab === "cod" ? "paymentActiveSubTab" : "paymentSubTab"}
            onClick={() => setSubTab("cod")}
          >
            <FaMoneyBillWave className="paymentSubTabIcon" />
            Cash on Delivery
          </button>
        </div>
      </div>

      {/* Orders Summary */}
      <div className="paymentOrdersSummary">
        <div className="paymentTotalAmount">
          <div className="totalAmountContent">
            <span className="totalAmountLabel">Total Amount in View:</span>
            <span className="totalAmountValue">
              {currencySymbols[defaultCurrency]}{" "}
              {formatCurrency(filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
            </span>
          </div>
          <span className="orderCountBadge">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
          </span>
        </div>
      </div>

      {/* Order Cards */}
      <div className="paymentOrdersSection">
        <h3 className="paymentSectionTitle">
          <FaShoppingBag className="sectionTitleIcon" />
          Order Details
        </h3>
        
        <div className="paymentOrdersList">
          {filteredOrders.length === 0 ? (
            <div className="paymentEmptyState">
              <FaTimesCircle className="paymentEmptyIcon" />
              <h4>No orders found</h4>
              <p>There are no {tab} {subTab.toLowerCase()} orders at the moment.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div className="paymentOrderCard" key={order._id}>
                <div className="paymentOrderHeader">
                  <div className="paymentOrderInfo">
                    <span className="paymentOrderId">ORDER #{order._id.toUpperCase()}</span>
                    <span className="paymentOrderDate">
                      <FaCalendarAlt className="inlineIcon" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`paymentStatusBadge paymentStatus${order.paymentStatus}`}>
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>

                <div className="paymentOrderContent">
                  <div className="paymentCustomerSection">
                    <div className="paymentOrderRow">
                      <FaUser className="paymentRowIcon" />
                      <div className="customerInfo">
                        <strong>{order.userDetails?.name}</strong>
                        <span className="customerEmail">{order.userDetails?.email}</span>
                      </div>
                    </div>

                    <div className="paymentOrderRow">
                      <FaCreditCard className="paymentRowIcon" />
                      <div>
                        <strong>Payment Method:</strong>
                        <span className="paymentMethod">{order.paymentMethod.toUpperCase()}</span>
                      </div>
                    </div>

                    {order.paymentId && (
                      <div className="paymentOrderRow">
                        <FaEnvelope className="paymentRowIcon" />
                        <div>
                          <strong>Payment ID:</strong>
                          <span className="paymentId">{order.paymentId}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="paymentProductsSection">
                    <div className="productsHeader">
                      <FaShoppingBag className="paymentRowIcon" />
                      <strong>Products ({order.products.length})</strong>
                    </div>
                    <div className="paymentProductsList">
                      {order.products.map((p, i) => (
                        <div className="paymentProductItem" key={i}>
                          <span className="productName">{p.name}</span>
                          <span className="productQty">× {p.qty}</span>
                          <span className="productTotal">
                            {currencySymbols[order.currency]}{formatCurrency(p.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="paymentOrderTotal">
                    <div className="totalLabel">Order Total:</div>
                    <div className="paymentTotalValue">
                      {currencySymbols[order.currency]}{formatCurrency(order.totalAmount)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;