const UnionAdultReturn = require('../models/Union_Adult_Return');

const speciesDefinitions = [
  {
    key: 'chum',
    label: 'Chum',
    maleFields: ['Chum Males'],
    femaleFields: ['Chum Females'],
  },
  {
    key: 'coho',
    label: 'Coho',
    maleFields: [
      'Coho Males Adipose Unknown',
      'Coho Males Adipose Present',
      'Coho Males Adipose Absent',
    ],
    femaleFields: [
      'Coho Females Adipose Unknown',
      'Coho Females Adipose Present',
      'Coho Females Adipose Absent',
    ],
    unknownFields: [
      'Coho Unknown Adipose Absent',
    ],
  },
  {
    key: 'chinook',
    label: 'Chinook',
    maleFields: [
      'Chinook Males Adipose Unknown',
      'Chinook Males Adipose Present',
      'Chinook Males Adipose Absent',
    ],
    femaleFields: [
      'Chinook Females Adipose Unknown',
      'Chinook Females Adipose Present',
      'Chinook Females Adipose Absent',
    ],
    unknownFields: [
      'Chinook Unknown Adipose Absent',
    ],
  },
  {
    key: 'pink',
    label: 'Pink',
    maleFields: ['Pink Males'],
    femaleFields: ['Pink Females'],
  },
];

function toDateKey(date) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDateLabel(date) {
  const value = new Date(date);
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function sumFieldValues(row, fields) {
  return fields.reduce(
    (sum, field) => sum + (Number(row[field]) || 0),
    0,
  );
}

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
  // Prevent the browser from caching GET responses so that every 'Run'
  // click always fetches fresh data from the server.
  res.set('Cache-Control', 'no-store');

  try {
    const { filter, startDateISO, endDateISO } = parseDateRange(
      req.query,
    );

    const queryStart = filter.Date.$gte;
    const queryEnd = filter.Date.$lte;

    // -------------------------------------------------------------------------
    // Trap not fishing — search Comments field for relevant keywords.
    // -------------------------------------------------------------------------
    const trapCommentRegex = {
      $regex: /trapping stopped|trapping started|no trap check/i,
    };
    const trapSelect = {
      Date: 1,
      Time: 1,
      Comments: 1,
      'Chum Males': 1,
      'Chum Females': 1,
      'Coho Males Adipose Unknown': 1,
      'Coho Females Adipose Unknown': 1,
      'Coho Males Adipose Present': 1,
      'Coho Females Adipose Present': 1,
      'Coho Males Adipose Absent': 1,
      'Coho Females Adipose Absent': 1,
      'Coho Unknown Adipose Absent': 1,
      'Chinook Males Adipose Unknown': 1,
      'Chinook Females Adipose Unknown': 1,
      'Chinook Males Adipose Present': 1,
      'Chinook Females Adipose Present': 1,
      'Chinook Males Adipose Absent': 1,
      'Chinook Females Adipose Absent': 1,
      'Chinook Unknown Adipose Absent': 1,
      'Pink Males': 1,
      'Pink Females': 1,
    };

    const selectedRows = await UnionAdultReturn.find({
      Date: { $gte: queryStart, $lte: queryEnd },
    })
      .select(trapSelect)
      .sort({ Date: 1, Time: 1 })
      .lean();

    const trapNotFishingRows = selectedRows.filter((row) => {
      const comment =
        typeof row.Comments === 'string' ? row.Comments : '';
      return /trapping stopped|trapping started|no trap check/i.test(
        comment,
      );
    });

    const speciesSummary = speciesDefinitions.map((species) => {
      const males = selectedRows.reduce(
        (total, row) =>
          total + sumFieldValues(row, species.maleFields),
        0,
      );
      const females = selectedRows.reduce(
        (total, row) =>
          total + sumFieldValues(row, species.femaleFields),
        0,
      );
      const unknowns = selectedRows.reduce(
        (total, row) =>
          total + sumFieldValues(row, species.unknownFields || []),
        0,
      );

      return {
        key: species.key,
        label: species.label,
        males,
        females,
        unknowns,
        total: males + females + unknowns,
      };
    });

    const dayBuckets = new Map();
    for (const row of selectedRows) {
      const dateKey = toDateKey(row.Date);
      if (!dayBuckets.has(dateKey)) {
        dayBuckets.set(dateKey, []);
      }
      dayBuckets.get(dateKey).push(row);
    }

    const dailyTotalsRows = [];
    const runningTotals = Object.fromEntries(
      speciesDefinitions.map((species) => [species.key, 0]),
    );
    let currentDate = new Date(queryStart);
    while (currentDate <= queryEnd) {
      const dateKey = toDateKey(currentDate);
      const dayRows = dayBuckets.get(dateKey) || [];
      const speciesTotals = {};
      let totalDaily = 0;

      speciesDefinitions.forEach((species) => {
        const dailyTotal = dayRows.reduce(
          (total, row) =>
            total +
            sumFieldValues(row, species.maleFields) +
            sumFieldValues(row, species.femaleFields) +
            sumFieldValues(row, species.unknownFields || []),
          0,
        );
        speciesTotals[species.key] = dailyTotal;
        totalDaily += dailyTotal;
      });

      const runningTotalsForDay = {};
      speciesDefinitions.forEach((species) => {
        runningTotals[species.key] += speciesTotals[species.key];
        runningTotalsForDay[species.key] = runningTotals[species.key];
      });

      dailyTotalsRows.push({
        dateKey,
        dateLabel: toDateLabel(currentDate),
        speciesTotals,
        totalDaily,
        runningTotals: runningTotalsForDay,
        totalRunning: Object.values(runningTotalsForDay).reduce(
          (sum, value) => sum + value,
          0,
        ),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const trapNotFishingPeriods = [];
    let openPeriod = null;

    for (const row of trapNotFishingRows) {
      const comment =
        typeof row.Comments === 'string' ? row.Comments : '';
      const date = row.Date;
      const time = row.Time;

      if (/trapping stopped/i.test(comment)) {
        if (!openPeriod) {
          openPeriod = {
            start: date,
            startTime: time,
            end: null,
            endTime: '',
            historical: false,
          };
        }
      } else if (/trapping started/i.test(comment)) {
        if (openPeriod) {
          openPeriod.end = date;
          openPeriod.endTime = time;
          trapNotFishingPeriods.push(openPeriod);
          openPeriod = null;
        } else {
          trapNotFishingPeriods.push({
            start: null,
            startTime: '',
            end: date,
            endTime: time,
            historical: false,
          });
        }
      } else if (/no trap check/i.test(comment)) {
        if (!openPeriod) {
          openPeriod = {
            start: date,
            startTime: '',
            end: null,
            endTime: '',
            historical: false,
          };
        }
      }
    }

    if (openPeriod) {
      trapNotFishingPeriods.push(openPeriod);
    }

    res.render('union_adult_return/views/common-queries', {
      user: req.user,
      speciesSummary,
      dailyTotalsRows,
      trapNotFishingPeriods,
      query: { startDate: startDateISO, endDate: endDateISO },
    });
  } catch (err) {
    console.error('Error in common queries controller:', err);
    res.status(500).send('Internal server error');
  }
};
