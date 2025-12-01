import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, User as UserIcon, Lock, Truck, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import OrderTracking from './OrderTracking';

function Profile() {
  const { user, isLoggedIn, token, login } = useAuth();
  const sanitize = (value) => (value ? value.split('•')[0].trim() : '');
  const displayName = sanitize(user?.name) || 'User';
  const displayEmail = sanitize(user?.email) || '';
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: displayName,
    email: displayEmail,
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setEditedUser({
      name: displayName,
      email: displayEmail,
      phone: user?.phone || '',
      address: user?.address || '',
    });
  }, [displayName, displayEmail, user?.phone, user?.address]);

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  const handleSaveProfile = async () => {
    setSaveError(null);
    setIsSaving(true);
    try {
      const payload = {
        name: editedUser.name.trim(),
        email: editedUser.email.trim(),
        phone_number: editedUser.phone?.trim() || null,
        address: editedUser.address?.trim() || null,
      };
      const response = await userService.updateProfile(payload, token);
      const updatedUser = response.user; // Extract the user object from the response

      // Refresh auth context with latest user data
      login(
        {
          ...user,
          ...updatedUser,
          name: sanitize(updatedUser?.name) || payload.name,
          email: sanitize(updatedUser?.email) || payload.email,
          phone: updatedUser?.phone || updatedUser?.phone_number || payload.phone_number,
          address: updatedUser?.address || payload.address
        },
        token
      );
      setIsEditing(false);
    } catch (error) {
      setSaveError(error.message || 'Failed to update profile. Please try again.');
      console.error('Profile update failed', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedUser({
      name: displayName,
      email: displayEmail,
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    try {
      // API call to change password
      await userService.changePassword(
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        token
      );
      alert('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change failed:', error);
      alert(error.message || 'Failed to change password. Please try again.');
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-4 rounded-2xl border border-blue-50 bg-white/80 p-4 shadow-sm shadow-blue-50">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
          <p className="text-sm text-slate-600">Manage your personal details</p>
        </div>
        {saveError && <p className="text-sm font-semibold text-red-600">{saveError}</p>}
        {!isEditing ? (
          <button
            className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-md"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-blue-50 transition hover:border-blue-200"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
            <button
              className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-md disabled:opacity-70"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-800">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={editedUser.name}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-blue-100 bg-white/70 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{user?.name || 'Not provided'}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-800">Email Address</label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={editedUser.email}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none cursor-not-allowed"
            />
          ) : (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{user?.email || 'Not provided'}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-800">Phone Number</label>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={editedUser.phone}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-blue-100 bg-white/70 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number"
            />
          ) : (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{user?.phone || 'Not provided'}</p>
          )}
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-semibold text-slate-800">Address</label>
          {isEditing ? (
            <textarea
              name="address"
              value={editedUser.address}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-blue-100 bg-white/70 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your address"
              rows="3"
            />
          ) : (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{user?.address || 'Not provided'}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-4 rounded-2xl border border-blue-50 bg-white/80 p-4 shadow-sm shadow-blue-50">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Account Security</h2>
          <p className="text-sm text-slate-600">Manage your password and security settings</p>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-500" />
            <p className="text-sm font-semibold text-slate-800">Password</p>
          </div>
          <button
            className="text-sm font-semibold text-blue-500 hover:text-blue-600"
            onClick={() => setShowPasswordModal(true)}
          >
            Change Password
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500">••••••••</p>
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-blue-50 ring-1 ring-blue-50">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-500 text-lg font-bold text-white shadow-lg shadow-blue-200">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
          <p className="text-sm text-slate-600">{displayEmail}</p>
        </div>
        <div className="ml-auto hidden items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-500 sm:inline-flex">
          <ShieldCheck className="h-4 w-4" />
          Verified
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'personal'
              ? 'bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-md shadow-blue-200'
              : 'bg-white/80 text-slate-700 ring-1 ring-blue-100 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('personal')}
        >
          <UserIcon className="h-4 w-4" />
          Personal Info
        </button>
        <button
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'security'
              ? 'bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-md shadow-blue-200'
              : 'bg-white/80 text-slate-700 ring-1 ring-blue-100 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('security')}
        >
          <Lock className="h-4 w-4" />
          Security
        </button>
        <button
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'tracking'
              ? 'bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-md shadow-blue-200'
              : 'bg-white/80 text-slate-700 ring-1 ring-blue-100 hover:text-blue-600'
          }`}
          onClick={() => setActiveTab('tracking')}
        >
          <Truck className="h-4 w-4" />
          Order Tracking
        </button>
      </div>

      <div>{renderTabContent()}</div>

      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur"
          onClick={() => setShowPasswordModal(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl shadow-blue-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100"
                onClick={() => setShowPasswordModal(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-800">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className="w-full rounded-xl border border-blue-100 bg-white/70 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-800">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength="6"
                  className="w-full rounded-xl border border-blue-100 bg-white/70 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-800">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  minLength="6"
                  className="w-full rounded-xl border border-blue-100 bg-white/70 px-3 py-2 text-sm text-slate-800 outline-none ring-blue-100 transition focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-blue-50 transition hover:border-blue-200"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:translate-y-[-1px] hover:shadow-md"
                >
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
