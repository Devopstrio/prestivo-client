import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  FaCreditCard,
  FaLock,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import "../styles/PaymentGateway.css";
import API_BASE_URL from "../config"; // ✅ backend URL

const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;

export default function PaymentGateway({ amountGBP, plan, user, onClose }) {
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // ✅ prevents closing while processing


  // ✅ Close modal only when not processing
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isProcessing) {
      onClose();
    }
  };

  // ✅ ESC key listener
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && !isProcessing) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, isProcessing]);

  // ✅ Update payment status in backend
  const updatePaymentStatus = async (status, paymentId = "") => {
    try {
      await axios.put(`${API_BASE_URL}/api/subscription/updatePayment`, {
        id: user.subscriptionId,
        paymentId: paymentId || "N/A",
        paymentType: "PayPal",
        paymentStatus: status,
      });
      console.log(`✅ Payment status updated: ${status}`);
    } catch (err) {
      console.error("❌ Error updating payment status:", err);
    }
  };

  return (
    <div className="payment-overlay" onClick={handleOverlayClick}>
      <div className="payment-container">
        {/* Header */}
        <div className="payment-header">
          <h2 className="payment-title">
            <FaCreditCard className="payment-icon" />
            Complete Your Payment
          </h2>
          <button
            className="close-btn"
            onClick={!isProcessing ? onClose : undefined}
            aria-label="Close payment modal"
            disabled={isProcessing}
          >
            <FaTimes />
          </button>
        </div>

        {/* Plan Summary */}
        <div className="payment-summary">
          <div className="summary-item">
            <span className="summary-label">Plan:</span>
            <span className="summary-value">{plan}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Amount:</span>
            <span className="summary-amount">${amountGBP} GBP</span>
          </div>
          {user && (
            <div className="summary-item">
              <span className="summary-label">User:</span>
              <span className="summary-value">{user.name}</span>
            </div>
          )}
        </div>

        {/* Secure Info */}
        <div className="secure-info">
          <div className="secure-header">
            <FaLock className="secure-icon" />
            <span>Secure Payment</span>
          </div>
          <p className="secure-description">
            All payments are securely processed through PayPal's encrypted system.
          </p>
          <div className="secure-note">
            <FaExclamationTriangle className="note-icon" />
            <span>Please do not close this window until the transaction completes.</span>
          </div>
        </div>

        {/* ✅ PayPal Integration */}
        {!isPaid && (
          <div className="paypal-wrapper">
            <PayPalScriptProvider
              options={{
                "client-id": PAYPAL_CLIENT_ID,
                currency: "GBP",
                intent: "capture",
                "enable-funding": "paypal,card",
                "disable-funding": "paylater,credit",
              }}
            >
              <PayPalButtons
                style={{
                  layout: "vertical",
                  color: "blue",
                  shape: "rect",
                  label: "paypal",
                  height: 48,
                  tagline: false,
                }}
                forceReRender={[amountGBP, plan]}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          value: amountGBP,
                          currency_code: "GBP",
                        },
                        description: `${plan} Subscription`,
                      },
                    ],
                    application_context: {
                      shipping_preference: "NO_SHIPPING",
                    },
                  });
                }}
                // ✅ Improved onApprove for smooth PayPal closure
                onApprove={(data, actions) => {
                  setIsProcessing(true);

                  // Return the capture promise directly so PayPal knows when to finish UI
                  return actions.order
                    .capture()
                    .then(async (details) => {
                      const transactionId = details?.id || "UnknownTxn";

                      try {
                        // ✅ Update backend payment status
                        await updatePaymentStatus("Completed", transactionId);
                        setIsPaid(true);

                        // ✅ Fetch updated subscription details
                        const res = await axios.get(
                          `${API_BASE_URL}/api/subscription/${user.subscriptionId}`
                        );
                        const updated = res?.data?.data;

                        // ✅ If payment is completed
                        if (updated?.paymentStatus === "Completed") {
                          // 🎉 Show alert only if usersubscribed is false
                          if (!updated?.subscribed) {
                            toast.success(
                              `Payment ${updated.paymentStatus} Thank you for selecting the ${updated.plan} Plan! We'll send your login credentials soon!.`
                            );
                          } else {
                            toast.success(
                              `Payment Successful! Plan: ${updated.plan}\nStatus: ${updated.paymentStatus}!`
                            );
                          }


                        }
                        // ❌ Failed payment
                        else if (updated?.paymentStatus === "Failed") {
                          toast.error(`Payment Failed! Please try again.\nStatus: ${updated.paymentStatus}`);
                        }
                        // ⚠️ Cancelled payment
                        else if (updated?.paymentStatus === "Cancelled") {
                          toast.error(`Payment Cancelled by user.\nStatus: ${updated.paymentStatus}`);
                        }
                        // ℹ️ Unknown case
                        else {
                          toast.error(`Payment Status: ${updated?.paymentStatus || "Unknown"}`);
                        }
                      } catch (err) {
                        // console.error("❌ Error updating backend:", err);
                        toast.warn("Payment completed, but status update failed. Please contact support.");
                      } finally {
                        setIsProcessing(false);
                      }

                      // ✅ Close popup slightly after success
                      setTimeout(() => onClose(), 1200);
                    })
                    .catch(async (error) => {
                      // console.error("❌ Payment capture error:", error);
                      await updatePaymentStatus("Failed");
                      toast.error("❌ Payment verification failed. Please contact support.");
                      setIsProcessing(false);
                    });
                }}


                onError={async (err) => {
                  console.error("❌ PayPal Error:", err);
                  toast.error("Payment failed. Please try again later.");
                  await updatePaymentStatus("Failed");
                  setIsProcessing(false);
                }}
                onCancel={async () => {
                  console.log("⚠️ Payment cancelled by user");
                  await updatePaymentStatus("Cancelled");
                  setIsProcessing(false);
                }}
              />
            </PayPalScriptProvider>
          </div>
        )}

        {/* Footer */}
        <div className="payment-footer">
          <button
            className="payment-cancel-btn"
            onClick={!isProcessing ? onClose : undefined}
            disabled={isProcessing}
          >
            Cancel Payment
          </button>
        </div>
      </div>
    </div>
  );
}
