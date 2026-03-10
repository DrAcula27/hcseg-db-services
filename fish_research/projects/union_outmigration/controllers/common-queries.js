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

    // -------------------------------------------------------------------------
    // Aggregation: totals across the date range.
    //
    // Historical data (before Dec 1, 2025) and current data (Dec 1, 2025+) have
    // different schemas for several chum fields, so we run two separate pipelines
    // and add the results together.
    //
    // Key schema differences:
    //   Chum Fry         — historical: Chum Fry + Chum Alevin; current: Chum Fry only
    //   Chum Marked Mort — both eras have this field, but it means chum that died
    //                      WHILE BEING STAINED (never released upriver). Counted the
    //                      same way in both schemas; displayed separately from recap morts.
    //   Chum Recap Mort  — current schema has an explicit field; historical data has
    //                      no such field, so it is derived as (Chum Marked - Chum Released).
    // -------------------------------------------------------------------------
    const CURRENT_DATA_CUTOFF = new Date(2025, 11, 1); // Dec 1, 2025 (month is 0-indexed)

    const historicalFilter = {
      ...filter,
      Date: { $gte: filter.Date.$gte, $lt: CURRENT_DATA_CUTOFF },
    };
    const currentFilter = {
      ...filter,
      Date: { $gte: CURRENT_DATA_CUTOFF, $lte: filter.Date.$lte },
    };

    // Only run a sub-pipeline when the date window actually overlaps that era
    const queryStart = filter.Date.$gte;
    const queryEnd = filter.Date.$lte;
    const hasHistorical = queryStart < CURRENT_DATA_CUTOFF;
    const hasCurrent = queryEnd >= CURRENT_DATA_CUTOFF;

    // --- Historical pipeline ---
    // Chum Recap Mort = Chum Marked - Chum Released (per record, then summed)
    const historicalPipeline = [
      { $match: historicalFilter },
      {
        $group: {
          _id: null,
          // Chum Fry + Chum Alevin combined into one "fry" count
          totalChum: {
            $sum: {
              $add: [
                { $ifNull: ['$Chum Fry', 0] },
                { $ifNull: ['$Chum Alevin', 0] },
              ],
            },
          },
          totalChumMorts: { $sum: '$Chum Fry Mort' },
          totalChumMarked: { $sum: '$Chum Marked' },
          // Died while being stained — never released
          totalChumMarkedMort: { $sum: '$Chum Marked Mort' },
          totalChumRecap: { $sum: '$Chum Recap' },
          // Recap mort derived per record: max(Chum Marked - Chum Released, 0)
          // Using $max with 0 guards against any data anomalies where Released > Marked
          totalChumRecapMort: {
            $sum: {
              $max: [
                {
                  $subtract: [
                    { $ifNull: ['$Chum Marked', 0] },
                    { $ifNull: ['$Chum Released', 0] },
                  ],
                },
                0,
              ],
            },
          },
          totalChumDnaTaken: { $sum: '$Chum DNA Taken' },
          // Steelhead/Coho mark-recap fields did not exist in historical schema;
          // $sum of missing fields returns 0.
          totalSteelheadMarked: { $sum: '$Steelhead Marked' },
          totalSteelheadMarkedMort: {
            $sum: '$Steelhead Marked Mort',
          },
          totalSteelheadRecap: { $sum: '$Steelhead Recap' },
          totalSteelheadRecapMort: { $sum: '$Steelhead Recap Mort' },
          totalCohoSmoltMarked: { $sum: '$Coho Smolt Marked' },
          totalCohoSmoltMarkedMort: {
            $sum: '$Coho Smolt Marked Mort',
          },
          totalCohoSmoltRecap: { $sum: '$Coho Smolt Recap' },
          totalCohoSmoltRecapMort: { $sum: '$Coho Smolt Recap Mort' },
          // Other species
          totalCohoFry: { $sum: '$Coho Fry' },
          totalCohoSmolt: { $sum: '$Coho Smolt' },
          totalCohoParr: { $sum: '$Coho Parr' },
          totalSteelhead: { $sum: '$Steelhead' },
          totalCutthroat: { $sum: '$Cutthroat' },
          totalChinook: { $sum: '$Chinook' },
          totalSculpin: { $sum: '$Sculpin' },
          totalLamprey: { $sum: '$Lamprey' },
        },
      },
    ];

    // --- Current pipeline ---
    const currentPipeline = [
      { $match: currentFilter },
      {
        $group: {
          _id: null,
          totalChum: { $sum: '$Chum Fry' },
          totalChumMorts: { $sum: '$Chum Fry Mort' },
          totalChumMarked: { $sum: '$Chum Marked' },
          totalChumMarkedMort: { $sum: '$Chum Marked Mort' },
          totalChumRecap: { $sum: '$Chum Recap' },
          totalChumRecapMort: { $sum: '$Chum Recap Mort' },
          totalChumDnaTaken: { $sum: '$Chum DNA Taken' },
          totalSteelheadMarked: { $sum: '$Steelhead Marked' },
          totalSteelheadMarkedMort: {
            $sum: '$Steelhead Marked Mort',
          },
          totalSteelheadRecap: { $sum: '$Steelhead Recap' },
          totalSteelheadRecapMort: { $sum: '$Steelhead Recap Mort' },
          totalCohoSmoltMarked: { $sum: '$Coho Smolt Marked' },
          totalCohoSmoltMarkedMort: {
            $sum: '$Coho Smolt Marked Mort',
          },
          totalCohoSmoltRecap: { $sum: '$Coho Smolt Recap' },
          totalCohoSmoltRecapMort: { $sum: '$Coho Smolt Recap Mort' },
          totalCohoFry: { $sum: '$Coho Fry' },
          totalCohoSmolt: { $sum: '$Coho Smolt' },
          totalCohoParr: { $sum: '$Coho Parr' },
          totalSteelhead: { $sum: '$Steelhead' },
          totalCutthroat: { $sum: '$Cutthroat' },
          totalChinook: { $sum: '$Chinook' },
          totalSculpin: { $sum: '$Sculpin' },
          totalLamprey: { $sum: '$Lamprey' },
        },
      },
    ];

    const [historicalAgg, currentAgg] = await Promise.all([
      hasHistorical
        ? UnionOutmigration.aggregate(
            historicalPipeline,
          ).allowDiskUse(true)
        : Promise.resolve([]),
      hasCurrent
        ? UnionOutmigration.aggregate(currentPipeline).allowDiskUse(
            true,
          )
        : Promise.resolve([]),
    ]);

    const h = (historicalAgg && historicalAgg[0]) || {};
    const c = (currentAgg && currentAgg[0]) || {};

    // Merge by adding each key from both result objects
    const totalsKeys = [
      'totalChum',
      'totalChumMorts',
      'totalChumMarked',
      'totalChumMarkedMort',
      'totalChumRecap',
      'totalChumRecapMort',
      'totalChumDnaTaken',
      'totalSteelheadMarked',
      'totalSteelheadMarkedMort',
      'totalSteelheadRecap',
      'totalSteelheadRecapMort',
      'totalCohoSmoltMarked',
      'totalCohoSmoltMarkedMort',
      'totalCohoSmoltRecap',
      'totalCohoSmoltRecapMort',
      'totalCohoFry',
      'totalCohoSmolt',
      'totalCohoParr',
      'totalSteelhead',
      'totalCutthroat',
      'totalChinook',
      'totalSculpin',
      'totalLamprey',
    ];
    const totals = {};
    for (const key of totalsKeys) {
      totals[key] = (h[key] || 0) + (c[key] || 0);
    }

    // -------------------------------------------------------------------------
    // DNA records
    // -------------------------------------------------------------------------
    const dnaRecords = await UnionOutmigration.find({
      ...filter,
      'Chum DNA Taken': { $gt: 0 },
    })
      .select({ Date: 1, 'Chum DNA Taken': 1, 'Chum DNA IDs': 1 })
      .sort({ Date: 1 })
      .exec();

    // -------------------------------------------------------------------------
    // Trap not fishing — search Comments field for relevant keywords.
    //
    // Terminology:
    //   "Cone raised"    → trap STOPPED fishing at the time recorded on this doc
    //   "No trap check"  → trap was not checked that day (not fishing)
    //   "Cone lowered"   → trap RESUMED fishing at the time recorded on this doc
    //
    // Strategy:
    //   Historical data (before Dec 1, 2025): only "no trap check" in Comments
    //     indicates the trap was not fishing. Each matching doc is treated as a
    //     standalone not-fishing day. Consecutive days are collapsed into ranges.
    //
    //   Current data (Dec 1, 2025 and later): uses "cone raised" / "cone lowered"
    //     to mark the start and end of a not-fishing period, with "no trap check"
    //     as interior days. Periods are built by walking docs in date order.
    //
    //   When the query window spans both eras, each doc is routed to the
    //   appropriate logic based on its own date.
    // -------------------------------------------------------------------------
    const trapDocs = await UnionOutmigration.find({
      ...filter,
      Comments: { $regex: /no trap check|cone lowered|cone raised/i },
    })
      .select({ Date: 1, Time: 1, Comments: 1 })
      .sort({ Date: 1 })
      .exec();

    // Split docs into historical and current sets
    const historicalTrapDocs = trapDocs.filter(
      (doc) => doc.Date && new Date(doc.Date) < CURRENT_DATA_CUTOFF,
    );
    const currentTrapDocs = trapDocs.filter(
      (doc) => doc.Date && new Date(doc.Date) >= CURRENT_DATA_CUTOFF,
    );

    // --- Historical: collapse consecutive "no trap check" days into ranges ---
    // Each period: { start, startTime: '', end, endTime: '', historical: true }
    const historicalPeriods = [];
    const noCheckDates = historicalTrapDocs
      .filter((doc) => /no trap check/i.test(doc.Comments || ''))
      .map((doc) => new Date(doc.Date))
      .sort((a, b) => a - b);

    if (noCheckDates.length > 0) {
      let rangeStart = noCheckDates[0];
      let rangeEnd = noCheckDates[0];

      for (let i = 1; i < noCheckDates.length; i++) {
        const nextDay = new Date(rangeEnd);
        nextDay.setDate(nextDay.getDate() + 1);
        const curr = noCheckDates[i];

        if (
          curr.getFullYear() === nextDay.getFullYear() &&
          curr.getMonth() === nextDay.getMonth() &&
          curr.getDate() === nextDay.getDate()
        ) {
          rangeEnd = curr;
        } else {
          historicalPeriods.push({
            start: rangeStart,
            startTime: '',
            end: rangeEnd,
            endTime: '',
            historical: true,
          });
          rangeStart = curr;
          rangeEnd = curr;
        }
      }
      historicalPeriods.push({
        start: rangeStart,
        startTime: '',
        end: rangeEnd,
        endTime: '',
        historical: true,
      });
    }

    // --- Current: build periods from cone raised / no trap check / cone lowered ---
    // Each period: { start: Date|null, startTime, end: Date|null, endTime, historical: false }
    const currentPeriods = [];
    let openPeriod = null;

    for (const doc of currentTrapDocs) {
      const comment = doc.Comments || '';
      const date = doc.Date ? new Date(doc.Date) : null;
      const time = doc.Time || '';

      if (/cone raised/i.test(comment)) {
        // Close any previously open period that was never explicitly closed
        if (openPeriod) {
          currentPeriods.push(openPeriod);
        }
        openPeriod = {
          start: date,
          startTime: time,
          end: null,
          endTime: '',
          historical: false,
        };
      } else if (/cone lowered/i.test(comment)) {
        if (openPeriod) {
          openPeriod.end = date;
          openPeriod.endTime = time;
          currentPeriods.push(openPeriod);
          openPeriod = null;
        } else {
          // Cone lowered with no matching raise in this window — period began
          // before the query range.
          currentPeriods.push({
            start: null,
            startTime: '',
            end: date,
            endTime: time,
            historical: false,
          });
        }
      } else if (/no trap check/i.test(comment)) {
        if (!openPeriod) {
          // Stand-alone unchecked day with no preceding cone raise
          openPeriod = {
            start: date,
            startTime: '',
            end: null,
            endTime: '',
            historical: false,
          };
        }
        // If inside an open period the day is already covered — nothing to do.
      }
    }

    // If a period was opened but never closed within the query window, push it
    if (openPeriod) {
      currentPeriods.push(openPeriod);
    }

    // Combine both eras in chronological order
    const trapNotFishingPeriods = [
      ...historicalPeriods,
      ...currentPeriods,
    ];

    res.render('union_outmigration/views/common-queries', {
      user: req.user,
      totals,
      dnaRecords,
      trapNotFishingPeriods,
      query: { startDate: startDateISO, endDate: endDateISO },
    });
  } catch (err) {
    console.error('Error in common queries controller:', err);
    res.status(500).send('Internal server error');
  }
};
