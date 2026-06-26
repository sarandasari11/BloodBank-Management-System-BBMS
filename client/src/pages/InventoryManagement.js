import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { useNotification } from '../components/NotificationProvider';

function InventoryManagement() {
  const { showToast } = useNotification();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  
  // Form state
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [unitsAvailable, setUnitsAvailable] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/api/inventory');
      setInventory(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleManualUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put('/api/inventory/manual', {
        bloodGroup,
        unitsAvailable
      });
      showToast(`Inventory updated: ${bloodGroup} is set to ${unitsAvailable} units.`, 'success');
      setShowOverrideModal(false);
      fetchInventory();
    } catch (err) {
      showToast('Error updating inventory: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container"><p style={{ textAlign: 'center' }}>Loading inventory database...</p></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Blood Inventory Management</h1>
          <p className="page-subtitle">View and configure current stock levels across all blood groups</p>
        </div>
        <button 
          className="btn btn-warning" 
          onClick={() => {
            const currentItem = inventory.find(i => i.bloodGroup === bloodGroup);
            if (currentItem) {
              setUnitsAvailable(currentItem.unitsAvailable);
            }
            setShowOverrideModal(true);
          }}
        >
          <img src="/images/add_icon.png" alt="Override" style={{ width: '22px', height: '22px' }} />
          Manual Stock Override
        </button>
      </div>

      <div className="card" style={{ width: '100%' }}>
        <h2 className="form-title">Live Stock Visualizer (Hanging Rack)</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '20px' }}>
          Visual blood bags display units relative to storage capacity (Max: 30 units). Shortages are marked automatically.
        </p>
        
        <div className="blood-rack" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '40px 20px' }}>
          {inventory.map((item) => {
            const isLow = item.unitsAvailable < 6;
            // Calculate liquid height percentage (cap at 100%)
            const liquidHeight = Math.min(100, (item.unitsAvailable / 30) * 100);
            return (
              <div key={item._id} className="blood-bag-container">
                <div className="blood-bag-hanger" />
                <div className={`blood-bag ${isLow ? 'shortage' : ''}`} style={{ width: '100px', height: '146px' }}>
                  <div className="blood-type-label">{item.bloodGroup}</div>
                  <div 
                    className="blood-liquid" 
                    style={{ height: `${liquidHeight}%` }}
                  >
                    {liquidHeight > 15 && <div className="blood-wave" />}
                  </div>
                </div>
                <div className="blood-bag-volume">{item.unitsAvailable} Units</div>
                <div 
                  className={`blood-bag-status ${isLow ? 'badge-stock-low' : ''}`} 
                  style={{ 
                    color: isLow ? 'var(--danger-color)' : 'var(--success-color)',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: isLow ? '2px 8px' : '0',
                    borderRadius: '50px'
                  }}
                >
                  {isLow ? '⚠️ Shortage' : '✅ Safe'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ⚙️ Manual Override Modal */}
      {showOverrideModal && (
        <div className="modal-backdrop">
          <div className="modal-card modal-form-card">
            <h2 className="form-title">Manual Stock Override</h2>
            <form onSubmit={handleManualUpdate} style={{ width: '100%', padding: 0, boxShadow: 'none', background: 'transparent' }}>
              <div className="form-group">
                <label>Blood Group</label>
                <select 
                  value={bloodGroup} 
                  onChange={(e) => {
                    setBloodGroup(e.target.value);
                    const currentItem = inventory.find(i => i.bloodGroup === e.target.value);
                    if (currentItem) {
                      setUnitsAvailable(currentItem.unitsAvailable);
                    }
                  }}
                >
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
                <label>Units Available</label>
                <input 
                  type="number" 
                  min="0" 
                  value={unitsAvailable} 
                  onChange={(e) => setUnitsAvailable(parseInt(e.target.value) || 0)} 
                  required 
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowOverrideModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Updating...' : 'Set Stock Level'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryManagement;
