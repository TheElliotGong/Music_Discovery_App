import React, { useState } from 'react';
import './PlaylistList.css';

function PlaylistList({ playlists, selectedPlaylist, onSelect, onCreate, onRename, onDelete, loading }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    setError('');

    try {
      await onCreate(newTitle);
      setNewTitle('');
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="playlist-list">
      <div className="playlist-header">
        <h2>My Playlists</h2>
        <button
          className="btn-create"
          onClick={() => setShowCreateForm(!showCreateForm)}
          title="Create new playlist"
        >
          +
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="create-form">
          {error && <div className="error-text">{error}</div>}
          <input
            type="text"
            placeholder="Playlist name..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
          <div className="form-actions">
            <button type="submit" disabled={creating} className="btn-save">
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setError('');
                setNewTitle('');
              }}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading playlists...</div>
      ) : playlists.length === 0 ? (
        <div className="empty-playlists">
          <p>No playlists yet</p>
          <p>Create one to get started!</p>
        </div>
      ) : (
        <ul className="playlists">
          {playlists.map((playlist) => (
            <li
              key={playlist._id}
              className={`playlist-item ${
                selectedPlaylist?._id === playlist._id ? 'active' : ''
              }`}
            >
              <div className="playlist-info" onClick={() => onSelect(playlist)}>
                <span className="playlist-title">{playlist.title}</span>
                <span className="track-count">{playlist.tracks.length} tracks</span>
              </div>
              <div className="playlist-actions">
                <button
                  className="btn-rename"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const proposed = window.prompt('Rename playlist', playlist.title);
                    if (!proposed) return;
                    const trimmed = proposed.trim();
                    if (!trimmed || trimmed === playlist.title) return;
                    try {
                      await onRename(playlist._id, trimmed);
                    } catch (err) {
                      setError(err.message);
                    }
                  }}
                  title="Rename playlist"
                >
                  ✏️
                </button>
                <button
                  className="btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${playlist.title}"?`)) {
                      onDelete(playlist._id);
                    }
                  }}
                  title="Delete playlist"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlaylistList;
