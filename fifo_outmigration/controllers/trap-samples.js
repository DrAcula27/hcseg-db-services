const TrapSample = require('../models/trap-sample.js');

exports.create = async (req, res, next) => {
  try {
    const {
      date,
      time,
      trapOperating,
      rpm,
      debris,
      visibility,
      flow,
      waterTemp,
      hoboTemp,
      chumFry,
      chumFryMort,
      chumAlevin,
      chumDNATaken,
      chumDNAIDs,
      chumMarked,
      markedChumReleased,
      markedChumRecap,
      markedChumMort,
      cohoFry,
      cohoParr,
      cohoMarked,
      markedCohoRecap,
      chinookFry,
      chinookParr,
      pinkFry,
      sculpin,
      cutthroat,
      steelhead,
      lamprey,
      stickleback,
      comments,
    } = req.body;

    // Basic validations
    if (
      !date ||
      !time ||
      !trapOperating ||
      !rpm ||
      !debris ||
      !visibility ||
      !flow ||
      !waterTemp ||
      !hoboTemp ||
      !chumFry ||
      !chumFryMort ||
      !chumAlevin ||
      !chumDNATaken ||
      !chumDNAIDs ||
      !chumMarked ||
      !markedChumReleased ||
      !markedChumRecap ||
      !markedChumMort ||
      !cohoFry ||
      !cohoParr ||
      !cohoMarked ||
      !markedCohoRecap ||
      !chinookFry ||
      !chinookParr ||
      !pinkFry ||
      !sculpin ||
      !cutthroat ||
      !steelhead ||
      !lamprey ||
      !stickleback ||
      !comments
    ) {
      return res.status(400).json({
        message:
          'Date, Time, and Trap Operating are required fields.',
      });
    }

    // Create a new trap sample instance
    const newTrapSample = new TrapSample({
      date: date,
      time: time,
      trapOperating: trapOperating,
      rpm: rpm,
      debris: debris,
      visibility: visibility,
      flow: flow,
      waterTemp: waterTemp,
      hoboTemp: hoboTemp,
      chumFry: chumFry,
      chumFryMort: chumFryMort,
      chumAlevin: chumAlevin,
      chumDNATaken: chumDNATaken,
      chumDNAIDs: chumDNAIDs,
      chumMarked: chumMarked,
      markedChumReleased: markedChumReleased,
      markedChumRecap: markedChumRecap,
      markedChumMort: markedChumMort,
      cohoFry: cohoFry,
      cohoParr: cohoParr,
      cohoMarked: cohoMarked,
      markedCohoRecap: markedCohoRecap,
      chinookFry: chinookFry,
      chinookParr: chinookParr,
      pinkFry: pinkFry,
      sculpin: sculpin,
      cutthroat: cutthroat,
      steelhead: steelhead,
      lamprey: lamprey,
      stickleback: stickleback,
      comments: comments,
    });

    // Save the trap sample to the database
    await newTrapSample.save();

    res
      .status(201)
      .json({ message: 'Trap data submitted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// getAll trap samples
exports.getAll = async (req, res, next) => {
  try {
    const trapSamples = await TrapSample.find().sort({ date: -1 });
    res.status(200).json(trapSamples);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching trap samples.' });
  }
};

// get a trap sample by ID
exports.getById = async (req, res, next) => {
  try {
    const trapSample = await TrapSample.findById(req.params.id);
    if (!trapSample) {
      return res
        .status(404)
        .json({ message: 'Trap sample not found.' });
    }
    res.status(200).json(trapSample);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching trap sample.' });
  }
};

// update a trap sample by ID
exports.update = async (req, res) => {
  try {
    const updatedTrapSample = await TrapSample.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTrapSample) {
      return res
        .status(404)
        .json({ message: 'Trap sample not found.' });
    }
    res.status(200).json(updatedTrapSample);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating trap sample.' });
  }
};

// delete a trap sample by ID
exports.delete = async (req, res) => {
  try {
    const deletedTrapSample = await TrapSample.findByIdAndDelete(
      req.params.id
    );
    if (!deletedTrapSample) {
      return res
        .status(404)
        .json({ message: 'Trap sample not found.' });
    }
    res
      .status(200)
      .json({ message: 'Trap sample deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting trap sample.' });
  }
};
