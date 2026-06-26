import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../config/api';
import { useNotification } from '../components/NotificationProvider';

function RequestManagement() {
  const { showToast, confirm } = useNotification();
  const [requests, setRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Pending', 'Approved', 'Rejected'

  const tabsRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ opacity: 0, width: 0, transform: 'translateX(0px)' });

  // Form state
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [requestsRes, hospitalsRes, inventoryRes] = await Promise.all([
        api.get('/api/requests'),
        api.get('/api/hospitals'),
        api.get('/api/inventory')
      ]);
      setRequests(requestsRes.data);
      setHospitals(hospitalsRes.data);
      setInventory(inventoryRes.data);
      if (hospitalsRes.data.length > 0 && !selectedHospitalId) {
        setSelectedHospitalId(hospitalsRes.data[0]._id);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blood requests:', err);
      setLoading(false);
    }
  }, [selectedHospitalId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Measure and position the sliding pill indicator
  const updateIndicator = useCallback(() => {
    const container = tabsRef.current;
    if (!container) return;

    const activeBtn = container.querySelector(`button[data-tab="${activeTab}"]`);
    if (!activeBtn) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const left = btnRect.left - containerRect.left + container.scrollLeft;

    setIndicatorStyle({
      opacity: 1,
      width: btnRect.width,
      transform: `translateX(${left}px)`
    });
  }, [activeTab]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateIndicator);
    window.addEventListener('resize', updateIndicator);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [updateIndicator, requests]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!selectedHospitalId) {
      showToast('Please register and select a hospital first.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/requests', {
        hospitalId: selectedHospitalId,
        bloodGroup,
        unitsRequired: parseInt(unitsRequired),
        requestDate: new Date(requestDate)
      });
      showToast('Blood request submitted successfully!', 'success');
      setUnitsRequired(1);
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      showToast('Error creating blood request: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/api/requests/${id}`, {
        status: newStatus
      });
      showToast(res.data.message || `Request status set to ${newStatus}.`, 'success');
      fetchData();
    } catch (err) {
      showToast('Transaction Error: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleDeleteRequest = (id) => {
    confirm(
      'Are you sure you want to permanently delete this request record? Any approved units will be returned to inventory.',
      async () => {
        try {
          await api.delete(`/api/requests/${id}`);
          showToast('Request record deleted successfully.', 'success');
          fetchData();
        } catch (err) {
          showToast('Error deleting request: ' + err.message, 'error');
        }
      },
      'Delete Blood Request'
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Approved') return 'badge badge-approved';
    if (status === 'Rejected') return 'badge badge-rejected';
    return 'badge badge-pending';
  };

  // Live stock warning calculation
  const getStockStatus = (reqBloodGroup, reqUnits, reqStatus) => {
    if (reqStatus !== 'Pending') return null;

    const stockItem = inventory.find(i => i.bloodGroup === reqBloodGroup);
    if (!stockItem) return null;

    const available = stockItem.unitsAvailable;

    if (available < reqUnits) {
      return (
        <span 
          className="badge badge-rejected" 
          style={{ 
            marginLeft: '8px', 
            fontSize: '0.75rem', 
            background: 'rgba(231, 29, 54, 0.12)', 
            color: 'var(--danger-color)',
            animation: 'pulse-danger 2s infinite alternate'
          }}
        >
          ⚠️ Insufficient Stock ({available} units left)
        </span>
      );
    } else if (available < 6) {
      return (
        <span 
          className="badge badge-pending" 
          style={{ 
            marginLeft: '8px', 
            fontSize: '0.75rem', 
            background: 'rgba(255, 159, 28, 0.12)', 
            color: 'var(--warning-color)' 
          }}
        >
          ⚠️ Low Stock Warning ({available} units left)
        </span>
      );
    } else {
      return (
        <span 
          className="badge badge-approved" 
          style={{ 
            marginLeft: '8px', 
            fontSize: '0.75rem', 
            background: 'rgba(46, 196, 182, 0.12)', 
            color: 'var(--success-color)' 
          }}
        >
          ✓ Stock Sufficient ({available} units available)
        </span>
      );
    }
  };

  // Dynamic statistics
  const totalRequests = requests.length;
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;

  // Filter & Search Requests
  const filteredRequests = requests.filter((r) => {
    const hospitalName = r.hospitalId?.hospitalName || '';
    const matchesSearch = hospitalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || r.status === activeTab;
    return matchesSearch && matchesTab;
  });

  if (loading) {
    return <div className="container"><p style={{ textAlign: 'center' }}>Loading blood requests queue...</p></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Blood Request Management</h1>
          <p className="page-subtitle">Process hospital blood unit requirements and coordinate approvals</p>
        </div>
        <button 
          className="btn btn-warning" 
          onClick={() => {
            if (hospitals.length > 0 && !selectedHospitalId) {
              setSelectedHospitalId(hospitals[0]._id);
            }
            setShowAddModal(true);
          }}
        >
          <img src="/images/request_icon.png" alt="Request" style={{width: '22px', height: '22px' }} />
          Submit Blood Request
        </button>
      </div>

      {/* 📊 Request Statistics Grid */}
      <div className="stats-grid">
        <div className="stats-card info">
          <span className="stats-title">Total Requests</span>
          <span className="stats-value">{totalRequests}</span>
          <span className="stats-desc">Total hospital pipeline items</span>
        </div>
        <div className="stats-card warning">
          <span className="stats-title">Pending Approvals</span>
          <span className="stats-value">{pendingCount}</span>
          <span className="stats-desc">Requires admin clearance</span>
        </div>
        <div className="stats-card success">
          <span className="stats-title">Approved Requests</span>
          <span className="stats-value">{approvedCount}</span>
          <span className="stats-desc">Dispatched and stock deducted</span>
        </div>
        <div className="stats-card info" style={{ borderLeftColor: 'var(--text-light)' }}>
          <span className="stats-title">Rejected Requests</span>
          <span className="stats-value">{rejectedCount}</span>
          <span className="stats-desc">Cancelled and denied items</span>
        </div>
      </div>

      {/* Main Full-Page Table Card */}
      <div className="card" style={{ width: '100%' }}>
        <h2 className="form-title">Request Queue Pipeline</h2>

        {/* Tab & Search Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
          {/* Sliding Pill Status Tabs */}
          <div 
            ref={tabsRef} 
            style={{ 
              position: 'relative', 
              display: 'flex', 
              gap: '4px', 
              background: 'rgba(43, 45, 66, 0.05)', 
              padding: '4px', 
              borderRadius: '999px',
              width: 'fit-content',
              height: 'fit-content'
            }}
          >
            {/* Sliding Pill Indicator */}
            <div 
              style={{
                position: 'absolute',
                top: '4px',
                left: '0px',
                height: 'calc(100% - 8px)',
                borderRadius: '999px',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1), width 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s ease',
                pointerEvents: 'none',
                ...indicatorStyle
              }}
            />
            {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
              <button
                key={tab}
                data-tab={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  border: 'none',
                  background: 'transparent',
                  color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-dark)',
                  fontWeight: activeTab === tab ? '600' : '500',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'color 0.25s ease'
                }}
              >
                {tab} {tab === 'All' ? `(${totalRequests})` : tab === 'Pending' ? `(${pendingCount})` : tab === 'Approved' ? `(${approvedCount})` : `(${rejectedCount})`}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <input 
            type="text" 
            placeholder="🔍 Search by hospital name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Hospital</th>
                <th>Blood Group</th>
                <th>Units Required</th>
                <th>Request Date</th>
                <th>Status</th>
                <th style={{ width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '30px 10px' }}>
                    No requests found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <code style={{ background: 'rgba(46, 196, 182, 0.12)', padding: '4px 6px', borderRadius: '4px', color: '#2ec4b6', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        REQ-{r._id.slice(-6).toUpperCase()}
                      </code>
                    </td>
                    <td>
                      <strong>{r.hospitalId?.hospitalName || 'Deleted Hospital'}</strong>
                      {r.hospitalId && <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>ID: {r.hospitalId._id.slice(-6).toUpperCase()}</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="badge badge-stock-normal" style={{ background: '#ffe3e6', color: 'var(--primary-color)' }}>
                          {r.bloodGroup}
                        </span>
                        {getStockStatus(r.bloodGroup, r.unitsRequired, r.status)}
                      </div>
                    </td>
                    <td><strong>{r.unitsRequired}</strong> units</td>
                    <td>{formatDate(r.requestDate)}</td>
                    <td>
                      <span className={getStatusBadgeClass(r.status)}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-actions">
                        {r.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(r._id, 'Approved')} 
                              className="btn btn-success"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(r._id, 'Rejected')} 
                              className="btn btn-warning"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDeleteRequest(r._id)} 
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ➕ Submit Blood Request Modal overlay */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card modal-form-card">
            <h2 className="form-title">Submit Blood Request</h2>
            <form onSubmit={handleCreateRequest} style={{ width: '100%', padding: 0, boxShadow: 'none', background: 'transparent' }}>
              <div className="form-group">
                <label>Select Hospital</label>
                {hospitals.length === 0 ? (
                  <p style={{ color: 'var(--danger-color)', fontSize: '0.9rem' }}>
                    No hospitals registered. Please add a hospital first in the "Hospitals" tab.
                  </p>
                ) : (
                  <select value={selectedHospitalId} onChange={(e) => setSelectedHospitalId(e.target.value)}>
                    {hospitals.map(h => (
                      <option key={h._id} value={h._id}>
                        {h.hospitalName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label>Blood Group Requested</label>
                <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
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

              <div className="form-group">
                <label>Units Required</label>
                <input 
                  type="number" 
                  min="1" 
                  value={unitsRequired} 
                  onChange={(e) => setUnitsRequired(parseInt(e.target.value) || 1)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Request Date</label>
                <input 
                  type="date" 
                  value={requestDate} 
                  onChange={(e) => setRequestDate(e.target.value)} 
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
                  disabled={submitting || hospitals.length === 0}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestManagement;
