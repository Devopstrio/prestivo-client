import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaRuler,
  FaTshirt,
  FaShoePrints,
  FaRulerHorizontal,
  FaVenusMars,
  FaInfoCircle,
  FaCompressAlt,
  FaUser,
  FaEnvelope,
  FaExchangeAlt,
  FaStar,
  FaTape,
  FaTshirt as FaClothing,
  FaUserCheck,
  FaClock,
  FaRulerCombined,
  FaExchange,
  FaLightbulb,
  FaShieldAlt
} from 'react-icons/fa';
import '../styles/SizeGuide.css';
import Navbar from "../components/Navbar";
import Footer from '../components/Footer';

const SizeGuide = () => {
  const [activeCategory, setActiveCategory] = useState('clothing');
  const [activeGender, setActiveGender] = useState('women');
  const [selectedSize, setSelectedSize] = useState(null);

  const categories = [
    { id: 'clothing', name: 'Clothing', icon: FaTshirt, color: 'gradient-blue-indigo' },
    { id: 'shoes', name: 'Shoes', icon: FaShoePrints, color: 'gradient-emerald-teal' },
    { id: 'accessories', name: 'Accessories', icon: FaRuler, color: 'gradient-purple-pink' }
  ];

  const genders = [
    { id: 'women', name: 'Women', icon: FaVenusMars },
    { id: 'men', name: 'Men', icon: FaUser },
    { id: 'unisex', name: 'Unisex', icon: FaExchangeAlt }
  ];

  // Simplified size chart data - only US sizes
  const sizeCharts = {
    clothing: {
      women: [
        { size: 'XS', bust: '32"', waist: '25"', hips: '35"', fit: 'Slim' },
        { size: 'S', bust: '34"', waist: '27"', hips: '37"', fit: 'Slim' },
        { size: 'M', bust: '36"', waist: '29"', hips: '39"', fit: 'Regular' },
        { size: 'L', bust: '38"', waist: '31"', hips: '41"', fit: 'Regular' },
        { size: 'XL', bust: '40"', waist: '33"', hips: '43"', fit: 'Relaxed' },
        { size: '2XL', bust: '42"', waist: '35"', hips: '45"', fit: 'Relaxed' }
      ],
      men: [
        { size: 'XS', chest: '34"', waist: '28"', neck: '14"', fit: 'Slim' },
        { size: 'S', chest: '36"', waist: '30"', neck: '14.5"', fit: 'Slim' },
        { size: 'M', chest: '38"', waist: '32"', neck: '15"', fit: 'Regular' },
        { size: 'L', chest: '40"', waist: '34"', neck: '15.5"', fit: 'Regular' },
        { size: 'XL', chest: '42"', waist: '36"', neck: '16"', fit: 'Relaxed' },
        { size: '2XL', chest: '44"', waist: '38"', neck: '16.5"', fit: 'Relaxed' }
      ],
      unisex: [
        { size: 'XS', chest: '32-34"', waist: '26-28"', length: '26"', fit: 'Slim' },
        { size: 'S', chest: '34-36"', waist: '28-30"', length: '27"', fit: 'Slim' },
        { size: 'M', chest: '36-38"', waist: '30-32"', length: '28"', fit: 'Regular' },
        { size: 'L', chest: '38-40"', waist: '32-34"', length: '29"', fit: 'Regular' },
        { size: 'XL', chest: '40-42"', waist: '34-36"', length: '30"', fit: 'Relaxed' },
        { size: '2XL', chest: '42-44"', waist: '36-38"', length: '31"', fit: 'Relaxed' }
      ]
    },
    shoes: {
      women: [
        { size: '5', length: '8.5"', width: '3.1"', fit: 'Standard' },
        { size: '6', length: '9"', width: '3.2"', fit: 'Standard' },
        { size: '7', length: '9.25"', width: '3.3"', fit: 'Standard' },
        { size: '8', length: '9.5"', width: '3.4"', fit: 'Standard' },
        { size: '9', length: '9.75"', width: '3.5"', fit: 'Standard' },
        { size: '10', length: '10"', width: '3.6"', fit: 'Standard' }
      ],
      men: [
        { size: '7', length: '9.75"', width: '3.8"', fit: 'Standard' },
        { size: '8', length: '10.25"', width: '3.9"', fit: 'Standard' },
        { size: '9', length: '10.5"', width: '4.0"', fit: 'Standard' },
        { size: '10', length: '10.75"', width: '4.1"', fit: 'Standard' },
        { size: '11', length: '11"', width: '4.2"', fit: 'Standard' },
        { size: '12', length: '11.25"', width: '4.3"', fit: 'Standard' }
      ],
      unisex: [
        { size: '5', length: '8.5"', width: '3.5"', fit: 'Standard' },
        { size: '6', length: '9"', width: '3.6"', fit: 'Standard' },
        { size: '7', length: '9.25"', width: '3.7"', fit: 'Standard' },
        { size: '8', length: '9.5"', width: '3.8"', fit: 'Standard' },
        { size: '9', length: '9.75"', width: '3.9"', fit: 'Standard' },
        { size: '10', length: '10"', width: '4.0"', fit: 'Standard' }
      ]
    },
    accessories: {
      women: [
        { size: 'One Size', measurement: 'Adjustable 6-8"', fit: 'Universal' },
        { size: 'Small', measurement: '6-6.5" circumference', fit: 'Petite' },
        { size: 'Medium', measurement: '7-7.5" circumference', fit: 'Average' },
        { size: 'Large', measurement: '8-8.5" circumference', fit: 'Full' }
      ],
      men: [
        { size: 'One Size', measurement: 'Adjustable 7-9"', fit: 'Universal' },
        { size: 'Small', measurement: '7-7.5" circumference', fit: 'Slim' },
        { size: 'Medium', measurement: '8-8.5" circumference', fit: 'Average' },
        { size: 'Large', measurement: '9-9.5" circumference', fit: 'Large' }
      ],
      unisex: [
        { size: 'One Size', measurement: 'Adjustable 6-9"', fit: 'Universal' },
        { size: 'Small/Medium', measurement: '6-8" circumference', fit: 'Standard' },
        { size: 'Medium/Large', measurement: '7-9" circumference', fit: 'Extended' }
      ]
    }
  };

  const measurementTips = [
    {
      title: 'Bust/Chest',
      description: 'Measure around the fullest part of your bust/chest, keeping the tape horizontal.',
      icon: FaRulerHorizontal,
      color: 'blue'
    },
    {
      title: 'Waist',
      description: 'Measure around the narrowest part of your natural waist, usually above the belly button.',
      icon: FaCompressAlt,
      color: 'purple'
    },
    {
      title: 'Hips',
      description: 'Measure around the fullest part of your hips, about 8 inches below your waist.',
      icon: FaRuler,
      color: 'green'
    }
  ];

  const proMeasurementTips = [
    {
      icon: FaTape,
      title: 'Use the Right Tape',
      description: 'Always use a soft, flexible measuring tape for accurate results',
      color: 'gradient-blue-indigo'
    },
    {
      icon: FaClothing,
      title: 'Wear Proper Clothing',
      description: 'Measure over light clothing or the undergarments you\'ll wear with the item',
      color: 'gradient-purple-pink'
    },
    {
      icon: FaUserCheck,
      title: 'Stand Naturally',
      description: 'Keep the tape parallel to the floor and don\'t pull too tight',
      color: 'gradient-emerald-teal'
    },
    // {
    //   icon: FaClock,
    //   title: 'Time It Right',
    //   description: 'Take measurements at the end of the day when your body is at its natural size',
    //   color: 'gradient-orange-red'
    // }
  ];

  const fitTypes = [
    {
      type: 'Slim Fit',
      description: 'Closely follows body contours with minimal extra fabric for a tailored look.',
      bestFor: 'Athletic builds, formal occasions',
      color: 'yellow',
      icon: FaRulerCombined
    },
    {
      type: 'Regular Fit',
      description: 'Standard cut with comfortable room for movement and everyday wear.',
      bestFor: 'Most body types, daily activities',
      color: 'blue',
      icon: FaUserCheck
    },
    {
      type: 'Relaxed Fit',
      description: 'Loose and comfortable with extra room throughout for maximum comfort.',
      bestFor: 'Comfort-focused, casual lifestyle',
      color: 'green',
      icon: FaCompressAlt
    }
  ];

  const importantNotes = [
    {
      icon: FaRuler,
      title: 'Size Variations',
      description: 'Different brands and styles may have slight variations in sizing. Always check individual product measurements when available.',
      color: 'yellow'
    },
    {
      icon: FaExchangeAlt,
      title: 'Easy Exchanges',
      description: 'Not sure about your size? We offer free exchanges within 30 days of purchase.',
      color: 'blue'
    },
    {
      icon: FaLightbulb,
      title: 'Pro Tip',
      description: 'When between sizes, we recommend sizing up for a more comfortable fit, especially for relaxed styles.',
      color: 'green'
    }
  ];

  const currentChart = sizeCharts[activeCategory]?.[activeGender] || [];

  const getTableHeaders = () => {
    if (activeCategory === 'clothing') {
      if (activeGender === 'women') {
        return ['US Size', 'Bust', 'Waist', 'Hips', 'Fit Type'];
      } else {
        return ['US Size', 'Chest', 'Waist', 'Neck', 'Fit Type'];
      }
    } else if (activeCategory === 'shoes') {
      return ['US Size', 'Length', 'Width', 'Fit Type'];
    } else {
      return ['Size', 'Measurement', 'Fit Type'];
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size === selectedSize ? null : size);
  };

  return (
    <><Navbar />
      <div className="size-guide-professional">
        {/* Hero Section */}
        <section className="size-hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-container">
            <div className="hero-content-wrapper">
              <div className="hero-badge">
                <FaRuler className="badge-icon" />
                <span>Perfect Fit Guarantee</span>
              </div>
              
              <h1 className="hero-title">
                Find Your
                <span className="hero-title-gradient">
                  Perfect Size
                </span>
              </h1>
              
              <p className="hero-subtitle">
                Comprehensive sizing guide with measurement tips to ensure the perfect fit every time
              </p>
              
              <div className="hero-stats-grid">
                <div className="stat-item">
                  <div className="stat-number">3</div>
                  <div className="stat-label">Categories</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">18+</div>
                  <div className="stat-label">Size Charts</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Fit Guarantee</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Selection */}
        <section className="category-selection-section section-container">
          <div className="section-header-center">
            <h2 className="section-title-large">
              What Are You Shopping For?
            </h2>
            <p className="section-subtitle">
              Select a category to view detailed size charts
            </p>
          </div>
          
          <div className="features-grid-professional">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <div 
                  key={category.id} 
                  className={`feature-card-professional ${activeCategory === category.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setSelectedSize(null);
                  }}
                >
                  <div className={`feature-icon-wrapper-professional ${category.color}`}>
                    <Icon className="feature-icon-professional" />
                  </div>
                  <h3 className="feature-title">{category.name}</h3>
                  <p className="feature-description">
                    {category.id === 'clothing' && 'Complete size charts for tops, bottoms, and dresses'}
                    {category.id === 'shoes' && 'Foot measurements and sizing for all shoe types'}
                    {category.id === 'accessories' && 'Sizing guides for belts, hats, and accessories'}
                  </p>
                  <div className="feature-star">
                    <FaStar />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Gender Selection */}
        <section className="gender-selection-section section-container">
          <div className="gender-selection-card">
            <div className="gender-header">
              <h3>Select Gender</h3>
              <p>Choose your gender for accurate size recommendations</p>
            </div>
            <div className="gender-buttons-professional">
              {genders.map(gender => {
                const Icon = gender.icon;
                return (
                  <button
                    key={gender.id}
                    className={`gender-btn-professional ${activeGender === gender.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveGender(gender.id);
                      setSelectedSize(null);
                    }}
                  >
                    <div className="gender-icon-wrapper">
                      <Icon className="gender-icon-professional" />
                    </div>
                    <span className="gender-name">{gender.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Size Chart */}
        <section className="size-chart-section section-container">
          <div className="size-chart-card">
            <div className="chart-header-professional">
              <div className="chart-title">
                <h2>{categories.find(cat => cat.id === activeCategory)?.name} Size Chart</h2>
                <div className="chart-info-professional">
                  <FaInfoCircle className="info-icon-professional" />
                  <span>All measurements in inches</span>
                </div>
              </div>
              <div className="current-selection">
                {activeGender.charAt(0).toUpperCase() + activeGender.slice(1)} • {categories.find(cat => cat.id === activeCategory)?.name}
              </div>
            </div>

            {currentChart.length > 0 ? (
              <div className="chart-container-professional">
                <div className="table-wrapper-professional">
                  <table className="size-table-professional">
                    <thead>
                      <tr>
                        {getTableHeaders().map(header => (
                          <th key={header}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentChart.map((row, index) => (
                        <tr 
                          key={index}
                          className={selectedSize === row.size ? 'selected' : ''}
                          onClick={() => handleSizeSelect(row.size)}
                        >
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex}>{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {selectedSize && (
                  <div className="size-details-professional">
                    <div className="details-header">
                      <h4>Size {selectedSize} Details</h4>
                      <div className="selected-badge">Selected</div>
                    </div>
                    <div className="details-grid-professional">
                      {Object.entries(currentChart.find(row => row.size === selectedSize) || {}).map(([key, value]) => (
                        key !== 'size' && (
                          <div key={key} className="detail-item-professional">
                            <span className="detail-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                            <span className="detail-value">{value}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-data-professional">
                <p>Size chart not available for the selected options.</p>
              </div>
            )}
          </div>
        </section>

        {/* Measurement Guide - White Mode */}
        <section className="measurement-guide-section section-container">
          <div className="section-header-center">
            <h2 className="section-title-large">
              How to Measure Yourself
            </h2>
            <p className="section-subtitle">
              Get accurate measurements for the perfect fit
            </p>
          </div>
          
          <div className="features-grid-professional">
            {measurementTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="feature-card-professional">
                  <div className={`feature-icon-wrapper-professional gradient-${tip.color}-indigo`}>
                    <Icon className="feature-icon-professional" />
                  </div>
                  <h3 className="feature-title">{tip.title}</h3>
                  <p className="feature-description">{tip.description}</p>
                  <div className="feature-star">
                    <FaStar />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pro Measurement Tips - White Mode */}
        <section className="pro-tips-section section-container">
          <div className="section-header-center">
            <h2 className="section-title-large">
              Pro Measurement Tips
            </h2>
            <p className="section-subtitle">
              Follow these guidelines for the most accurate measurements
            </p>
          </div>
          
          <div className="features-grid-professional">
            {proMeasurementTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="feature-card-professional">
                  <div className={`feature-icon-wrapper-professional ${tip.color}`}>
                    <Icon className="feature-icon-professional" />
                  </div>
                  <h3 className="feature-title">{tip.title}</h3>
                  <p className="feature-description">{tip.description}</p>
                  <div className="feature-star">
                    <FaStar />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Fit Guide */}
        <section className="fit-guide-section section-container">
          <div className="section-header-center">
            <h2 className="section-title-large">
              Understanding Fit Types
            </h2>
            <p className="section-subtitle">
              Choose the right fit for your style and comfort
            </p>
          </div>
          
          <div className="notes-grid-professional">
            {fitTypes.map((fit, index) => {
              const Icon = fit.icon;
              return (
                <div key={index} className={`note-card ${fit.color}`}>
                  <div className="note-icon-box">
                    <Icon className="note-icon" style={{color:"white"}}/>
                  </div>
                  <h4 className="note-title">{fit.type}</h4>
                  <p className="note-text">{fit.description}</p>
                  <div className="fit-best-for">
                    <strong>Best for:</strong> {fit.bestFor}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Important Notes */}
        <section className="important-notes-section section-container">
          <div className="section-header-center">
            <h2 className="section-title-large">
              Important Sizing Notes
            </h2>
            <p className="section-subtitle">
              Key information to ensure the perfect fit
            </p>
          </div>
          
          <div className="notes-grid-professional">
            {importantNotes.map((note, index) => {
              const Icon = note.icon;
              return (
                <div key={index} className={`note-card ${note.color}`}>
                  <div className="note-icon-box">
                    <Icon className="note-icon" style={{color:"white"}}/>
                  </div>
                  <h4 className="note-title">{note.title}</h4>
                  <p className="note-text">{note.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section-professional section-container">
          <div className="cta-card">
            <div className="cta-overlay"></div>
            <div className="cta-content-wrapper">
              <FaEnvelope className="cta-icon-large" />
              <h2 className="cta-title">
                Need Sizing Help?
              </h2>
              <p className="cta-text">
                Our customer service team is here to help you find your perfect fit. Contact us for personalized sizing recommendations.
              </p>
              <Link to="/contact">
                <button className="cta-button-professional">
                  <FaEnvelope className="cta-button-icon" />
                  Contact Support
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default SizeGuide;