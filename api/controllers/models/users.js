import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { use } from 'react';
/* When generating a password hash, bcrypt (and most other password hash
   functions) use a "salt". The salt is simply extra data that gets hashed
   along with the password. The addition of the salt makes it more difficult
   for people to decrypt the passwords stored in our database. saltRounds
   essentially defines the number of times we will hash the password and salt.
*/
const saltRounds = 10;


/* Our schema defines the data we will store. A username (string of alphanumeric
   characters), a password (actually the hashed version of the password created
   by bcrypt), the playlists belonging to the player, and the created date.
*/
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    match: /^[A-Za-z0-9_\-.]{1,16}$/,
  },
  password: {
    type: String,
    required: true,
  },

  registrationDate: {
    type: Date,
    default: Date.now,
  },
});
//Enable virtual field for user's playlists
userSchema.virtual('playlists', {
  ref: 'Playlist', // The model to use
  localField: '_id', // field in User
  foreignField: 'user_id', // field in Playlist that refers to User
});
// Ensure virtual fields are serialised and prevent password from being printed
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});
userSchema.set('toObject', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

// Helper function to hash a password
userSchema.statics.generateHash = (password) => bcrypt.hash(password, saltRounds);

/* Helper function for authenticating a password against one already in the
   database. Essentially when a user logs in, we need to verify that the password
   they entered matches the one in the database. Since the database stores hashed
   passwords, we need to get the hash they have stored. We then pass the given password
   and hashed password to bcrypt's compare function. The compare function hashes the
   given password the same number of times as the stored password and compares the result.
*/
userSchema.statics.authenticate = async (username, password, callback) => {
  try {
    const doc = await UserModel.findOne({ username }).exec();
    if (!doc) {
      return callback();
    }

    const match = await bcrypt.compare(password, doc.password);
    if (match) {
      return callback(null, doc);
    }
    return callback();
  } catch (err) {
    return callback(err);
  }
};

const User = mongoose.model('User', userSchema);
export default User;
