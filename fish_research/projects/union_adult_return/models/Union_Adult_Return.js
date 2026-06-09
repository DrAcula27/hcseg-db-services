const mongoose = require('mongoose');

const UnionAdultReturnSchema = mongoose.Schema({
  'Submitted By': { type: String },
  Date: { type: Date },
  'Number of Visitors': { type: Number },
  Time: { type: String },
  'Trap Operating': { type: String },
  'Chum Males': { type: Number },
  'Chum Females': { type: Number },
  'Coho Males - Adipose Present': { type: Number },
  'Coho Females - Adipose Present': { type: Number },
  'Coho Males - Adipose Absent': { type: Number },
  'Coho Females - Adipose Absent': { type: Number },
  'Chinook Males - Adipose Present': { type: Number },
  'Chinook Females - Adipose Present': { type: Number },
  'Chinook Males - Adipose Absent': { type: Number },
  'Chinook Females - Adipose Absent': { type: Number },
  'Pink Males': { type: Number },
  'Pink Females': { type: Number },
  Comments: { type: String },
  'Created At': { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  'UnionAdultReturn',
  UnionAdultReturnSchema,
  'Union_Adult_Return',
);
