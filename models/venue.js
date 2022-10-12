const mongoose = require('mongoose')
const Schema = mongoose.Schema

const venueSchema = new Schema({
  name: {type: String, required: true, unique: true },
  type: String,
  year: String,
  capacity: String,
  cost: String,
  nicknames: [String],
  stillExists: Boolean,
  pSport: String,
  pTeam: String,
  sSports: [String],
  sTeams: [String],
  city: String,
  state: String,
  country: String,
  outsideImg: String,
  insideImg: String,
  highlightURL: String,
  links: {
    website: String,
    twitter: String,
    fb: String,
    ig: String,
  }
})

const Venue = mongoose.model('Venue', venueSchema)

module.exports = Venue