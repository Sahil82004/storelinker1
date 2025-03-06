import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faUsers, faTrophy, faHandshake } from '@fortawesome/free-solid-svg-icons';
import '../../assets/css/AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1>About StoreLinker</h1>
          <p>Connecting customers with quality products and trusted vendors</p>
        </div>
      </div>

      <div className="container">
        <section className="about-section">
          <h2>Who We Are</h2>
          <p>
            StoreLinker is a leading e-commerce platform that bridges the gap between customers
            and vendors. Founded in 2024, we've been committed to creating a seamless shopping
            experience that benefits both buyers and sellers.
          </p>
          <div className="stats-grid">
            <div className="stat-item">
              <FontAwesomeIcon icon={faUsers} />
              <h3>10K+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-item">
              <FontAwesomeIcon icon={faHandshake} />
              <h3>500+</h3>
              <p>Trusted Vendors</p>
            </div>
            <div className="stat-item">
              <FontAwesomeIcon icon={faTrophy} />
              <h3>98%</h3>
              <p>Satisfaction Rate</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            We strive to revolutionize the online shopping experience by providing a secure,
            efficient, and user-friendly platform that empowers both customers and vendors.
          </p>
          <div className="features-grid">
            <div className="feature-item">
              <FontAwesomeIcon icon={faCheckCircle} />
              <h4>Quality Assurance</h4>
              <p>We verify all vendors and products to ensure the highest quality standards.</p>
            </div>
            <div className="feature-item">
              <FontAwesomeIcon icon={faCheckCircle} />
              <h4>Secure Shopping</h4>
              <p>Your security is our priority with safe payment and data protection.</p>
            </div>
            <div className="feature-item">
              <FontAwesomeIcon icon={faCheckCircle} />
              <h4>24/7 Support</h4>
              <p>Our dedicated team is always here to help you with any concerns.</p>
            </div>
            <div className="feature-item">
              <FontAwesomeIcon icon={faCheckCircle} />
              <h4>Fast Delivery</h4>
              <p>Quick and reliable shipping options for your convenience.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Why Choose Us</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <h4>Wide Selection</h4>
              <p>Access thousands of products from various categories and trusted vendors.</p>
            </div>
            <div className="benefit-item">
              <h4>Best Prices</h4>
              <p>Competitive prices and regular deals to give you the best value.</p>
            </div>
            <div className="benefit-item">
              <h4>Easy Returns</h4>
              <p>Hassle-free return policy to ensure your satisfaction.</p>
            </div>
            <div className="benefit-item">
              <h4>Vendor Support</h4>
              <p>Comprehensive tools and support for our vendor partners.</p>
            </div>
          </div>
        </section>

        <section className="about-section contact-section">
          <h2>Get in Touch</h2>
          <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          <Link to="/contact" className="contact-btn">Contact Us</Link>
        </section>
      </div>
    </div>
  );
};

export default AboutPage; 