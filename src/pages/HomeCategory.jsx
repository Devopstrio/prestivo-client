import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";  // ⭐ ADD THIS FOR REDIRECT

const HomeCategory = ({ onViewAll }) => {
  const navigate = useNavigate(); // ⭐ Initialize Navigation
  const scrollRef = useRef(null);

  const handleScrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const handleScrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  const categories = [
    { name: "Personal Care", img:"/brands/brand1.jpg"},
    { name: "Accessories", img: "/brands/brand2.png"},
    { name: "Makeup", img: "/brands/brand3.jpg" },
    { name: "Mobiles", img: "/brands/brand4.jpg"},
    { name: "Beauty", img: "/brands/brand5.jpg" },
    { name: "Bags", img: "/brands/brand6.jpg" },
    { name: "Footwear", img: "/brands/brand7.jpg" },
    { name: "Books", img: "/brands/brand8.jpg" },
  ];

  const styles = {
    container: {
      width: "100%",
      marginTop: "40px",
      padding: "0 20px",
      boxSizing: "border-box",
    },

    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "22px",
    },

    verifiedIcon: {
      color: "#3B82F6",
      fontSize: "28px",
      fontWeight: "bold",
    },

    viewAll: {
      fontSize: "17px",
      fontWeight: "600",
      color: "#2563EB",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      marginRight: "30px",
    },

    wrapper: {
      position: "relative",
      width: "100%",
    },

    scrollContainer: {
      display: "flex",
      gap: "18px",
      overflowX: "auto",
      scrollBehavior: "smooth",
      paddingBottom: "4px",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    },

    card: {
      minWidth: "200px",
      background: "white",
      borderRadius: "18px",
      boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
      border: "1px solid #e6e9f5",
      overflow: "hidden",
      flexShrink: 0,
      transition: "0.25s ease",
      cursor: "pointer",
    },

    imageWrapper: {
      width: "100%",
      height: "200px",
      background: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },

    image: {
      width: "85%",
      height: "85%",
      objectFit: "contain",
      transition: "0.3s ease",
    },

    nameBox: {
      background: "#ffffff",
      width: "100%",
      padding: "14px 0",
      textAlign: "center",
      borderTop: "1px solid #e6e9f5",
    },

    nameText: {
      color: "#1E3A8A",
      fontSize: "18px",
      fontWeight: "600",
      fontFamily: "Poppins",
    },

    arrowBtnLeft: {
      position: "absolute",
      left: "-10px",
      top: "40%",
      background: "#ffffff",
      width: "45px",
      height: "45px",
      borderRadius: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "20px",
      boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
      cursor: "pointer",
      zIndex: 10,
    },

    arrowBtnRight: {
      position: "absolute",
      right: "-10px",
      top: "40%",
      background: "#ffffff",
      width: "45px",
      height: "45px",
      borderRadius: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "20px",
      boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
      cursor: "pointer",
      zIndex: 10,
    },
  };

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.headerRow}>
        <h2 className="gradientTitle" style={{ fontSize: "30px", display: "flex", alignItems: "center", gap: "10px" }}>
          Original Brands <span style={styles.verifiedIcon}>✓</span>
        </h2>

        <div style={styles.viewAll} onClick={onViewAll}>
          VIEW ALL →
        </div>
      </div>

      {/* SLIDER */}
      <div style={styles.wrapper}>
        <div style={styles.arrowBtnLeft} onClick={handleScrollLeft}>❮</div>

        <div style={styles.scrollContainer} className="hide-scrollbar" ref={scrollRef}>
          {categories.map((cat, index) => (
            <div 
              key={index} 
              style={styles.card}

              onClick={() => navigate(`/category/${cat.name}`)}   // ⭐ REDIRECT ON CLICK

              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-6px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0px)")}
            >
              <div style={styles.imageWrapper}>
                <img src={cat.img} alt={cat.name} style={styles.image} />
              </div>

              <div style={styles.nameBox}>
                <p style={styles.nameText}>{cat.name}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.arrowBtnRight} onClick={handleScrollRight}>❯</div>
      </div>

      {/* HIDE SCROLLBAR */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }

        .gradientTitle {
          background: linear-gradient(90deg, #1E3A8A, #3B82F6);
          -webkit-background-clip: text;
          color: transparent;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default HomeCategory;
