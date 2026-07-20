import { useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/NotFound.css";

export default function NotFound() {

  useEffect(() => {
    if (window.innerWidth >= 1025) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="notfound-wrapper">

      <div className="notfound-container">

        {/* 🔹 TOP SECTION */}
        <div className="notfound-top">
          <h1 className="notfound-heading">Page Not Found</h1>

          <p className="notfound-subtext">
            Uh oh, we can’t seem to find the page you’re looking for.
            It may have been moved or deleted.
          </p>

          <div className="notfound-buttons">
            <Link to="/" className="notfound-btn primary">
              Go to Home
            </Link>

            <Link to="/contact" className="notfound-btn secondary">
              Contat Us
            </Link>
          </div>
        </div>

        {/* 🔹 BOTTOM IMAGE SECTION */}
        <div className="notfound-bottom">
          <img
            src="/Home/notfound.jpg"
            alt="Page Not Found Illustration"
            className="notfound-image"
          />
        </div>

      </div>

    </div>
  );
}
