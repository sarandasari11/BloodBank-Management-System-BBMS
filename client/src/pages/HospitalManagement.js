import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { useNotification } from '../components/NotificationProvider';

function HospitalManagement() {
  const { showToast, confirm } = useNotification();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [hospitalName, setHospitalName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/api/hospitals');
      setHospitals(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleAddHospital = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/hospitals', {
        hospitalName,
        contactPerson,
        phone,
        address
      });
      showToast('Hospital registered successfully!', 'success');
      setHospitalName('');
      setContactPerson('');
      setPhone('');
      setAddress('');
      setShowAddModal(false);
      fetchHospitals();
    } catch (err) {
      showToast('Error registering hospital: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHospital = (id, name) => {
    confirm(
      `Are you sure you want to permanently delete hospital "${name}"?`,
      async () => {
        try {
          await api.delete(`/api/hospitals/${id}`);
          showToast(`Hospital "${name}" record deleted successfully.`, 'success');
          fetchHospitals();
        } catch (err) {
          showToast('Error deleting hospital: ' + err.message, 'error');
        }
      },
      'Delete Hospital Record'
    );
  };

  // Filter hospitals
  const filteredHospitals = hospitals.filter((h) =>
    h.hospitalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic statistics
  const totalHospitals = hospitals.length;
  const activeContactsCount = new Set(hospitals.map(h => h.contactPerson).filter(Boolean)).size;
  const citiesCount = new Set(
    hospitals.map(h => {
      const parts = h.address.split(',');
      return parts[parts.length - 1]?.trim();
    }).filter(Boolean)
  ).size;

  if (loading) {
    return <div className="container"><p style={{ textAlign: 'center' }}>Loading hospitals directory...</p></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hospital Management</h1>
          <p className="page-subtitle">Configure partner medical institutions and request portals</p>
        </div>
        <button 
          className="btn btn-warning" 
          onClick={() => setShowAddModal(true)}
        >
          <img src="/images/request_icon.png" alt="Hospital" style={{ width: '22px', height: '22px' }} />
          Register Partner Hospital
        </button>
      </div>

      {/* 📊 Hospital Statistics Grid */}
      <div className="stats-grid">
        <div className="stats-card info">
          <span className="stats-title">Partner Hospitals</span>
          <span className="stats-value">{totalHospitals}</span>
          <span className="stats-desc">Total medical centers registered</span>
        </div>
        <div className="stats-card success">
          <span className="stats-title">Active Contacts</span>
          <span className="stats-value">{activeContactsCount}</span>
          <span className="stats-desc">Direct administrators & medical leads</span>
        </div>
        <div className="stats-card warning">
          <span className="stats-title">Regions Served</span>
          <span className="stats-value">{citiesCount}</span>
          <span className="stats-desc">Unique service locations & cities</span>
        </div>
      </div>

      {/* Main Full-Page Table Card */}
      <div className="card" style={{ width: '100%' }}>
        <h2 className="form-title">Hospital Directory</h2>

        {/* Search Input Filter */}
        <div className="filter-bar">
          <input 
            type="text" 
            placeholder="🔍 Search hospital by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
        </div>

        <div className="table-responsive">
          <table className="data-table hospital-table" style={{ width: '100%', tableLayout: 'auto' }}>
            <thead>
              <tr>
                <th>Hospital Name</th>
                <th>Contact Person</th>
                <th>Phone Number</th>
                <th>Address</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHospitals.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                    No hospitals found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredHospitals.map((hospital) => (
                  <tr key={hospital._id}>
                    <td>
                      <strong>{hospital.hospitalName}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>ID: {hospital._id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td>{hospital.contactPerson}</td>
                    <td className="contact-cell">📞 {hospital.phone}</td>
                    <td>📍 {hospital.address}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteHospital(hospital._id, hospital.hospitalName)} 
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ➕ Register Hospital Modal Overlay */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card modal-form-card">
            <h2 className="form-title">Register Partner Hospital</h2>
            <form onSubmit={handleAddHospital} style={{ width: '100%', padding: 0, boxShadow: 'none', background: 'transparent' }}>
              <div className="form-group">
                <label>Hospital Name</label>
                <input 
                  type="text" 
                  value={hospitalName} 
                  onChange={(e) => setHospitalName(e.target.value)} 
                  required 
                  placeholder="e.g. City General Hospital"
                />
              </div>

              <div className="form-group">
                <label>Contact Person (Doctor/Nurse/Admin)</label>
                <input 
                  type="text" 
                  value={contactPerson} 
                  onChange={(e) => setContactPerson(e.target.value)} 
                  required 
                  placeholder="e.g. Dr. Sarah Connor"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required 
                  placeholder="e.g. 555-0144"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  required 
                  placeholder="e.g. 100 Medical Center Dr, Boston"
                  rows="2"
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Registering...' : 'Register Hospital'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalManagement;
