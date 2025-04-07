import React, { useState,useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes,Navigate } from 'react-router-dom';
import Login from './components/login';
import Signup from './components/signup';
import Home from './components/home';
import Map from './components/map';
import Contact from './components/contact';
const App = () => {
  const [loggedInEmail, setLoggedInEmail] = useState(localStorage.getItem('loggedInEmail') || null);

  const handleLogin = (email) => {
    console.log('Setting loggedInEmail:', email);
    setLoggedInEmail(email);
    localStorage.setItem('loggedInEmail', email);
  };

  const handleLogout = () => {
    setLoggedInEmail(null);
    localStorage.removeItem('loggedInEmail');
  };

  useEffect(() => {
    console.log('Current loggedInEmail:', loggedInEmail);
  }, [loggedInEmail]);

  return (
    <Router>
      <Routes>
        {/* Initial route is Home */}
        <Route path="/" element={<Home loggedInEmail={loggedInEmail} onLogout={handleLogout} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/contact" element={<Contact />} />

        {/* Map is protected, redirects to /login if not logged in */}
        <Route
          path="/map"
          element={loggedInEmail ? <Map loggedInEmail={loggedInEmail} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;