import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PlaylistList from './PlaylistList';
import TrackSearch from './TrackSearch';
import PlaylistView from './PlaylistView';
import './Dashboard.css';

function Dashboard() {
  const { user, logout, token, updateProfile } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editUsername, setEditUsername] = useState(user.username);
  const [editPassword, setEditPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  useEffect(() => {
    setEditUsername(user.username);
  }, [user.username]);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const data = await api.getPlaylists(token);
      setPlaylists(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (title) => {
    try {
      const newPlaylist = await api.createPlaylist(token, title);
      setPlaylists([newPlaylist, ...playlists]);
      return newPlaylist;
    } catch (err) {
      throw err;
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await api.deletePlaylist(token, playlistId);
      setPlaylists(playlists.filter((p) => p._id !== playlistId));
      if (selectedPlaylist?._id === playlistId) {
        setSelectedPlaylist(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRenamePlaylist = async (playlistId, newTitle) => {
    try {
      const updated = await api.renamePlaylist(token, playlistId, newTitle);
      setPlaylists(playlists.map((p) => (p._id === updated._id ? updated : p)));
      if (selectedPlaylist?._id === playlistId) {
        setSelectedPlaylist(updated);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddTrack = async (track) => {
    if (!selectedPlaylist) {
      setError('Please select a playlist first');
      return;
    }

    try {
      const updated = await api.addTrackToPlaylist(token, selectedPlaylist._id, track);
      setPlaylists(playlists.map((p) => (p._id === updated._id ? updated : p)));
      setSelectedPlaylist(updated);
      // setShowSearch(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveTrack = async (mbid) => {
    if (!selectedPlaylist) return;

    try {
      const updated = await api.removeTrackFromPlaylist(
        token,
        selectedPlaylist._id,
        mbid
      );
      setPlaylists(playlists.map((p) => (p._id === updated._id ? updated : p)));
      setSelectedPlaylist(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setError('');
    const updates = {};
    const trimmedUsername = editUsername.trim();
    if (trimmedUsername && trimmedUsername !== user.username) {
      updates.username = trimmedUsername;
    }
    if (editPassword.trim()) {
      updates.password = editPassword;
    }
    if (!Object.keys(updates).length) {
      setProfileMessage('No changes to save.');
      return;
    }
    try {
      setSavingProfile(true);
      await updateProfile(updates);
      setProfileMessage('Profile updated successfully.');
      setShowEditProfile(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
      setEditPassword('');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🎵 Music Discovery</h1>
        <div className="user-info">
          <span>Welcome, {user.username}!</span>
          <button
            onClick={() => {
              setShowEditProfile(true);
              setProfileMessage('');
            }}
            className="btn-edit-profile"
            title="Edit profile"
          >
            Edit Profile
          </button>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {showEditProfile && (
        <div
          className="edit-profile-backdrop"
          onClick={() => {
            setShowEditProfile(false);
            setProfileMessage('');
            setEditPassword('');
          }}
        >
          <div
            className="edit-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Edit Profile</h3>
            {profileMessage && (
              <div className="edit-profile-message">{profileMessage}</div>
            )}
            <form onSubmit={handleEditProfile}>
              <label>
                Username
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                />
              </label>
              <label>
                New Password (optional)
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                />
              </label>
              <div className="edit-profile-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowEditProfile(false);
                    setProfileMessage('');
                    setEditPassword('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="dashboard-content">
        <aside className="sidebar">
          <PlaylistList
            playlists={playlists}
            selectedPlaylist={selectedPlaylist}
            onSelect={setSelectedPlaylist}
            onCreate={handleCreatePlaylist}
            onRename={handleRenamePlaylist}
            onDelete={handleDeletePlaylist}
            loading={loading}
          />
        </aside>

        <main className="main-content">
          {selectedPlaylist ? (
            <>
              <PlaylistView
                playlist={selectedPlaylist}
                onRemoveTrack={handleRemoveTrack}
                onAddTrack={() => setShowSearch(true)}
              />
              {showSearch && (
                <TrackSearch
                  onAddTrack={handleAddTrack}
                  onClose={() => setShowSearch(false)}
                />
              )}
            </>
          ) : (
            <div className="empty-state">
              <h2>Welcome to Music Discovery! 🎶</h2>
              <p>Create or select a playlist to get started</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
