/**
* A requirement for the Homework 1 is to add your own mock data
* to the users and playlists arrays.
* DO NOT modify or edit the functions within this file in any way.
* The funcations provide all the necessary logic to implement
* the required API endpoints which should correctly interface
* with this mock database.
*/
const User = {
    users: [
        // add at least 1 mock user that matches the outlined requirements
        { username: 'testuser', password: 'password123', registrationDate: Date.now(), _id: 1 },
        { username: 'meta', password: 'knight', registrationDate: Date.now(), _id: 2 }

    ],
    /**
    * Finds a single user by a given key/value pair.
    *
    * @param {string} key The property to search by ('_id', 'username')
    * @param {any} value The value to match against
    * @returns {object|undefined} The found user object or undefined if not found
    */
    find(key, value) {
        return this.users.find((user) => user[key] === value);
    },
    /**
    * Adds a new user to the mock mock database
    *
    * @param {object} user The user object to add, without an '_id'
    * @returns {object} The newly created user object with an '_id'
    */
    add(user) {
        const addUser = { ...user, _id: this.users.length + 1 };
        this.users.push(addUser);
        return addUser;
    }
};
const Playlist = {
    playlists: [
        // add at least 1 mock playlist that matches the outlined requirements
        {
            _id: 1, user_id: 1, title: 'My Favorite Tracks',
            tracks: [{ mbid: 'track1', track: 'Track 1', artist: 'Artist 1', album: 'First album', image: 'url' }]
        },
        {
            _id: 2, user_id: 2, title: 'Chill Vibes',
            tracks: [{ mbid: 'track2', track: 'Track 2', artist: 'Artist 2', album: 'Second album', image: 'url' }]
        }
    ],
    /**
    * Finds a single playlist by a given key/value pair
    *
    * @param {string} key The property to search by ('_id', 'user_id').
    * @param {any} value The value to match against
    * @returns {object|undefined} The found playlist object or undefined if not
    found
    */
    find(key, value) {
        return this.playlists.find((playlist) => playlist[key] === value);
    },
    /**
    * Finds a user and return an array of their associated playlists
    *
    * @param {number} userId The ID of the user to find
    * @returns {object} The user object with an added 'playlists' array
    */
    populate(userId) {
        const user = User.find('_id', userId);
        const playlists = this.playlists.filter((playlist) => playlist.user_id ===
            userId);
        return { ...user, playlists };
    },
    /**
    * Add a new playlist to the mock database.
    * @param {object} data The playlist data to add ('title' and 'tracks')
    * @returns {object} The newly created playlist object with a generated '_id'
    */
    insert(data) {
        const _id = this.playlists.length + 1;
        const playlist = { _id, ...data };
        this.playlists.push(playlist);
        return playlist;
    },
    /**
    * Adds a track to a playlist's `tracks` array if a track with the same `mbid`
    doesn't already exist.
    * @param {number} id The '_id' of the playlist to update.
    * @param {object} track The track object to add.
    * @returns {object} The updated playlist object. Throws a TypeError if the
    playlist is not found.
    */
    addToSet(id, track) {
        const playlist = this.find('_id', id);
        const exists = playlist.tracks.some((g) => g.mbid === track.mbid);
        if (!exists) {
            playlist.tracks.push(track);
        }
        return playlist;
    },
    /**
    * Remove a playlist from the mock database.
    *
    * @param {number} id The '_id' of the playlist to remove
    * @returns {object} An object indicating the intended success of the operation
    and the targeted '_id'
    */
    delete(id) {
        this.playlists = this.playlists.filter((p) => p._id !== id);
        return { success: true, _id: id };
    }
};
export { User, Playlist };