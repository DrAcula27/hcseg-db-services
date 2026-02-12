const UnionOutmigration = require('../models/Union_Outmigration');

function parseDateRange(query) {
  let { startDate, endDate } = query;
  let match = {};
  if (startDate) {
    const s = new Date(startDate);
    if (!isNaN(s)) match.$gte = s;
  }
  if (endDate) {
    const e = new Date(endDate);
    if (!isNaN(e)) {
      // include end of day
      e.setHours(23, 59, 59, 999);
      match.$lte = e;
    }
  }
  return Object.keys(match).length ? { Date: match } : {};
}

exports.renderCommonQueries = async (req, res) => {
  try {
    const filter = parseDateRange(req.query);

    // Build aggregation pipeline
    const pipeline = [{ $match: filter }];

    // Group to calculate sums
    pipeline.push({
      $group: {
        _id: null,
        totalChum: { $sum: '$Chum Fry' },
        totalChumMorts: { $sum: '$Chum Fry Mort' },
        totalChumMarked: { $sum: '$Chum Marked' },
        totalChumRecap: { $sum: '$Chum Recap' },
        totalChumRecapMort: { $sum: '$Chum Recap Mort' },
        totalSteelheadMarked: { $sum: '$Steelhead Marked' },
        totalSteelheadRecap: { $sum: '$Steelhead Recap' },
        totalCohoSmoltMarked: { $sum: '$Coho Smolt Marked' },
        totalCohoSmoltRecap: { $sum: '$Coho Smolt Recap' },
        totalChumDnaTaken: { $sum: '$Chum DNA Taken' },
        totalCohoFry: { $sum: '$Coho Fry' },
        totalCohoSmolt: { $sum: '$Coho Smolt' },
        totalCohoParr: { $sum: '$Coho Parr' },
        totalSteelhead: { $sum: '$Steelhead' },
        totalCutthroat: { $sum: '$Cutthroat' },
        totalChinook: { $sum: '$Chinook' },
        totalSculpin: { $sum: '$Sculpin' },
        totalLamprey: { $sum: '$Lamprey' },
        trapNotFishingCount: {
          $sum: {
            $cond: [{ $eq: ['$Trap Operating', 'N'] }, 1, 0],
          },
        },
      },
    });

    const aggResults =
      await UnionOutmigration.aggregate(pipeline).allowDiskUse(true);
    const totals = (aggResults && aggResults[0]) || {};

    // Find records with DNA samples for the date range
    const dnaRecords = await UnionOutmigration.find({
      ...filter,
      'Chum DNA Taken': { $gt: 0 },
    }).select('Date Chum DNA Taken Chum DNA IDs');

    // Other species breakdown (explicit per-species sums returned in totals)

    // Stained heuristic: comments containing 'stain'
    const stainedMatch = {
      ...filter,
      Comments: { $regex: /stain/i },
    };
    const stainedAgg = await UnionOutmigration.aggregate([
      { $match: stainedMatch },
      {
        $group: {
          _id: null,
          stainedChum: { $sum: '$Chum Fry' },
          stainedChumMorts: { $sum: '$Chum Fry Mort' },
        },
      },
    ]);

    const stained = (stainedAgg && stainedAgg[0]) || {
      stainedChum: 0,
      stainedChumMorts: 0,
    };

    // Trap not fishing dates (list)
    const trapNotFishingDocs = await UnionOutmigration.find({
      ...filter,
      'Trap Operating': 'N',
    }).select('Date');

    const trapNotFishingDates = trapNotFishingDocs
      .map((d) => d.Date)
      .filter(Boolean);

    res.render('union_outmigration/views/common-queries', {
      user: req.user,
      totals,
      dnaRecords,
      stained,
      trapNotFishingDates,
      query: req.query,
    });
  } catch (err) {
    console.error('Error in common queries controller:', err);
    res.status(500).send('Internal server error');
  }
};
