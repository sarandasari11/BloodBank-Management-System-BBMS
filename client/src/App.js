import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardOverview from './pages/DashboardOverview';
import InventoryManagement from './pages/InventoryManagement';
import DonorManagement from './pages/DonorManagement';
import DonationManagement from './pages/DonationManagement';
import HospitalManagement from './pages/HospitalManagement';
import RequestManagement from './pages/RequestManagement';
import { NotificationProvider } from './components/NotificationProvider';
import './styles.css';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="route-transition" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/inventory" element={<InventoryManagement />} />
        <Route path="/donors" element={<DonorManagement />} />
        <Route path="/donations" element={<DonationManagement />} />
        <Route path="/hospitals" element={<HospitalManagement />} />
        <Route path="/requests" element={<RequestManagement />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <NotificationProvider>
        <Navbar />
        <div className="main-content">
          <AnimatedRoutes />
        </div>
        <Footer />
      </NotificationProvider>
    </Router>
  );
}

export default App;
