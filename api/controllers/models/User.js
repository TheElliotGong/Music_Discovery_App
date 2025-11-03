import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
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
const UserSchema = new mongoose.Schema({
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
  playlists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Playlist',
    }
  ],

  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Converts a doc to something we can store in redis later on.
// UserSchema.statics.toAPI = (doc) => ({
//   username: doc.username,
//   _id: doc._id,
// });

// Helper function to hash a password
UserSchema.statics.generateHash = (password) => bcrypt.hash(password, saltRounds);

/* Helper function for authenticating a password against one already in the
   database. Essentially when a user logs in, we need to verify that the password
   they entered matches the one in the database. Since the database stores hashed
   passwords, we need to get the hash they have stored. We then pass the given password
   and hashed password to bcrypt's compare function. The compare function hashes the
   given password the same number of times as the stored password and compares the result.
*/
UserSchema.statics.authenticate = async (username, password, callback) => {
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

const User = mongoose.model('User', UserSchema);
export default User;
