import { Schema, model } from 'mongoose';

const RecordSchema = new Schema({
  prevEventsPlayed: Number,
  prevYearSalary: Number,
  prevTourWins: Number,
  currEventsPlayed: Number,
  currTourWins: Number
})
  
const PlayerSchema = new Schema({
  id: String,
  name: String,
  points: Number,
  isInTop60: Boolean,
  records: RecordSchema,
});

const Player = model('Player', PlayerSchema)

export default Player;
