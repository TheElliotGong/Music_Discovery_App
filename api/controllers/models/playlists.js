import mongoose from 'mongoose';

//Define track schema(this won't be a model, just embedded in playlist)
const trackSchema = new mongoose.Schema({
  track: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String, default: '' },
  mbid: { type: String, required: true, index: true },
  image: { type: String, default: '' },
});
//Define playlist schema
const playlistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  // Store embedded track subdocuments
  tracks: {
    type: [trackSchema],
    default: []
  },
  // Reference to the User who owns this playlist
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      return ret;
    }
  }
});


const Playlist = mongoose.model('Playlist', playlistSchema);
export default Playlist;