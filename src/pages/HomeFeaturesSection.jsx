import React from "react";
import { FaShoppingBag } from "react-icons/fa";   // ⭐ NEW ICON

const HomeFeaturesSection = ({ onShopNow }) => {
  const features = [
    {
      title: "Trending Now",
      img: "/brands/brand9.jpg",
    },
    {
      title: "Budget Buys",
      img: "/brands/brand10.jpg",
    },
    {
      title: "Top Rated Picks",
      img: "/brands/brand11.jpg",
    },
    {
      title: "Daily Essentials",
      img: "/brands/brand12.jpg",
    },
  ];

  const styles = {
    wrapper: {
      width: "100%",
      marginTop: "50px",
      marginBottom: "50px",
      overflow: "hidden",
      background: "linear-gradient(90deg, #ffffff 0%, #f7f7ff 40%, #c2e9ff 100%)",
      display: "flex",
      alignItems: "stretch",
      padding: "0",
    },

    left: {
      width: "32%",
      minWidth: "320px",
      background: "#ffffff",
      padding: "60px 40px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      borderRight: "1px solid #eee",
    },

    head1: {
      fontSize: "38px",
      fontWeight: "700",
      marginBottom: "10px",
      color: "#2b2b2b",
      fontFamily: "Poppins",
    },

    head2: {
      fontSize: "54px",
      fontWeight: "800",
      marginBottom: "12px",
      color: "#1f48ff",
      lineHeight: "1.1",
    },

    subText: {
      fontSize: "20px",
      marginBottom: "30px",
      fontWeight: "500",
      color: "#444",
    },

    shopBtn: {
      background: "#1f48ff",
      padding: "15px 32px",
      borderRadius: "14px",
      fontSize: "20px",
      fontWeight: "700",
      color: "#fff",
      cursor: "pointer",
      width: "fit-content",
      boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
      transition: "0.3s ease",
      border: "none",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },

    right: {
      width: "68%",
      padding: "35px 25px",
      display: "flex",
      justifyContent: "space-evenly",
      alignItems: "center",
      gap: "25px",
      flexWrap: "nowrap",
    },

    card: {
      background: "#ffffff",
      width: "230px",
      borderRadius: "20px",
      padding: "18px",
      textAlign: "center",
      boxShadow: "0px 6px 18px rgba(0,0,0,0.12)",
    },

    imgBox: {
      width: "100%",
      height: "250px",
      borderRadius: "18px",
      overflow: "hidden",
      marginBottom: "14px",
      background: "#f4f4f4",
    },

    img: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },

    cardTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#333",
      fontFamily: "Poppins",
    },
  };

  return (
    <>
      {/* RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 1024px) {
          .hf-wrapper {
            flex-wrap: wrap;
          }
          .hf-left {
            width: 100% !important;
            min-width: 100% !important;
            text-align: center;
            padding: 40px 20px !important;
            border-right: none !important;
            border-bottom: 1px solid #eee;
          }
          .hf-right {
            width: 100% !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 20px !important;
            padding: 25px !important;
          }
        }

        @media (max-width: 600px) {
          .hf-left {
            padding: 30px 15px !important;
          }
          .hf-left h1 {
            font-size: 28px !important;
          }
          .hf-left h2 {
            font-size: 38px !important;
          }
          .hf-left p {
            font-size: 16px !important;
          }
          .hf-shopBtn {
            padding: 12px 24px !important;
            font-size: 18px !important;
          }
          .hf-right {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            padding: 20px 10px !important;
          }
          .hf-right::-webkit-scrollbar {
            display: none;
          }
          .hf-card {
            min-width: 200px !important;
            width: 200px !important;
            flex-shrink: 0 !important;
          }
          .hf-imgBox {
            height: 190px !important;
          }
        }

        /* ICON HOVER */
        .hf-shopBtn:hover .icon {
          transform: translateX(4px);
        }
      `}</style>

      <div className="hf-wrapper" style={styles.wrapper}>
        
        {/* LEFT SIDE */}
        <div className="hf-left" style={styles.left}>
          <h1 style={styles.head1}>Smart Shopping</h1>
          <h2 style={styles.head2}>Best Deals Today</h2>
          <p style={styles.subText}>Order Now • Exclusive Offers • Trending Picks</p>

          {/* ⭐ UPDATED BUTTON WITH ICON ⭐ */}
          <button
            className="hf-shopBtn"
            onClick={onShopNow}
            style={styles.shopBtn}
            onMouseEnter={(e) => (e.target.style.background = "#5200c3")}
            onMouseLeave={(e) => (e.target.style.background = "#6a00ff")}
          >
            <FaShoppingBag className="icon" style={{ transition: "0.3s ease" }} />
            Shop Now
          </button>
        </div>

        {/* RIGHT SIDE CARDS */}
        <div className="hf-right" style={styles.right}>
          {features.map((item, index) => (
            <div className="hf-card" key={index} style={styles.card}>
              <div className="hf-imgBox" style={styles.imgBox}>
                <img src={item.img} alt={item.title} style={styles.img} />
              </div>
              <p style={styles.cardTitle}>{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomeFeaturesSection;
