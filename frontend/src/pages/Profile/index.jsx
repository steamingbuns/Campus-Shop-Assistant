import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import OrderTracking from './OrderTracking';
import './Profile.css';

function Profile() {
  const { user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      // TODO: API call to update user profile
      console.log('Saving profile:', editedUser);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setEditedUser({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    // TODO: API call to change password
    console.log('Changing password');
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const renderPersonalInfo = () => (
    <div className="profile-section">
      <div className="section-header">
        <div>
          <h2>Personal Information</h2>
          <p className="section-subtitle">Manage your personal details</p>
        </div>
        {!isEditing ? (
          <button className="btn-edit" onClick={handleEditToggle}>
            Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button className="btn-cancel" onClick={handleCancelEdit}>
              Cancel
            </button>
            <button className="btn-save" onClick={handleEditToggle}>
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="profile-info-grid">
        <div className="info-item">
          <label>Full Name</label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={editedUser.name}
              onChange={handleInputChange}
              className="input-field"
            />
          ) : (
            <p>{user?.name || 'Not provided'}</p>
          )}
        </div>

        <div className="info-item">
          <label>Email Address</label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={editedUser.email}
              onChange={handleInputChange}
              className="input-field"
            />
          ) : (
            <p>{user?.email || 'Not provided'}</p>
          )}
        </div>

        <div className="info-item">
          <label>Phone Number</label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={editedUser.phone}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter phone number"
            />
          ) : (
            <p>{user?.phone || 'Not provided'}</p>
          )}
        </div>

        <div className="info-item full-width">
          <label>Address</label>
          {isEditing ? (
            <textarea
              name="address"
              value={editedUser.address}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter your address"
              rows="3"
            />
          ) : (
            <p>{user?.address || 'Not provided'}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="profile-section">
      <div className="section-header">
        <div>
          <h2>Account Security</h2>
          <p className="section-subtitle">Manage your password and security settings</p>
        </div>
      </div>

      <div className="security-info">
        <div className="info-item">
          <label>Password</label>
          <div className="password-field">
            <p>••••••••</p>
            <button 
              className="btn-change-password" 
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrderTracking = () => <OrderTracking />;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo();
      case 'security':
        return renderSecurity();
      case 'tracking':
        return renderOrderTracking();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className="profile-dashboard">
      <div className="dashboard-container">
        <div className="profile-header-section">
          <div className="profile-avatar-large">
            <div className="avatar-circle">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <div>
            <h1 className="dashboard-title">{user?.name || 'User'}</h1>
            <p className="dashboard-subtitle">{user?.email || ''} • {user?.role || 'Student'}</p>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button
            className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <span className="tab-icon">👤</span>
            Personal Info
          </button>
          <button
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span className="tab-icon">🔒</span>
            Security
          </button>
          <button
            className={`tab-button ${activeTab === 'tracking' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracking')}
          >
            <span className="tab-icon">🚚</span>
            Order Tracking
          </button>
        </div>

        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                  minLength="6"
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                  minLength="6"
                  className="input-field"
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
