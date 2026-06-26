import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { Link } from 'react-router-dom';
import { useNotification } from '../components/NotificationProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function DashboardOverview() {
  const { showToast, confirm } = useNotification();
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalDonations: 0,
    totalHospitals: 0,
    pendingRequests: 0,
    lowStockAlertsCount: 0,
    lowStockAlerts: []
  });
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchStats = async () => {
    try {
      const [statsRes, invRes, donationsRes, requestsRes] = await Promise.all([
        api.get('/api/stats'),
        api.get('/api/inventory'),
        api.get('/api/donations'),
        api.get('/api/requests')
      ]);
      setStats(statsRes.data);
      setInventory(invRes.data);

      // Map donations to transaction log format
      const donationLogs = donationsRes.data.map(d => ({
        id: d._id,
        type: 'donation',
        title: `Donation: +${d.unitsDonated} units of ${d.bloodGroup}`,
        description: `Received from ${d.donorId?.name || 'Unknown Donor'}`,
        timestamp: new Date(d.donationDate),
        statusClass: 'success'
      }));

      // Map requests to transaction log format
      const requestLogs = requestsRes.data.map(r => ({
        id: r._id,
        type: 'request',
        title: `Request: ${r.status} ${r.unitsRequired} units of ${r.bloodGroup}`,
        description: `Submitted by ${r.hospitalId?.hospitalName || 'Unknown Hospital'}`,
        timestamp: new Date(r.requestDate),
        statusClass: r.status === 'Approved' ? 'success' : r.status === 'Rejected' ? 'danger' : 'warning'
      }));

      // Sort combined activity log chronologically (most recent first)
      const combinedLogs = [...donationLogs, ...requestLogs]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);

      setLogs(combinedLogs);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeed = () => {
    confirm(
      'This will reset the database and seed fresh dummy data. Proceed?',
      async () => {
        setSeeding(true);
        try {
          const res = await api.post('/api/seed');
          showToast(res.data.message || 'Database seeded successfully!', 'success');
          fetchStats();
        } catch (err) {
          showToast('Seeding failed: ' + err.message, 'error');
        } finally {
          setSeeding(false);
        }
      },
      'Database Seeder Reset'
    );
  };

  if (loading) {
    return <div className="container"><p style={{ textAlign: 'center' }}>Loading dashboard analytics...</p></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Blood Bank Dashboard</h1>
          <p className="page-subtitle">Real-time status overview of the Blood Bank Management System</p>
        </div>
        <button 
          onClick={handleSeed} 
          className="btn btn-warning"
          disabled={seeding}
        >
          <img src="/images/reset_icon.png" alt="Reset" style={{ width: '22px', height: '22px' }} />
          {seeding ? 'Seeding Database...' : 'Reset & Seed Database'}
        </button>
      </div>

      {stats.lowStockAlertsCount > 0 && (
        <div style={{
          background: '#fff0f0',
          border: '1px solid #ffccd0',
          borderRadius: '8px',
          padding: '16px 24px',
          color: '#d90429',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ Low Stock Alerts
          </h3>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            The following blood groups have units available below the safety threshold (6 units):{' '}
            <strong>{stats.lowStockAlerts.join(', ')}</strong>. Please prioritize donations for these types.
          </p>
        </div>
      )}

      {/* 📊 DBMS Stats Grid */}
      <div className="stats-grid">
        <div className="stats-card info">
          <span className="stats-title">Registered Donors</span>
          <span className="stats-value">{stats.totalDonors}</span>
          <span className="stats-desc">Active database donor records</span>
        </div>
        <div className="stats-card success">
          <span className="stats-title">Total Donations</span>
          <span className="stats-value">{stats.totalDonations}</span>
          <span className="stats-desc">Total donations recorded</span>
        </div>
        <div className="stats-card info">
          <span className="stats-title">Hospitals Registered</span>
          <span className="stats-value">{stats.totalHospitals}</span>
          <span className="stats-desc">Partner medical facilities</span>
        </div>
        <div className="stats-card warning">
          <span className="stats-title">Pending Requests</span>
          <span className="stats-value">{stats.pendingRequests}</span>
          <span className="stats-desc">Requests awaiting approval</span>
        </div>
      </div>

      {/* 📊 Live Blood Stock Bar Chart Analysis */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
          📊 Live Blood Stock Inventory Analysis
        </h2>
        <div style={{ width: '100%', height: 280, marginTop: '20px' }}>
          <ResponsiveContainer>
            <BarChart data={inventory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="bloodGroup" tick={{ fill: 'var(--text-dark)', fontSize: 12, fontWeight: 600 }} />
              <YAxis tick={{ fill: 'var(--text-light)', fontSize: 11 }} />
              <Tooltip 
                cursor={{ fill: 'rgba(217, 4, 41, 0.04)' }} 
                contentStyle={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-md)'
                }}
                labelStyle={{ color: 'var(--text-dark)', fontWeight: 600 }}
                itemStyle={{ color: 'var(--text-dark)' }}
              />
              <Bar name="Units Available" dataKey="unitsAvailable" radius={[6, 6, 0, 0]} maxBarSize={45}>
                {inventory.map((entry, index) => {
                  const isLow = entry.unitsAvailable < 6;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isLow ? 'var(--danger-color)' : 'var(--primary-color)'} 
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 💡 Did You Know / Facts Grid */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
          💡 Blood Donation Facts
        </h2>
        <div className="facts-grid">
          <div className="fact-item">
            <span className="fact-icon">🎁</span>
            <span className="fact-title">Save Up To Three Lives</span>
            <span className="fact-text">
              A single blood donation can save up to three lives. The donated unit is typically separated into individual components: red cells, plasma, and platelets.
            </span>
          </div>
          <div className="fact-item">
            <span className="fact-icon">⏱️</span>
            <span className="fact-title">Every 2 Seconds</span>
            <span className="fact-text">
              Every two seconds, someone in the world needs a blood transfusion. It is critical for traumatic injury cases, cancer therapies, and complicated surgeries.
            </span>
          </div>
          <div className="fact-item">
            <span className="fact-icon">🌎</span>
            <span className="fact-title">Universal Recipient & Donor</span>
            <span className="fact-text">
              <strong>O-Negative</strong> is the universal red blood cell donor type (safe for anyone), while <strong>AB-Positive</strong> is the universal recipient type (can accept any blood).
            </span>
          </div>
        </div>
      </div>

      {/* 📊 Compatibility Matrix */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
          🩸 Blood Compatibility Matrix
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '16px' }}>
          Understanding blood type compatibility is crucial for emergency transfusions and inventory forecasting in database records.
        </p>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Blood Type</th>
                <th>Can Donate To (Red Cells)</th>
                <th>Can Receive From (Red Cells)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>A+</strong></td>
                <td>A+, AB+</td>
                <td>A+, A-, O+, O-</td>
              </tr>
              <tr>
                <td><strong>A-</strong></td>
                <td>A+, A-, AB+, AB-</td>
                <td>A-, O-</td>
              </tr>
              <tr>
                <td><strong>B+</strong></td>
                <td>B+, AB+</td>
                <td>B+, B-, O+, O-</td>
              </tr>
              <tr>
                <td><strong>B-</strong></td>
                <td>B+, B-, AB+, AB-</td>
                <td>B-, O-</td>
              </tr>
              <tr>
                <td><strong>AB+</strong></td>
                <td>AB+ <i>(Universal Recipient)</i></td>
                <td>Everyone <i>(A+, A-, B+, B-, AB+, AB-, O+, O-)</i></td>
              </tr>
              <tr>
                <td><strong>AB-</strong></td>
                <td>AB+, AB-</td>
                <td>AB-, A-, B-, O-</td>
              </tr>
              <tr>
                <td><strong>O+</strong></td>
                <td>O+, A+, B+, AB+</td>
                <td>O+, O-</td>
              </tr>
              <tr>
                <td><strong>O-</strong></td>
                <td>Everyone <i>(Universal Donor)</i></td>
                <td>O-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚶 The Donation Journey */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
          🚶 The Donation Journey Pathway
        </h2>
        <div className="journey-timeline">
          <div className="journey-step">
            <span className="step-number">1</span>
            <div className="step-title">Donor Registration</div>
            <div className="step-desc">Register demographic data in our DBMS directory database.</div>
          </div>
          <div className="journey-step">
            <span className="step-number">2</span>
            <div className="step-title">Health Screen</div>
            <div className="step-desc">A brief check of pulse, blood pressure, temperature, and hemoglobin.</div>
          </div>
          <div className="journey-step">
            <span className="step-number">3</span>
            <div className="step-title">The Donation</div>
            <div className="step-desc">Takes about 8-10 minutes to safely draw 1 unit of blood.</div>
          </div>
          <div className="journey-step">
            <span className="step-number">4</span>
            <div className="step-title">Recovery Snacks</div>
            <div className="step-desc">Rest for 10-15 minutes and enjoy cookies and drinks.</div>
          </div>
        </div>
      </div>

      {/* Split Layout for Activity Log & Quick Links */}
      <div className="split-layout" style={{ marginTop: '20px' }}>
        {/* 📜 DBMS Transaction Activity Log */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
            📜 System Activity & Audit Log
          </h2>
          <div className="activity-log-container">
            {logs.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', textAlign: 'center', margin: '20px 0' }}>
                No database transactions logged yet.
              </p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className={`activity-log-item ${log.statusClass}`}>
                  <div className="activity-log-title">{log.title}</div>
                  <div className="activity-log-desc">{log.description}</div>
                  <div className="activity-log-time">
                    {log.timestamp.toLocaleDateString()} at {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ⚙️ Operations Quick Links */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
            Operations Quick Links
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
            <Link to="/inventory" className="btn btn-warning" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <img src="/images/add_icon.png" alt="Override" style={{ width: '22px', height: '22px' }} /> View Inventory Stock
            </Link>
            <Link to="/donors" className="btn btn-warning" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <img src="/images/donor_icon.png" alt="Donor" style={{ width: '22px', height: '22px'}} /> Add / Manage Donors
            </Link>
            <Link to="/donations" className="btn btn-warning" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <img src="/images/donor_icon.png" alt="Donation" style={{ width: '22px', height: '22px'}} /> Record New Donation
            </Link>
            <Link to="/requests" className="btn btn-warning" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <img src="/images/request_icon.png" alt="Request" style={{ width: '22px', height: '22px' }} /> Approve Hospital Requests
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
