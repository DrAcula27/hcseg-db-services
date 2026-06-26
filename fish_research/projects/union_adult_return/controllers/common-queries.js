const UnionAdultReturn = require('../models/Union_Adult_Return');

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

    const CURRENT_DATA_CUTOFF = new Date(2026, 7, 15); // Aug 15, 2026 (month is 0-indexed)

    const queryStart = filter.Date.$gte;
    const queryEnd = filter.Date.$lte;

    // -------------------------------------------------------------------------
    // Trap not fishing — search Comments field for relevant keywords.
    // -------------------------------------------------------------------------
    const trapCommentRegex = {
      $regex: /trapping stopped|trapping started/i,
    };
    const trapSelect = { Date: 1, Time: 1, Comments: 1 };

    // Query for trap not fishing periods within the date range
    const trapNotFishingPeriods = await UnionAdultReturn.find({
      Date: { $gte: queryStart, $lte: queryEnd },
      Comments: trapCommentRegex,
    })
      .select(trapSelect)
      .sort({ Date: 1, Time: 1 })
      .lean();

    res.render('union_adult_return/views/common-queries', {
      user: req.user,
      // totals,
      trapNotFishingPeriods,
      query: { startDate: startDateISO, endDate: endDateISO },
    });
  } catch (err) {
    console.error('Error in common queries controller:', err);
    res.status(500).send('Internal server error');
  }
};
