import React, { useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import { useNotification } from '../components/NotificationProvider';

function DonationManagement() {
  const { showToast } = useNotification();
  const [donations, setDonations] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');

  // Form state
  const [selectedDonorId, setSelectedDonorId] = useState('');
  const [unitsDonated, setUnitsDonated] = useState(1);
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [donationsRes, donorsRes] = await Promise.all([
        api.get('/api/donations'),
        api.get('/api/donors')
      ]);
      setDonations(donationsRes.data);
      setDonors(donorsRes.data);
      if (donorsRes.data.length > 0 && !selectedDonorId) {
        setSelectedDonorId(donorsRes.data[0]._id);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching donations data:', err);
      setLoading(false);
    }
  }, [selectedDonorId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRecordDonation = async (e) => {
    e.preventDefault();
    if (!selectedDonorId) {
      showToast('Please register and select a donor first.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/api/donations', {
        donorId: selectedDonorId,
        unitsDonated: parseInt(unitsDonated),
        donationDate: new Date(donationDate)
      });
      showToast(res.data.message || 'Donation recorded and inventory updated!', 'success');
      setUnitsDonated(1);
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      showToast('Error recording donation: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  };

  const getSelectedDonorGroup = () => {
    const d = donors.find(d => d._id === selectedDonorId);
    return d ? d.bloodGroup : '';
  };

  // Calculate dynamic stats
  const totalUnits = donations.reduce((sum, d) => sum + d.unitsDonated, 0);
  const activeDonorsCount = new Set(donations.map(d => d.donorId?._id).filter(Boolean)).size;

  const counts = {};
  donations.forEach(d => {
    counts[d.bloodGroup] = (counts[d.bloodGroup] || 0) + d.unitsDonated;
  });
  let topGroup = 'None';
  let maxUnits = 0;
  Object.keys(counts).forEach(g => {
    if (counts[g] > maxUnits) {
      maxUnits = counts[g];
      topGroup = g;
    }
  });

  // Filter donations
  const filteredDonations = donations.filter((d) => {
    const donorName = d.donorId?.name || '';
    const matchesName = donorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedBloodGroup === 'All' || d.bloodGroup === selectedBloodGroup;
    return matchesName && matchesGroup;
  });

  if (loading) {
    return <div className="container"><p style={{ textAlign: 'center' }}>Loading donations logs...</p></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Donation Management</h1>
          <p className="page-subtitle">Track blood donation receipts and update inventory stock</p>
        </div>
        <button 
          className="btn btn-warning" 
          onClick={() => {
            if (donors.length > 0 && !selectedDonorId) {
              setSelectedDonorId(donors[0]._id);
            }
            setShowAddModal(true);
          }}
        >
          <img src="/images/donor_icon.png" alt="Donation" style={{ width: '22px', height: '22px'}} />
          Record New Donation
        </button>
      </div>

      {/* 📊 Donation Statistics Grid */}
      <div className="stats-grid">
        <div className="stats-card success">
          <span className="stats-title">Total Donations</span>
          <span className="stats-value">{donations.length}</span>
          <span className="stats-desc">Total receipts logged</span>
        </div>
        <div className="stats-card info">
          <span className="stats-title">Units Received</span>
          <span className="stats-value">{totalUnits}</span>
          <span className="stats-desc">Total pints of blood collected</span>
        </div>
        <div className="stats-card info">
          <span className="stats-title">Active Donors</span>
          <span className="stats-value">{activeDonorsCount}</span>
          <span className="stats-desc">Unique participating donors</span>
        </div>
        <div className="stats-card warning">
          <span className="stats-title">Top Blood Group</span>
          <span className="stats-value">{topGroup === 'None' ? 'N/A' : topGroup}</span>
          <span className="stats-desc">{topGroup === 'None' ? 'No donations yet' : `Most donated type (${maxUnits} units)`}</span>
        </div>
      </div>

      {/* Main Full-Page Table Card */}
      <div className="card" style={{ width: '100%' }}>
        <h2 className="form-title">Donation History Log</h2>
        
        {/* Search & Filter Bar */}
        <div className="filter-bar">
          <input 
            type="text" 
            placeholder="🔍 Search by donor name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            value={selectedBloodGroup} 
            onChange={(e) => setSelectedBloodGroup(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="All">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Donation ID</th>
                <th>Donor Name</th>
                <th>Blood Group</th>
                <th>Units Donated</th>
                <th>Donation Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                    No donations found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <code style={{ background: 'rgba(46, 196, 182, 0.12)', padding: '4px 6px', borderRadius: '4px', color: '#2ec4b6', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        DON-{d._id.slice(-6).toUpperCase()}
                      </code>
                    </td>
                    <td>
                      <strong>{d.donorId?.name || 'Deleted Donor'}</strong>
                      {d.donorId && <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>ID: {d.donorId._id.slice(-6).toUpperCase()}</div>}
                    </td>
                    <td>
                      <span className="badge badge-stock-normal" style={{ background: '#ffe3e6', color: 'var(--primary-color)' }}>
                        {d.bloodGroup}
                      </span>
                    </td>
                    <td><strong>{d.unitsDonated}</strong> units</td>
                    <td>{formatDate(d.donationDate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ➕ Record Donation Modal overlay */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card modal-form-card">
            <h2 className="form-title">Record New Donation</h2>
            <form onSubmit={handleRecordDonation} style={{ width: '100%', padding: 0, boxShadow: 'none', background: 'transparent' }}>
              <div className="form-group">
                <label>Select Donor</label>
                {donors.length === 0 ? (
                  <p style={{ color: 'var(--danger-color)', fontSize: '0.9rem' }}>
                    No registered donors found. Please register a donor first under the "Donors" tab.
                  </p>
                ) : (
                  <>
                    <select value={selectedDonorId} onChange={(e) => setSelectedDonorId(e.target.value)}>
                      {donors.map(d => (
                        <option key={d._id} value={d._id}>
                          {d.name} ({d.bloodGroup})
                        </option>
                      ))}
                    </select>
                    <div style={{ marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      Blood Group: <strong>{getSelectedDonorGroup()}</strong>
                    </div>
                  </>
                )}
              </div>

              <div className="form-group">
                <label>Units Donated (Pints/Units)</label>
                <input 
                  type="number" 
                  min="1" 
                  value={unitsDonated} 
                  onChange={(e) => setUnitsDonated(parseInt(e.target.value) || 1)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Donation Date</label>
                <input 
                  type="date" 
                  value={donationDate} 
                  onChange={(e) => setDonationDate(e.target.value)} 
                  required 
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
                  disabled={submitting || donors.length === 0}
                >
                  {submitting ? 'Recording...' : 'Record Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonationManagement;
