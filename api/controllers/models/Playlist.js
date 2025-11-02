const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();
let PlaylistModel = {};
// Define profile schema
const trackSchema = new mongoose.Schema({
  track: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String, default: '' },
  mbid: { type: String, required: true, index: true },
  image: { type: String, default: '' },
});

const PlaylistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    set: setName,
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
PlaylistSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true,
})
// Hep store profile in redis
// ProfileSchema.statics.toAPI = (doc) => ({
//   name: doc.name,
//   _id: doc._id,
// });
// Authenticate profile when needed
PlaylistSchema.statics.authenticate = async (title, callback) => {
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

PlaylistModel = mongoose.model('Playlist', PlaylistSchema);
module.exports = PlaylistModel;
