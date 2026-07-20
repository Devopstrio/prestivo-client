import React, { useState } from 'react';
import {Link} from 'react-router-dom'
import {
    FaUndo,
    FaClock,
    FaCheckCircle,
    FaExclamationTriangle,
    FaFileAlt,
    FaShippingFast,
    FaCreditCard,
    FaHeadset,
    FaShieldAlt,
    FaEnvelope,
    FaStar
} from 'react-icons/fa';
import '../styles/ReturnsRefunds.css';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ReturnsRefunds = () => {
    const [activeFaq, setActiveFaq] = useState(null);

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const returnPolicy = {
        period: '7 Days',
        condition: 'Items must be unused, in original packaging with tags attached',
        process: 'Simple 3-step return process',
        refund: 'Refunds processed within 5-7 business days'
    };

    const returnSteps = [
        {
            step: 1,
            icon: FaFileAlt,
            title: 'Request Return',
            description: 'Submit return request through your account or contact customer service',
            time: 'Within 7 days of delivery',
            color: 'blue'
        },
        {
            step: 2,
            icon: FaShippingFast,
            title: 'Ship Item Back',
            description: 'Use our prepaid shipping label to return the item',
            time: 'Free return shipping',
            color: 'purple'
        },
        {
            step: 3,
            icon: FaCreditCard,
            title: 'Get Refund',
            description: 'Receive refund to original payment method once item is verified',
            time: '5-7 business days',
            color: 'green'
        }
    ];

    const refundMethods = [
        {
            method: 'Original Payment',
            description: 'Refunded back to your original payment method',
            time: '5-7 business days',
            icon: FaCreditCard,
            color: 'gradient-blue-indigo'
        },
        {
            method: 'Store Credit',
            description: 'Store credit with 10% bonus for future purchases',
            time: 'Immediate',
            icon: FaShieldAlt,
            color: 'gradient-emerald-teal'
        },
        {
            method: 'Exchange',
            description: 'Quick exchange for a different size or color',
            time: '2-3 days after return',
            icon: FaUndo,
            color: 'gradient-purple-pink'
        }
    ];

    const faqs = [
        {
            question: 'What is your return policy?',
            answer: 'We offer a 30-day return policy for all items in original condition with tags attached. Some items may have specific return requirements.'
        },
        {
            question: 'How long do refunds take?',
            answer: 'Refunds are processed within 5-7 business days after we receive and inspect your return. It may take additional time for your bank to process the refund.'
        },
        {
            question: 'Do you offer free return shipping?',
            answer: 'Yes! We provide prepaid return shipping labels for all returns within the 30-day period.'
        },
        {
            question: 'What items cannot be returned?',
            answer: 'Personalized items, intimate apparel, and final sale items marked as "non-returnable" cannot be returned for hygiene and customization reasons.'
        },
        {
            question: 'Can I exchange an item?',
            answer: 'Absolutely! You can exchange for a different size, color, or product. Exchanges are typically processed within 2-3 business days after we receive your return.'
        },
        {
            question: 'What if my item is damaged or defective?',
            answer: 'Contact us immediately at support@yourstore.com. We will expedite a replacement or refund for damaged or defective items.'
        }
    ];

    const importantNotes = [
        {
            icon: FaClock,
            title: 'Processing Time',
            description: 'Returns are processed within 3-5 business days of receipt at our warehouse.',
            color: 'yellow'
        },
        {
            icon: FaExclamationTriangle,
            title: 'Condition Matters',
            description: 'Items must be in original condition with all tags and packaging intact.',
            color: 'blue'
        },
        {
            icon: FaCheckCircle,
            title: 'Easy Tracking',
            description: 'Track your return status in real-time through your account dashboard.',
            color: 'green'
        }
    ];

    return (
        <><Navbar />
            <div className="returns-refunds-professional">
                {/* Hero Section */}
                <section className="returns-hero-section">
                    <div className="hero-overlay"></div>
                    <div className="hero-container">
                        <div className="hero-content-wrapper">
                            <div className="hero-badge">
                                <FaUndo className="badge-icon" />
                                <span>Hassle-Free Returns</span>
                            </div>
                            
                            <h1 className="hero-title">
                                Easy Returns &
                                <span className="hero-title-gradient">
                                    Refunds
                                </span>
                            </h1>
                            
                            <p className="hero-subtitle">
                                Simple 7-day return policy with quick refunds. Your satisfaction is our priority.
                            </p>
                            
                            <div className="hero-stats-grid">
                                <div className="stat-item">
                                    <div className="stat-number">7</div>
                                    <div className="stat-label">Return Days</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">5-7</div>
                                    <div className="stat-label">Refund Days</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">100%</div>
                                    <div className="stat-label">Free Returns</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Policy Overview */}
                <section className="policy-section section-container">
                    <div className="section-header-center">
                        <h2 className="section-title-large">
                            Return Policy Overview
                        </h2>
                        <p className="section-subtitle">
                            Everything you need to know about our return process
                        </p>
                    </div>
                    
                    <div className="policy-details-card">
                        <div className="policy-card-header">
                            <div className="policy-header-icon">
                                <FaUndo />
                            </div>
                            <div className="policy-header-text">
                                <h3>Our Return Promise</h3>
                                <p>Simple, transparent, and customer-friendly</p>
                            </div>
                        </div>
                        
                        <div className="policy-card-body">
                            <div className="policy-grid">
                                <div className="policy-detail-item indigo">
                                    <div className="detail-icon-box">
                                        <FaClock />
                                    </div>
                                    <div className="detail-text">
                                        <h4>Return Period</h4>
                                        <p>{returnPolicy.period}</p>
                                    </div>
                                </div>
                                
                                <div className="policy-detail-item green">
                                    <div className="detail-icon-box">
                                        <FaCheckCircle />
                                    </div>
                                    <div className="detail-text">
                                        <h4>Item Condition</h4>
                                        <p>{returnPolicy.condition}</p>
                                    </div>
                                </div>
                                
                                <div className="policy-detail-item purple">
                                    <div className="detail-icon-box">
                                        <FaFileAlt />
                                    </div>
                                    <div className="detail-text">
                                        <h4>Return Process</h4>
                                        <p>{returnPolicy.process}</p>
                                    </div>
                                </div>
                                
                                <div className="policy-detail-item orange">
                                    <div className="detail-icon-box">
                                        <FaCreditCard />
                                    </div>
                                    <div className="detail-text">
                                        <h4>Refund Timeline</h4>
                                        <p>{returnPolicy.refund}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="policy-info-box">
                                <FaShieldAlt className="info-box-icon" />
                                <p>All returns include free shipping and full protection for your items during transit.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How to Return */}
                <section className="return-process-light section-container">
                    <div className="section-header-center">
                        <h2 className="section-title-large">
                            How to Return an Item
                        </h2>
                        <p className="section-subtitle">
                            Simple 3-step process for hassle-free returns
                        </p>
                    </div>
                    
                    <div className="steps-grid-light">
                        {returnSteps.map((step, index) => (
                            <div key={index} className="step-card-light">
                                <div className="step-card-content-light">
                                    <div className={`step-number-light ${step.color}`}>
                                        {step.step}
                                    </div>
                                    <div className="step-icon-wrapper-light">
                                        <step.icon />
                                    </div>
                                    <h3 className="step-title-light">{step.title}</h3>
                                    <p className="step-description-light">{step.description}</p>
                                    <div className="step-time-light">
                                        <FaClock className="time-icon-light" />
                                        <span>{step.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Refund Methods */}
                <section className="refund-methods-section section-container">
                    <div className="section-header-center">
                        <h2 className="section-title-large">
                            Refund Options
                        </h2>
                        <p className="section-subtitle">
                            Choose the refund method that works best for you
                        </p>
                    </div>
                    
                    <div className="features-grid-professional">
                        {refundMethods.map((method, index) => {
                            const Icon = method.icon;
                            return (
                                <div key={index} className="feature-card-professional">
                                    <div className={`feature-icon-wrapper-professional ${method.color}`}>
                                        <Icon className="feature-icon-professional" />
                                    </div>
                                    <h3 className="feature-title">{method.method}</h3>
                                    <p className="feature-description">{method.description}</p>
                                    <div className="method-timeline">
                                        <FaClock className="timeline-icon" />
                                        <span>{method.time}</span>
                                    </div>
                                    <div className="feature-star">
                                        <FaStar />
                                    </div>
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
                                Quick answers to common return questions
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
                                                <span>−</span>
                                            ) : (
                                                <span>+</span>
                                            )}
                                        </div>
                                    </button>
                                    <div 
                                        className={`faq-answer-wrapper ${activeFaq === index ? 'open' : ''}`}
                                    >
                                        <div className="faq-answer-text">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Important Notes */}
                <section className="important-notes-section section-container">
                    <div className="section-header-center" id="section-header-center">
                        <h2 className="section-title-large">
                            Important Information
                        </h2>
                        <p className="section-subtitle">
                            Key details to ensure smooth return experience
                        </p>
                    </div>
                    
                    <div className="notes-grid-professional">
                        {importantNotes.map((note, index) => {
                            const Icon = note.icon;
                            return (
                                <div key={index} className={`note-card ${note.color}`}>
                                    <div className="note-icon-box">
                                        <Icon />
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
                            <FaHeadset className="cta-icon-large" />
                            <h2 className="cta-title">
                                Need Help With Your Return?
                            </h2>
                            <p className="cta-text">
                                Our customer service team is here to help you with any questions about returns or refunds.
                            </p>
                            <Link to="/contact"><button className="cta-button-professional">
                                <FaEnvelope className="cta-button-icon" />
                                Contact Support
                            </button></Link>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
};

export default ReturnsRefunds;