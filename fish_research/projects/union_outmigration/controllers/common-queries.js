const UnionOutmigration = require('../models/Union_Outmigration');

function parseDateRange(query) {
  // Returns { filter, startDateISO, endDateISO }
  const { startDate: qsStart, endDate: qsEnd } = query || {};
  let start = null;
  let end = null;

  function parseLocalDateString(ymd) {
    // expect 'YYYY-MM-DD'
    if (!ymd || typeof ymd !== 'string') return null;
    const parts = ymd.split('-').map((p) => parseInt(p, 10));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n)))
      return null;
    const [y, m, d] = parts;
    return new Date(y, m - 1, d);
  }

  if (qsStart) {
    const s = parseLocalDateString(qsStart);
    if (s) {
      s.setHours(0, 0, 0, 0);
      start = s;
    }
  }
  if (qsEnd) {
    const e = parseLocalDateString(qsEnd);
    if (e) {
      e.setHours(23, 59, 59, 999);
      end = e;
    }
  }

  // If neither provided, default to past 30 days (inclusive of today)
  if (!start && !end) {
    const today = new Date();
    end = new Date(today);
    end.setHours(23, 59, 59, 999);
    start = new Date(end);
    start.setDate(start.getDate() - 29); // 30-day window including today
    start.setHours(0, 0, 0, 0);
  }

  // If only start provided, set end to end of start day
  if (start && !end) {
    end = new Date(start);
    end.setHours(23, 59, 59, 999);
  }

  // If only end provided, set start to 29 days before end
  if (end && !start) {
    start = new Date(end);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  }

  const filter = { Date: { $gte: start, $lte: end } };

  // ISO date strings for form inputs (YYYY-MM-DD)
  function toLocalYYYYMMDD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const startDateISO = toLocalYYYYMMDD(start);
  const endDateISO = toLocalYYYYMMDD(end);

  return { filter, startDateISO, endDateISO };
}

exports.renderCommonQueries = async (req, res) => {
  try {
    const { filter, startDateISO, endDateISO } = parseDateRange(
      req.query,
    );

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
    // Select fields with spaces using an object projection (string form splits on spaces)
    const dnaRecords = await UnionOutmigration.find({
      ...filter,
      'Chum DNA Taken': { $gt: 0 },
    })
      .select({ Date: 1, 'Chum DNA Taken': 1, 'Chum DNA IDs': 1 })
      .exec();

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
      trapNotFishingDates,
      query: { startDate: startDateISO, endDate: endDateISO },
    });
  } catch (err) {
    console.error('Error in common queries controller:', err);
    res.status(500).send('Internal server error');
  }
};
