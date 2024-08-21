import { Schema, model } from 'mongoose';

const TeamSchema = new Schema({
  name: String,
  totalPoints: Number,
  players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
});

const Team = model('Team', TeamSchema);

export default Team