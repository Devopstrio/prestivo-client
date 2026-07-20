import React, { useState } from 'react';
import {Link} from 'react-router-dom'
import {
  Package,
  Truck,
  Clock,
  Shield,
  Headphones,
  RotateCcw,
  MapPin,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Zap,
  Globe,
  Star
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import '../styles/ShippingInfo.css';


const ShippingInfo = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const shippingInfo = {
    method: 'Direct Shipping',
    description: 'Your order is shipped directly from our nearest location for fastest delivery',
    delivery: '4 to 7 days',
    cost: 'Free on all orders',
    processing: '1 day processing'
  };

  const faqs = [
    {
      question: 'How does direct shipping work?',
      answer: 'Your order is automatically routed to and shipped from our nearest location for the fastest possible delivery time.'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Most orders are delivered within 3 to 7 days. You will receive tracking information as soon as your order ships.'
    },
    {
      question: 'Is shipping really free?',
      answer: 'Yes! We offer free shipping on all orders with no minimum purchase required.'
    },
    {
      question: 'Can I track my order?',
      answer: 'Absolutely! Once your order is processed and shipped, you will receive a tracking number via email to monitor your delivery.'
    },
    {
      question: 'What if items are out of stock?',
      answer: 'Our system automatically routes your order to ensure timely delivery of all available items.'
    },
    {
      question: 'Do you ship to all locations?',
      answer: 'We ship nationwide with reliable delivery service to all locations.'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure Delivery',
      description: 'Fully insured and protected delivery',
      color: 'gradient-emerald-teal'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer service',
      color: 'gradient-blue-indigo'
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: 'Hassle-free return policy',
      color: 'gradient-purple-pink'
    },
    // {
    //   icon: Clock,
    //   title: 'Real-time Tracking',
    //   description: 'Live updates on your shipment',
    //   color: 'gradient-orange-red'
    // }
  ];

  const steps = [
    {
      icon: MapPin,
      title: 'Place Your Order',
      description: 'Complete your purchase with delivery details',
      color: 'blue'
    },
    // {
    //   icon: Package,
    //   title: 'We Process Order',
    //   description: 'Your order is prepared and processed for shipment',
    //   color: 'purple'
    // },
    {
      icon: Truck,
      title: 'Order Ships Out',
      description: 'Your package is shipped with tracking information',
      color: 'orange'
    },
    {
      icon: CheckCircle2,
      title: 'Receive Your Order',
      description: 'Get your delivery within 3 to 7 days with free shipping',
      color: 'green'
    }
  ];

  return (
    <><Navbar />
    <div className="shipping-info-professional">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-pattern"></div>
        
        <div className="hero-container">
          <div className="hero-content-wrapper">
            <div className="hero-badge">
              <Zap className="badge-icon" />
              <span>Free Nationwide Shipping</span>
            </div>
            
            <h1 className="hero-title">
              Fast & Reliable
              <span className="hero-title-gradient">
                Shipping Solutions
              </span>
            </h1>
            
            <p className="hero-subtitle">
              Experience seamless delivery with our optimized logistics network designed for speed and reliability
            </p>
            
            <div className="hero-stats-grid">
              <div className="stat-item">
                <div className="stat-number">3-7</div>
                <div className="stat-label">Delivery Days</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Support</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Free Shipping</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section-professional section-container">
        <div className="features-grid-professional">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="feature-card-professional"
              >
                <div className={`feature-icon-wrapper-professional ${feature.color}`}>
                  <Icon className="feature-icon-professional" />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-star">
                  <Star />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Shipping Details */}
      <section className="shipping-details-section section-container">
        <div className="section-header-center">
          <h2 className="section-title-large">
            Shipping Details
          </h2>
          <p className="section-subtitle">
            Everything you need to know about our shipping process
          </p>
        </div>
        
        <div className="shipping-details-card">
          <div className="shipping-card-header">
            <div className="shipping-header-icon">
              <Truck />
            </div>
            <div className="shipping-header-text">
              <h3>Our Shipping Service</h3>
              <p>Optimized for speed and reliability</p>
            </div>
          </div>
          
          <div className="shipping-card-body">
            <div className="shipping-grid">
              <div className="shipping-detail-item indigo">
                <div className="detail-icon-box">
                  <Truck />
                </div>
                <div className="detail-text">
                  <h4>Shipping Method</h4>
                  <p>{shippingInfo.method}</p>
                </div>
              </div>
              
              <div className="shipping-detail-item purple">
                <div className="detail-icon-box">
                  <Clock />
                </div>
                <div className="detail-text">
                  <h4>Delivery Time</h4>
                  <p>{shippingInfo.delivery}</p>
                </div>
              </div>
              
              <div className="shipping-detail-item green">
                <div className="detail-icon-box">
                  <Zap />
                </div>
                <div className="detail-text">
                  <h4>Shipping Cost</h4>
                  <p>{shippingInfo.cost}</p>
                </div>
              </div>
              
              <div className="shipping-detail-item orange">
                <div className="detail-icon-box">
                  <Package />
                </div>
                <div className="detail-text">
                  <h4>Order Processing</h4>
                  <p>{shippingInfo.processing}</p>
                </div>
              </div>
            </div>
            
            <div className="shipping-info-box">
              <Globe className="info-box-icon" />
              <p>{shippingInfo.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Updated to White Mode */}
      <section className="how-it-works-light section-container">
        <div className="section-header-center">
          <h2 className="section-title-large">
            How Our Shipping Works
          </h2>
          <p className="section-subtitle">
            Simple and transparent process from order to delivery
          </p>
        </div>
        
        <div className="steps-grid-light">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="step-card-light">
                <div className="step-card-content-light">
                  <div className={`step-number-light ${step.color}`}>
                    {index + 1}
                  </div>
                  <div className="step-icon-wrapper-light">
                    <Icon />
                  </div>
                  <h3 className="step-title-light">{step.title}</h3>
                  <p className="step-description-light">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="step-arrow-light">
                    <ArrowRight />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section-professional">
        <div className="faq-container-professional">
          <div className="section-header-center">
            <h2 className="section-title-large">
              Frequently Asked Questions
            </h2>
            <p className="section-subtitle">
              Quick answers to common shipping questions
            </p>
          </div>
          
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="faq-item-professional"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="faq-question-button"
                >
                  <h4 className="faq-question-text">{faq.question}</h4>
                  <div className={`faq-toggle-icon ${activeFaq === index ? 'rotate' : ''}`}>
                    {activeFaq === index ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </div>
                </button>
                <div 
                  className={`faq-answer-wrapper ${activeFaq === index ? 'open' : ''}`}
                  style={{border:"none"}}
                >
                  <div className="faq-answer-text" style={{border:"none"}}>
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="important-notes-section section-container" id="section-container1">
        <div className="section-header-center">
          <h2 className="section-title-large">
            Important Information
          </h2>
          <p className="section-subtitle">
            Key details to ensure smooth delivery experience
          </p>
        </div>
        
        <div className="notes-grid-professional">
          <div className="note-card yellow">
            <div className="note-icon-box">
              <Clock />
            </div>
            <h4 className="note-title">Processing Time</h4>
            <p className="note-text">Orders are processed within 1 day before shipping.</p>
          </div>
          
          <div className="note-card blue">
            <div className="note-icon-box">
              <RotateCcw />
            </div>
            <h4 className="note-title">Easy Returns</h4>
            <p className="note-text">Free returns within 7 days for your convenience.</p>
          </div>
          
          <div className="note-card green">
            <div className="note-icon-box">
              <CheckCircle2 />
            </div>
            <h4 className="note-title">Delivery Updates</h4>
            <p className="note-text">Receive real-time tracking updates for your order.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-professional section-container">
        <div className="cta-card">
          <div className="cta-overlay"></div>
          <div className="cta-content-wrapper">
            <h2 className="cta-title">
              Ready to Get Started?
            </h2>
            <p className="cta-text">
              Experience fast and reliable shipping on all your orders
            </p>
            <Link to="/"><button className="cta-button-professional">
              Start Shopping Now
              <ArrowRight className="cta-button-icon" />
            </button></Link>
          </div>
        </div>
      </section>
    </div>
    <Footer/>
    </>
  );
};

export default ShippingInfo;