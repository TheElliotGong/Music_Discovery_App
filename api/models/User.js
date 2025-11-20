import mongoose from 'mongoose';
/* When generating a password hash, bcrypt (and most other password hash
   functions) use a "salt". The salt is simply extra data that gets hashed
   along with the password. The addition of the salt makes it more difficult
   for people to decrypt the passwords stored in our database. saltRounds
   essentially defines the number of times we will hash the password and salt.
*/

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
    type: Number,
    default: Date.now(),
  },
}, 
//Schema options
{
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      delete ret.password;
      return ret;
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      }
    }
  }
});
//Enable virtual field for user's playlists
userSchema.virtual('playlists', {
  ref: 'Playlist', // The model to use
  localField: '_id', // field in User
  foreignField: 'user_id', // field in Playlist that refers to User
});



const User = mongoose.model('User', userSchema);
export default User;
