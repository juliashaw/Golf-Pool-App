import { Schema, model } from 'mongoose';

const LeaderboardEntrySchema = new Schema({
  player: { type: Schema.Types.ObjectId, ref: 'Player' },
  position: String,
  total: String,
});

const TournamentSchema = new Schema({
  id: String,
  name: String,
  dateStart: String,
  dateEnd: String,
  doublePoints: Boolean,
  message: String,
  leaderboard: [LeaderboardEntrySchema],
});

const Tournament = model('Tournament', TournamentSchema)

export default Tournament

