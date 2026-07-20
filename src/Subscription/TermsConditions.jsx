import React, { useState } from 'react';
import { FaTimes, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import '../styles/TermsConditions.css';

const TermsConditions = ({ isOpen, onClose, onAccept, title = "Terms & Conditions" }) => {
  const [isAccepted, setIsAccepted] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    if (isAccepted) {
      onAccept();
      onClose();
    }
  };

  const handleDecline = () => {
    onClose();
  };

  return (
    <div className="terms-overlay">
      <div className="terms-container">
        {/* Header */}
        <div className="terms-header">
          <h2>{title}</h2>
          <button className="close-terms-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="terms-content">
          <div className="terms-section">
            <h3>ADMIN TERMS & CONDITIONS</h3>
            <p><em>(For internal admin and staff access)</em></p>
            <p>These terms apply to anyone who has <strong>admin or staff access</strong> to IndusCart systems.</p>
          </div>

          <div className="terms-divider"></div>

          <div className="terms-section">
            <h3>1. Admin Access Control</h3>
            <p>Admin access is:</p>
            <ul className="terms-list">
              <li>Granted by IndusCart only</li>
              <li>Role-based and permission-controlled</li>
            </ul>
            <p>We may limit, suspend, or remove admin access at any time without notice.</p>
          </div>

          <div className="terms-section">
            <h3>2. Admin Responsibilities</h3>
            <p>Admins must:</p>
            <ul className="terms-list">
              <li>Use access only for authorised business work</li>
              <li>Keep login details secure</li>
              <li>Never share credentials</li>
              <li>Act professionally and responsibly</li>
            </ul>
            <p>Any misuse is taken seriously.</p>
          </div>

          <div className="terms-section">
            <h3>3. Data Protection & Confidentiality</h3>
            <p>Admins may access sensitive data such as:</p>
            <ul className="terms-list">
              <li>Customer information</li>
              <li>Orders</li>
              <li>Payments (limited view)</li>
            </ul>
            <p>Admins must:</p>
            <ul className="terms-list">
              <li>Follow <strong>UK GDPR</strong></li>
              <li>Follow the <strong>Data Protection Act 2018</strong></li>
              <li>Never misuse or leak data</li>
            </ul>
            <div className="terms-warning">
              <p>Violations may result in immediate removal and legal action.</p>
            </div>
          </div>

          <div className="terms-section">
            <h3>4. System Usage Rules</h3>
            <p>Admins must not:</p>
            <ul className="terms-list">
              <li>Modify system logic without permission</li>
              <li>Bypass security controls</li>
              <li>Abuse reports, analytics, or customer data</li>
            </ul>
            <p>All admin actions may be logged and reviewed.</p>
          </div>

          <div className="terms-section">
            <h3>5. Monitoring & Security</h3>
            <p>To protect the business:</p>
            <ul className="terms-list">
              <li>Admin activity may be monitored</li>
              <li>Logs may be audited</li>
              <li>Security reviews may be conducted</li>
            </ul>
            <p><strong>This is non-negotiable.</strong></p>
          </div>

          <div className="terms-section">
            <h3>6. Termination of Admin Access</h3>
            <p>Admin access may be removed immediately for:</p>
            <ul className="terms-list">
              <li>Policy violations</li>
              <li>Security risks</li>
              <li>Data misuse</li>
              <li>Misconduct</li>
            </ul>
            <p>No compensation is provided for removed access.</p>
          </div>

          <div className="terms-divider"></div>

          <div className="terms-section">
            <h3>ADMIN SUBSCRIPTION TERMS</h3>
          </div>

          <div className="terms-section">
            <h3>1. Subscription Plans</h3>
            <p>Each subscription plan includes:</p>
            <ul className="terms-list">
              <li>Defined features</li>
              <li>Usage limits (if any)</li>
              <li>Duration and pricing</li>
            </ul>
            <p>Details are shown before purchase.</p>
          </div>

          <div className="terms-section">
            <h3>2. Payments & Billing</h3>
            <ul className="terms-list">
              <li>Payments are charged in advance</li>
              <li>Prices are shown in <strong>GBP (£)</strong></li>
              <li>VAT is applied where required</li>
            </ul>
            <div className="terms-highlight">
              <p>Failure to pay may result in suspension or downgrade.</p>
            </div>
          </div>

          <div className="terms-section">
            <h3>3. Renewals</h3>
            <p>Subscriptions may:</p>
            <ul className="terms-list">
              <li>Renew automatically, or</li>
              <li>Require manual renewal (depending on plan)</li>
            </ul>
            <p><strong>It is your responsibility to manage renewals.</strong></p>
          </div>

          <div className="terms-section">
            <h3>4. Cancellation</h3>
            <p>You may cancel a subscription at any time.</p>
            <div className="terms-warning">
              <p><strong>Important:</strong></p>
              <ul className="terms-list">
                <li>Cancellation stops future billing</li>
                <li>Past payments are <strong>not refundable</strong> unless required by law</li>
              </ul>
            </div>
          </div>

          <div className="terms-section">
            <h3>5. Changes to Subscription Services</h3>
            <p>We may:</p>
            <ul className="terms-list">
              <li>Update features</li>
              <li>Improve systems</li>
              <li>Remove or replace tools</li>
            </ul>
            <p><strong>We do not guarantee uninterrupted service.</strong></p>
          </div>

          <div className="terms-section">
            <h3>6. Misuse of Subscription</h3>
            <p>We may suspend or cancel subscriptions if:</p>
            <ul className="terms-list">
              <li>Tools are misused</li>
              <li>Terms are violated</li>
              <li>Security risks are identified</li>
            </ul>
            <div className="terms-warning">
              <p>No refund is guaranteed in such cases.</p>
            </div>
          </div>

          <div className="terms-section">
            <h3>7. Liability</h3>
            <p>We are not responsible for:</p>
            <ul className="terms-list">
              <li>Business decisions made using admin data</li>
              <li>Losses caused by misuse</li>
            </ul>
            <p>Maximum liability is limited to the subscription fee paid.</p>
          </div>

          <div className="terms-section">
            <h3>8. Legal</h3>
            <p>Subscription terms follow the laws of <strong>England and Wales</strong>.</p>
          </div>

          <div className="terms-section">
            <div className="terms-highlight">
              <p>
                <FaExclamationTriangle style={{ marginRight: '8px', display: 'inline' }} />
                By proceeding with the subscription, you acknowledge that you have read, understood,
                and agree to be bound by all the terms and conditions stated above.
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Accept Button */}
        <div className="terms-footer">
          <div className="terms-checkbox">
            <input
              type="checkbox"
              id="accept-terms"
              checked={isAccepted}
              onChange={(e) => setIsAccepted(e.target.checked)}
            />
            <label htmlFor="accept-terms">
              I have read and agree to the Terms & Conditions
            </label>
          </div>
          <div className="terms-actions">
            <button className="terms-decline-btn" onClick={handleDecline}>
              Decline
            </button>
            <button
              className="terms-agree-btn"
              onClick={handleAccept}
              disabled={!isAccepted}
            >
              <FaCheckCircle style={{ marginRight: '8px' }} />
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;