import mongoose from 'mongoose';

export interface IUser {
  username: string;
  password: string;
  registrationDate?: number;
}

// Define user schema
const userSchema = new mongoose.Schema<IUser>(
  {
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
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        const { password, ...result } = ret as { password?: unknown };
        return result;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        const { password, ...result } = ret as { password?: unknown };
        return result;
      },
    },
  }
);

// Enable virtual field for user's playlists
userSchema.virtual('playlists', {
  ref: 'Playlist',
  localField: '_id',
  foreignField: 'user_id',
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;