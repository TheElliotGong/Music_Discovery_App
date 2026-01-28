import mongoose from 'mongoose';

export interface ITrack {
  name: string;
  artist: string;
  url?: string;
  mbid: string;
  image?: string;
}

export interface IPlaylist {
  title: string;
  tracks: ITrack[];
  user_id: mongoose.Types.ObjectId;
}

// Define track schema (embedded, not a model)
const trackSchema = new mongoose.Schema<ITrack>({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  url: { type: String, default: '' },
  mbid: { type: String, required: true, index: true },
  image: { type: String, default: '' },
});

// Define playlist schema
const playlistSchema = new mongoose.Schema<IPlaylist>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Store embedded track subdocuments
    tracks: {
      type: [trackSchema],
      default: [],
    },
    // Reference to the User who owns this playlist
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        const mutable = ret as { _id?: mongoose.Types.ObjectId; id?: string };
        if (mutable._id) {
          mutable.id = mutable._id.toString();
        }
        return mutable;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        const mutable = ret as { _id?: mongoose.Types.ObjectId; id?: string };
        if (mutable._id) {
          mutable.id = mutable._id.toString();
        }
        return mutable;
      },
    },
  }
);

playlistSchema.virtual('id').get(function (this: { _id?: mongoose.Types.ObjectId }) {
  return this._id?.toString();
});

const Playlist = mongoose.model<IPlaylist>('Playlist', playlistSchema);
export default Playlist;