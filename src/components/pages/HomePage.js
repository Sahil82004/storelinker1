import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import '../../assets/css/HomePage.css';

const HomePage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h2>Connect with the Best Stores</h2>
              <p>Digitize Your Store, Simplify Shopping – Find, Compare, and Save Instantly!</p>
              
            </div>
            <div className="hero-image">
              <img src="https://img.freepik.com/free-vector/ecommerce-checkout-laptop-concept-illustration_114360-8203.jpg?ga=GA1.1.924815405.1740815173&semt=ais_hybrid" alt="Women's Fashion Sale" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="featured-categories">
        <div className="container">
          <div className="section-header">
            <h2>Featured Categories</h2>
            <p>Browse our most popular categories</p>
          </div>
          
          <div className="explore-categories">
            <h3>Explore our categories : Shop now</h3>
            
            <div className="categories-grid">
              <div className="category-circle">
                <Link to="/category/electronics">
                  <div className="circle-image">
                    <img src="https://img.freepik.com/premium-photo/home-appliances-gas-cooker-tv-cinema-refrigerator-air-conditioner-microwave-laptop-washing-machine_252025-693.jpg" alt="Electronics" />
                  </div>
                  <h4>Electronics</h4>
                </Link>
              </div>
              
              <div className="category-circle">
                <Link to="/category/fashion">
                  <div className="circle-image">
                    <img src="https://media.istockphoto.com/id/665032164/photo/flat-lay-of-modern-mens-clothing-on-a-wooden-background.jpg?s=612x612&w=0&k=20&c=CVqFStPc5EDNHIqnpYKPm-DaImQVf2VDjl54oPBavK4=" alt="Fashion" />
                  </div>
                  <h4>Fashion</h4>
                </Link>
              </div>
              
              <div className="category-circle">
                <Link to="/category/home">
                  <div className="circle-image">
                    <img src="https://creative-door.transforms.svdcdn.com/production/reference/home-gardening-equipment-min-1.jpeg?w=840&h=630&q=82&fm=jpg&fit=crop&dm=1688062821&s=866b4e57f3da36b3e997bf647c6cf6a1" alt="Home & Garden" />
                  </div>
                  <h4>Home & Garden</h4>
                </Link>
              </div>
              
              <div className="category-circle">
                <Link to="/category/beauty">
                  <div className="circle-image">
                    <img src="https://img.freepik.com/premium-photo/cosmetics-beauty-products_406939-11453.jpg" alt="Beauty & Health" />
                  </div>
                  <h4>Beauty & Health</h4>
                </Link>
              </div>
              
              <div className="category-circle">
                <Link to="/category/sports">
                  <div className="circle-image">
                    <img src="https://www.firstcry.com/intelli/articles/wp-content/uploads/2022/02/717236839.jpg" alt="Sports & Outdoors" />
                  </div>
                  <h4>Sports & Outdoors</h4>
                </Link>
              </div>
              
              <div className="category-circle">
                <Link to="/category/toys">
                  <div className="circle-image">
                    <img src="https://img.freepik.com/free-photo/assortment-plastic-toys_23-2147663644.jpg" alt="Toys & Games" />
                  </div>
                  <h4>Toys & Games</h4>
                </Link>
              </div>
              
              <div className="category-circle">
                <Link to="/category/books">
                  <div className="circle-image">
                    <img src="https://c1.wallpaperflare.com/preview/314/735/593/book-read-book-pages-literature.jpg" alt="Books & Media" />
                  </div>
                  <h4>Books & Media</h4>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>Top Selling Products</h2>
            <p>Our most popular products that customers love</p>
          </div>
          
          <div className="products-grid">
            {/* Product Card 1 */}
            <div className="product-card">
              <div className="product-image">
                <span className="product-badge">Best Seller</span>
                <img src="https://img.freepik.com/free-photo/wireless-earbuds-with-charging-case_23-2150312990.jpg" alt="Wireless Earbuds" />
                <div className="product-actions">
                  <button className="product-action-btn" title="Add to Wishlist"><FontAwesomeIcon icon={farStar} /></button>
                  <button className="product-action-btn" title="Quick View"><FontAwesomeIcon icon={farStar} /></button>
                  <button className="product-action-btn" title="Add to Compare"><FontAwesomeIcon icon={faChevronRight} /></button>
                </div>
              </div>
              <div className="product-info">
                <div className="product-category">Electronics</div>
                <h3 className="product-title"><Link to="/category/electronics">Premium Wireless Earbuds</Link></h3>
                <div className="product-price">
                  <span className="current-price">₹1,499</span>
                  <span className="old-price">₹2,999</span>
                </div>
                <div className="product-rating">
                  <div className="rating-stars">
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStarHalfAlt} />
                  </div>
                  <span className="rating-count">(4,256)</span>
                </div>
                <Link to="/category/electronics" className="btn btn-primary btn-sm view-details">View Details</Link>
              </div>
            </div>
            
            {/* Product Card 2 */}
            <div className="product-card">
              <div className="product-image">
                <span className="product-badge">Top Rated</span>
                <img src="https://img.freepik.com/free-photo/smartwatch-screen-digital-device_53876-96809.jpg" alt="Smart Watch" />
                <div className="product-actions">
                  <button className="product-action-btn" title="Add to Wishlist"><FontAwesomeIcon icon={farStar} /></button>
                  <button className="product-action-btn" title="Quick View"><FontAwesomeIcon icon={farStar} /></button>
                  <button className="product-action-btn" title="Add to Compare"><FontAwesomeIcon icon={faChevronRight} /></button>
                </div>
              </div>
              <div className="product-info">
                <div className="product-category">Wearables</div>
                <h3 className="product-title"><Link to="/category/electronics">Fitness Smart Watch</Link></h3>
                <div className="product-price">
                  <span className="current-price">₹2,499</span>
                  <span className="old-price">₹3,999</span>
                </div>
                <div className="product-rating">
                  <div className="rating-stars">
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                  <span className="rating-count">(3,182)</span>
                </div>
                <Link to="/category/electronics" className="btn btn-primary btn-sm view-details">View Details</Link>
              </div>
            </div>
            
            {/* Product Card 3 */}
            <div className="product-card">
              <div className="product-image">
                <span className="product-badge">Hot</span>
                <img src="https://img.freepik.com/free-photo/wireless-headphones-levitating-blue-background_23-2150271748.jpg" alt="Headphones" />
                <div className="product-actions">
                  <button className="product-action-btn" title="Add to Wishlist"><FontAwesomeIcon icon={farStar} /></button>
                  <button className="product-action-btn" title="Quick View"><FontAwesomeIcon icon={farStar} /></button>
                  <button className="product-action-btn" title="Add to Compare"><FontAwesomeIcon icon={faChevronRight} /></button>
                </div>
              </div>
              <div className="product-info">
                <div className="product-category">Audio</div>
                <h3 className="product-title"><Link to="/category/electronics">Noise Cancelling Headphones</Link></h3>
                <div className="product-price">
                  <span className="current-price">₹3,999</span>
                  <span className="old-price">₹5,999</span>
                </div>
                <div className="product-rating">
                  <div className="rating-stars">
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={farStar} />
                  </div>
                  <span className="rating-count">(2,847)</span>
                </div>
                <Link to="/category/electronics" className="btn btn-primary btn-sm view-details">View Details</Link>
              </div>
            </div>
            
            {/* Product Card 4 */}
            <div className="product-card">
              <div className="product-image">
                <span className="product-badge">New</span>
                <img src="https://img.freepik.com/free-photo/smartphone-with-blank-screen-isolated-white-background_125540-3000.jpg" alt="Smartphone" />
                <div className="product-actions">
                  <button className="product-action-btn" title="Add to Wishlist"><FontAwesomeIcon icon={farStar} /></button>
                  <button className="product-action-btn" title="Quick View"><FontAwesomeIcon icon={farStar} /></button>
                  <button className="product-action-btn" title="Add to Compare"><FontAwesomeIcon icon={faChevronRight} /></button>
                </div>
              </div>
              <div className="product-info">
                <div className="product-category">Smartphones</div>
                <h3 className="product-title"><Link to="/category/electronics">Ultra Pro Smartphone</Link></h3>
                <div className="product-price">
                  <span className="current-price">₹24,999</span>
                  <span className="old-price">₹29,999</span>
                </div>
                <div className="product-rating">
                  <div className="rating-stars">
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStarHalfAlt} />
                  </div>
                  <span className="rating-count">(1,956)</span>
                </div>
                <Link to="/category/electronics" className="btn btn-primary btn-sm view-details">View Details</Link>
              </div>
            </div>
          </div>
          
          <div className="view-all-container">
            <Link to="/category/top-selling" className="btn btn-outline">View All Top Sellers</Link>
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="special-offers">
        <div className="container">
          <div className="section-header">
            <h2>Special Offers</h2>
            <p>Limited time deals you don't want to miss</p>
          </div>
          
          <div className="offers-grid">
            {/* Offer Card 1 */}
            <div className="product-card">
              <div className="product-image">
                <span className="product-badge offer-badge">50% OFF</span>
                <img src="https://img.freepik.com/free-photo/laptop-white-background-3d-rendering-computer-generated-image_1142-48567.jpg" alt="Laptop" />
                <div className="product-actions">
                  <button className="product-action-btn" title="Add to Wishlist"><FontAwesomeIcon icon={farStar} /></button>
                  <button className="product-action-btn" title="Quick View"><FontAwesomeIcon icon={farStar} /></button>
                  <button className="product-action-btn" title="Add to Compare"><FontAwesomeIcon icon={faChevronRight} /></button>
                </div>
              </div>
              <div className="product-info">
                <div className="product-category">Computers</div>
                <h3 className="product-title"><Link to="/category/electronics">Ultra Slim Laptop Pro</Link></h3>
                <div className="product-price">
                  <span className="current-price">₹45,999</span>
                  <span className="old-price">₹89,999</span>
                </div>
                <div className="product-rating">
                  <div className="rating-stars">
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStarHalfAlt} />
                  </div>
                  <span className="rating-count">(1,245)</span>
                </div>
                <Link to="/category/electronics" className="btn btn-primary btn-sm view-details">View Details</Link>
              </div>
            </div>
            
            {/* Offer Card 2 */}
            <div className="product-card">
              <div className="product-image">
                <span className="product-badge offer-badge">40% OFF</span>
                <img src="https://img.freepik.com/free-photo/digital-camera-isolated-white-background_53876-46503.jpg" alt="Camera" />
                <div className="product-actions">
                  <button className="product-action-btn" title="Add to Wishlist"><FontAwesomeIcon icon={farStar} /></button>
                  <button className="product-action-btn" title="Quick View"><FontAwesomeIcon icon={farStar} /></button>
                  <button className="product-action-btn" title="Add to Compare"><FontAwesomeIcon icon={faChevronRight} /></button>
                </div>
              </div>
              <div className="product-info">
                <div className="product-category">Photography</div>
                <h3 className="product-title"><Link to="/category/electronics">Professional DSLR Camera</Link></h3>
                <div className="product-price">
                  <span className="current-price">₹35,999</span>
                  <span className="old-price">₹59,999</span>
                </div>
                <div className="product-rating">
                  <div className="rating-stars">
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={farStar} />
                  </div>
                  <span className="rating-count">(876)</span>
                </div>
                <Link to="/category/electronics" className="btn btn-primary btn-sm view-details">View Details</Link>
              </div>
            </div>
            
            {/* Offer Card 3 */}
            <div className="product-card">
              <div className="product-image">
                <span className="product-badge offer-badge">60% OFF</span>
                <img src="https://img.freepik.com/free-photo/modern-stationary-collection-arrangement_23-2149309642.jpg" alt="Office Supplies" />
                <div className="product-actions">
                  <button className="product-action-btn" title="Add to Wishlist"><FontAwesomeIcon icon={farStar} /></button>
                  <button className="product-action-btn" title="Quick View"><FontAwesomeIcon icon={farStar} /></button>
                  <button className="product-action-btn" title="Add to Compare"><FontAwesomeIcon icon={faChevronRight} /></button>
                </div>
              </div>
              <div className="product-info">
                <div className="product-category">Office Supplies</div>
                <h3 className="product-title"><Link to="/category/home">Premium Office Stationery Set</Link></h3>
                <div className="product-price">
                  <span className="current-price">₹1,199</span>
                  <span className="old-price">₹2,999</span>
                </div>
                <div className="product-rating">
                  <div className="rating-stars">
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                  <span className="rating-count">(1,532)</span>
                </div>
                <Link to="/category/home" className="btn btn-primary btn-sm view-details">View Details</Link>
              </div>
            </div>
          </div>
          
          <div className="view-all-container">
            <Link to="/category/special-offers" className="btn btn-outline">View All Offers</Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Customers Say</h2>
            <p>Read testimonials from satisfied shoppers</p>
          </div>
          
          <div className="testimonials-slider">
            <div className="testimonial">
              <div className="testimonial-content">
                <p>"StoreLinker has revolutionized my online shopping experience. I can find everything I need in one place with the best prices!"</p>
              </div>
              <div className="testimonial-author">
                <img src="/images/testimonial-1.jpg" alt="John Doe" />
                <div className="author-info">
                  <h4>John Doe</h4>
                  <span>Loyal Customer</span>
                </div>
              </div>
            </div>
            
            <div className="testimonial">
              <div className="testimonial-content">
                <p>"The compare feature is amazing! I saved so much money by comparing prices from different vendors before making my purchase."</p>
              </div>
              <div className="testimonial-author">
                <img src="/images/testimonial-2.jpg" alt="Jane Smith" />
                <div className="author-info">
                  <h4>Jane Smith</h4>
                  <span>Happy Shopper</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage; 