const API_BASE = '';

const api = {
  // User authentication
  register: async (username, password) => {
    const response = await fetch('/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  },

  login: async (username, password) => {
    const response = await fetch('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  },

  editProfile: async (token, userId, updates) => {
    const response = await fetch(`/users/edit/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  // Playlists
  getPlaylists: async (token) => {
    const response = await fetch('/playlists', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  createPlaylist: async (token, title) => {
    const response = await fetch('/playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });
    return handleResponse(response);
  },

  addTrackToPlaylist: async (token, playlistId, track) => {
    const response = await fetch(`/playlists/${playlistId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(track),
    });
    return handleResponse(response);
  },
  renamePlaylist: async (token, playlistId, newTitle) => {
    const response = await fetch(`/playlists/rename/${playlistId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ newTitle }),
    });
    return handleResponse(response);
  },
  deletePlaylist: async (token, playlistId) => {
    const response = await fetch(`/playlists/${playlistId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  removeTrackFromPlaylist: async (token, playlistId, mbid) => {
    const response = await fetch(`/playlists/track/${playlistId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ mbid }),
    });
    return handleResponse(response);
  },

  // Track search
  searchTracks: async (query, fuzzy = true) => {
    const params = new URLSearchParams({ track: query, fuzzy: fuzzy.toString() });
    const response = await fetch(`/tracks/search?${params}`);
    return handleResponse(response);
  },
};

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export default api;
