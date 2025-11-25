const TrapSample = require('../models/trap-sample.js');

exports.create = async (req, res) => {
  try {
    const formData = req.body;

    // Basic validations
    if (
      !formData.date ||
      !formData.time ||
      !formData.trapOperating ||
      !formData.rpm ||
      !formData.debris ||
      !formData.visibility ||
      !formData.flow ||
      !formData.waterTemp ||
      !formData.hoboTemp ||
      !formData.chumCaught ||
      !formData.chumDnaTaken ||
      !formData.chumMarked ||
      !formData.chumMarkedRecap ||
      !formData.chumMorts ||
      !formData.chumDnaIds ||
      !formData.chumMortsMarked ||
      !formData.chumMortsRecap ||
      !formData.cohoFryCaught ||
      !formData.cohoFryMorts ||
      !formData.cohoSmoltCaught ||
      !formData.cohoSmoltMarked ||
      !formData.cohoSmoltMarkedRecap ||
      !formData.cohoSmoltMorts ||
      !formData.cohoSmoltMortsMarked ||
      !formData.cohoSmoltMortsRecap ||
      !formData.cohoParrCaught ||
      !formData.cohoParrMorts ||
      !formData.steelheadCaught ||
      !formData.steelheadMarked ||
      !formData.steelheadMarkedRecap ||
      !formData.steelheadMorts ||
      !formData.steelheadMortsMarked ||
      !formData.steelheadMortsRecap ||
      !formData.cutthroatCaught ||
      !formData.cutthroatMorts ||
      !formData.chinookCaught ||
      !formData.chinookMorts ||
      !formData.sculpinCaught ||
      !formData.sculpinMorts ||
      !formData.lampreyCaught ||
      !formData.lampreyMorts ||
      !formData.comments
    ) {
      return res.status(400).json({
        message: 'All form fields are required.',
      });
    }

    // Create a new trap sample instance
    const newTrapSample = new TrapSample(formData);

    // Save the trap sample to the database
    await newTrapSample.save();

    res.status(201).json({
      message: 'Trap data submitted successfully!',
      data: newTrapSample,
    });
  } catch (error) {
    console.error('Error saving trap sample: ', error);
    res.status(500).json({
      message: 'Internal server error.',
      error: error.message,
    });
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
