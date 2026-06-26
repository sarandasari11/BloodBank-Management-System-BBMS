import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { useNotification } from '../components/NotificationProvider';

function DonorManagement() {
  const { showToast, confirm } = useNotification();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Donor form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDonors = async () => {
    try {
      const res = await api.get('/api/donors');
      setDonors(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching donors:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleAddDonor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/donors', {
        name,
        age: parseInt(age),
        gender,
        bloodGroup,
        phone,
        address
      });
      showToast('Donor registered successfully!', 'success');
      // Reset form & close modal
      setName('');
      setAge('');
      setGender('Male');
      setBloodGroup('A+');
      setPhone('');
      setAddress('');
      setShowAddModal(false);
      fetchDonors();
    } catch (err) {
      showToast('Error registering donor: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDonor = (id, donorName) => {
    confirm(
      `Are you sure you want to permanently delete donor "${donorName}"?`,
      async () => {
        try {
          await api.delete(`/api/donors/${id}`);
          showToast(`Donor "${donorName}" record has been deleted.`, 'success');
          fetchDonors();
        } catch (err) {
          showToast('Error deleting donor: ' + err.message, 'error');
        }
      },
      'Delete Donor Record'
    );
  };

  // Filter donors
  const filteredDonors = donors.filter((d) => {
    const matchesName = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedBloodGroup === 'All' || d.bloodGroup === selectedBloodGroup;
    return matchesName && matchesGroup;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="container"><p style={{ textAlign: 'center' }}>Loading donors directory...</p></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Donor Management</h1>
          <p className="page-subtitle">Register new donors and manage the donor database</p>
        </div>
        <button 
          className="btn btn-warning" 
          onClick={() => setShowAddModal(true)}
        >
          <img src="/images/donor_icon.png" alt="Donor" style={{ width: '22px', height: '22px'}} />
          Register New Donor
        </button>
      </div>

      <div className="card" style={{ width: '100%' }}>
        <h2 className="form-title">Donor Registry</h2>
        
        <div className="filter-bar">
          <input 
            type="text" 
            placeholder="🔍 Search donor by name..." 
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

        <div className="donor-grid">
  {filteredDonors.length === 0 ? (
    <div className="card">
      No donors found matching the filters.
    </div>
  ) : (
    filteredDonors.map((donor) => (
      <div className="donor-card" key={donor._id}>
        
        <div className="donor-header">
          <div className="donor-profile">
  <div className="donor-avatar">
    {donor.name.charAt(0)}
  </div>

  <div>
    <h3>{donor.name}</h3>
    <p className="donor-id">
      ID: {donor._id.slice(-6).toUpperCase()}
    </p>
  </div>
</div>
          <span className="blood-badge">
            🩸 {donor.bloodGroup}
          </span>
        </div>

        <div className="donor-details">
          <p>👤 {donor.gender}</p>
          <p>🎂 {donor.age} Years</p>
          <p>📞 {donor.phone}</p>
          <p>📍 {donor.address}</p>
        </div>

        <div className="donor-footer">
          <span>
            ❤️ Last Donation:
            <br />
            {formatDate(donor.lastDonation)}
          </span>

          <button
            className="btn btn-danger"
            onClick={() =>
              handleDeleteDonor(donor._id, donor.name)
            }
          >
            Delete
          </button>
        </div>

      </div>
    ))
  )}
</div>
      </div>

      {/* ➕ Register Donor Modal Form */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card modal-form-card">
            <h2 className="form-title">Register New Donor</h2>
            <form onSubmit={handleAddDonor} style={{ width: '100%', padding: 0, boxShadow: 'none', background: 'transparent' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="e.g. John Doe"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Age</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)} 
                    required 
                    placeholder="e.g. 25"
                  />
                </div>
                <div className="gender-group">
  <button
    type="button"
    className={`gender-btn ${gender === "Male" ? "active" : ""}`}
    onClick={() => setGender("Male")}
  >
    👨 Male
  </button>

  <button
    type="button"
    className={`gender-btn ${gender === "Female" ? "active" : ""}`}
    onClick={() => setGender("Female")}
  >
    👩 Female
  </button>

  <button
    type="button"
    className={`gender-btn ${gender === "Other" ? "active" : ""}`}
    onClick={() => setGender("Other")}
  >
    ⚧ Other
  </button>
</div>
              </div>

              <div className="form-group">
  <label>Blood Group</label>

  <div className="blood-group-grid">
    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((group) => (
      <button
        type="button"
        key={group}
        className={`blood-chip ${
          bloodGroup === group ? "active" : ""
        }`}
        onClick={() => setBloodGroup(group)}
      >
        🩸 {group}
      </button>
    ))}
  </div>
</div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required 
                  placeholder="e.g. 555-0199"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  required 
                  placeholder="e.g. 123 Main St"
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
                  {submitting ? 'Registering...' : 'Register Donor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorManagement;
