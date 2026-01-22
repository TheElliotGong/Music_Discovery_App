import React from 'react';
import './PlaylistView.css';

function PlaylistView({ playlist, onRemoveTrack, onAddTrack }) {


  return (
    <div className="playlist-view">
      <div className="playlist-view-header">
        <h2>{playlist.title}</h2>
        <button onClick={onAddTrack} className="btn-add-track">
          + Add Track
        </button>
      </div>

      {playlist.tracks.length === 0 ? (
        <div className="empty-tracks">
          <p>No tracks in this playlist yet</p>
          <p>Click "Add Track" to search and add music</p>
        </div>
      ) : (
        <div className="tracks">
          {playlist.tracks.map((track) => (
            <div key={track._id} className="track-item">
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
              <div className="track-info">
                <div className="track-name">{track.name}</div>
                <div className="track-artist">{track.artist}</div>
                {track.album && <div className="track-album">{track.album}</div>}
              </div>
              <button
                onClick={() => onRemoveTrack(track.mbid)}
                className="btn-remove-track"
                title="Remove track"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlaylistView;
