const mongoose = require('mongoose');

const TrapSampleSchema = mongoose.Schema({
  date: { type: Date },
  time: { type: String },
  trapOperating: { type: String },
  rpm: { type: Number },
  debris: { type: String },
  visibility: { type: String },
  flow: { type: String },
  waterTemp: { type: Number },
  hoboTemp: { type: Number },
  chumFry: { type: Number },
  chumFryMort: { type: Number },
  chumAlevin: { type: Number },
  chumDNATaken: { type: Number },
  chumDNAIDs: { type: String },
  chumMarked: { type: Number },
  markedChumReleased: { type: Number },
  markedChumRecap: { type: Number },
  markedChumMort: { type: Number },
  cohoFry: { type: Number },
  cohoParr: { type: Number },
  cohoMarked: { type: Number },
  markedCohoRecap: { type: Number },
  chinookFry: { type: Number },
  chinookParr: { type: Number },
  pinkFry: { type: Number },
  sculpin: { type: Number },
  cutthroat: { type: Number },
  steelhead: { type: Number },
  lamprey: { type: Number },
  stickleback: { type: Number },
  comments: { type: String },
});

const TrapSample = mongoose.model('trap-samples', TrapSampleSchema);

module.exports = TrapSample;
