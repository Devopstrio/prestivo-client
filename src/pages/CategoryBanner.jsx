import React from "react";
import { useNavigate } from "react-router-dom";

const CategoryBanner = () => {
  const navigate = useNavigate();

  const categories = [
    { name: "Women", img: "/Category/category1.jpg" },
    { name: "Men", img: "/Category/category2.jpg" },
    { name: "Kids", img: "/Category/category3.jpg" },
    { name: "Footwear", img: "/Category/category4.png" },
    { name: "Home Decor", img: "/Category/category5.jpg" },
    { name: "Beauty", img: "/Category/category6.jpg" },
    { name: "Accessories", img: "/Category/category7.jpg" },
    { name: "Grocery", img: "/Category/category8.jpg" },
  ];

  const goldItems = [
    { img: "/banner/banner1.png" },
    { img: "/banner/banner2.png" },
    { img: "/banner/banner3.png" },
    { img: "/banner/banner4.png" },
  ];

  const styles = {
    container: {
      width: "100%",
      padding: "40px 20px 10px",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "30px",
      boxSizing: "border-box",
    },

    card: {
      width: "150px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      transition: "0.3s ease",
      cursor: "pointer",
    },

    imageWrapper: {
      width: "150px",
      height: "150px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    },

    image: {
      width: "90%",
      height: "90%",
      objectFit: "contain",
    },

    title: {
      marginTop: "12px",
      fontSize: "15px",
      fontWeight: "500",
      color: "#333",
      textAlign: "center",
      fontFamily: "Poppins, Inter, sans-serif",
    },

    goldBannerWrapper: {
      width: "100%",
      marginTop: "25px",
      position: "relative",
      display: "flex",
      justifyContent: "center",
    },

    goldBannerImg: {
      width: "100%",
    },

    goldItemsWrapper: {
      position: "absolute",
      right: "4%",
      top: "50%",
      transform: "translateY(-50%)",
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "20px",
    },

    goldCard: {
      background: "rgba(255, 255, 255, 0.05)",
      border: "2px solid #d6a861",
      borderRadius: "20px",
      width: "160px",
      padding: "10px",
      textAlign: "center",
      backdropFilter: "blur(4px)",
      transition: "0.3s ease",
      marginRight: "30px",
    },

    goldImgBox: {
      width: "100%",
      height: "200px",
      borderRadius: "18px",
      overflow: "hidden",
      background: "#3b2a16",
      marginBottom: "8px",
    },

    goldImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },

    goldText: {
      fontSize: "15px",
      fontWeight: "600",
      color: "#ffd28a",
      fontFamily: "Poppins",
    },
  };

  return (
    <>
      {/* TOP CATEGORY OPTIONS */}
      <div style={styles.container}>
        {categories.map((cat, index) => (
          <div
            key={index}
            style={styles.card}
            onClick={() => navigate(`/category/${cat.name}`)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-5px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0px)")
            }
          >
            <div style={styles.imageWrapper}>
              <img src={cat.img} alt={cat.name} style={styles.image} />
            </div>
            <p style={styles.title}>{cat.name}</p>
          </div>
        ))}
      </div>

      {/* GOLD BANNER */}
      <div style={styles.goldBannerWrapper}>
        <img
          src="/Home/categorybanner.jpg"
          alt="Gold Collection"
          style={styles.goldBannerImg}
        />

        {/* RIGHT GOLD CARDS */}
        <div style={styles.goldItemsWrapper} className="gold-items">
          {goldItems.map((item, index) => (
            <div key={index} style={styles.goldCard}>
              <div style={styles.goldImgBox}>
                <img src={item.img} alt={item.name} style={styles.goldImg} />
              </div>
              <p style={styles.goldText}>{item.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RESPONSIVE CSS */}
      <style>{`
        /* HIDE right-side gold cards on tablet + mobile */
        @media (max-width: 1024px) {
          .gold-items {
            display: none !important;
          }
        }

        /* Hide scrollbar (if needed) */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default CategoryBanner;
