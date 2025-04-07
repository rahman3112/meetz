import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './home.css';

const Home = ({ loggedInEmail, onLogout }) => {
  const navigate = useNavigate();

  const handleMapClick = () => {
    navigate('/map');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">
            <h2>Meetz</h2>
          </div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            {loggedInEmail && <Link to="/map">Map</Link>}
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="auth-section">
            {loggedInEmail ? (
              <>
                <span className="welcome-text">{loggedInEmail}</span>
                <button className="logout-btn" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <button className="login-btn" onClick={handleLoginClick}>
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <h1>{loggedInEmail ? `Welcome, ${loggedInEmail}!` : 'Welcome to Meetz!'}</h1>
        <p>Pin a meeting spot on the map and vote on existing ones.</p>
        <div className="action-buttons">
          {loggedInEmail ? (
            <button className="get-started-btn" onClick={handleMapClick}>
              Go to Map
            </button>
          ) : (
            <button className="get-started-btn" onClick={handleLoginClick}>
              Get Started (Login)
            </button>
          )}
        </div>
      </div>

      {/* Overview Section with Background Image */}
      <div className="overview-section">
        <div className="overlay"></div>
        <div className="overview-content">
          <h2>Discover & Decide Meetups</h2>
          <div className="features">
            <div className="feature-card">
              <h3>Pin Locations</h3>
              <p>Mark your favorite meeting spots directly on our interactive map.</p>
            </div>
            <div className="feature-card">
              <h3>Vote on Spots</h3>
              <p>Help decide the best locations by voting on suggested meetups.</p>
            </div>
            <div className="feature-card">
              <h3>Real-time Updates</h3>
              <p>See popular spots emerge as more people vote in your area.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;