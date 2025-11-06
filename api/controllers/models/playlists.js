import mongoose from 'mongoose';

// Define profile schema
const trackSchema = new mongoose.Schema({
  track: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String, default: '' },
  mbid: { type: String, required: true, index: true },
  image: { type: String, default: '' },
});

const playlistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,

  },
  // Store embedded track metadata retrieved from Last.fm
  tracks: {
    type: [trackSchema],
    required: true,
    default: []
  },
  user_id: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User',
  },

});

playlistSchema.statics.authenticate = async (title, callback) => {
  try {
    const doc = await PlaylistModel.findOne({ title }).exec();
    if (!doc) {
      return callback();
    }
    return callback(null, doc);
  } catch (err) {
    return callback(err);
  }
};

const Playlist = mongoose.model('Playlist', playlistSchema);
export default Playlist;