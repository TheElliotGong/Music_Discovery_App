import React, { useState } from 'react';
import api from '../services/api';
import './TrackSearch.css';

function TrackSearch({ onAddTrack, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const data = await api.searchTracks(query, true);
      setResults(data);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (track) => {
    onAddTrack({
      name: track.name,
      artist: track.artist,
      url: track.url,

      mbid: track.mbid,
      image: track.image || 'N/A',
    });
  };

  return (
    <div className="track-search-overlay">
      <div className="track-search-modal">
        <div className="modal-header">
          <h3>Search for Tracks</h3>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for a song or artist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="search-results">
          {loading ? (
            <div className="loading">Searching Last.fm...</div>
          ) : searched && results.length === 0 ? (
            <div className="no-results">
              <p>No tracks found</p>
              <p>Try a different search term</p>
            </div>
          ) : (
            results.map((track, index) => (
              <div key={index} className="search-result-item">
                {track.image && (
                  <a href={track.url} target="_blank" rel="noopener noreferrer"><img
                    src={track.image}
                    alt={track.name}
                    className="result-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  /></a>
                )}
                <div className="result-info">
                  <div className="result-name">{track.name}</div>
                  <div className="result-artist">{track.artist}</div>
                  {track.album && <div className="result-album">{track.album}</div>}
                </div>
                <button
                  onClick={() => handleAdd(track)}
                  className="btn-add"
                  title="Add to playlist"
                >
                  + Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TrackSearch;
