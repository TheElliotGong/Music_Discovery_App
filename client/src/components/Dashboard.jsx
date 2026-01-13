import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PlaylistList from './PlaylistList';
import TrackSearch from './TrackSearch';
import PlaylistView from './PlaylistView';
import './Dashboard.css';

function Dashboard() {
  const { user, logout, token } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

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

  const handleAddTrack = async (track) => {
    if (!selectedPlaylist) {
      setError('Please select a playlist first');
      return;
    }

    try {
      const updated = await api.addTrackToPlaylist(token, selectedPlaylist._id, track);
      setPlaylists(playlists.map((p) => (p._id === updated._id ? updated : p)));
      setSelectedPlaylist(updated);
      setShowSearch(false);
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

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🎵 Music Discovery</h1>
        <div className="user-info">
          <span>Welcome, {user.username}!</span>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

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
