const UnionOutmigration = require('../models/Union_Outmigration');

exports.create = async (req, res) => {
  try {
    const formData = req.body;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: 'User must be authenticated to submit data.',
      });
    }

    // Add user information to form data
    formData.userId = req.user._id || req.user.id;
    formData.submittedBy = req.user.username || req.user.email;

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

    // Create a new union outmigration instance
    const newUnionOutmigration = new UnionOutmigration(formData);

    // Save the union outmigration to the database
    await newUnionOutmigration.save();

    res.status(201).json({
      message: 'Union outmigration data submitted successfully!',
      data: newUnionOutmigration,
    });
  } catch (error) {
    console.error('Error saving union outmigration data: ', error);
    res.status(500).json({
      message: 'Internal server error.',
      error: error.message,
    });
  }
};

// getAll union outmigration records
exports.getAll = async (req, res, next) => {
  try {
    const unionOutmigrations = await UnionOutmigration.find().sort({
      date: -1,
    });
    res.status(200).json(unionOutmigrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error fetching union outmigration records.',
    });
  }
};

// get a union outmigration record by ID
exports.getById = async (req, res, next) => {
  try {
    const unionOutmigration = await UnionOutmigration.findById(
      req.params.id,
    );
    if (!unionOutmigration) {
      return res
        .status(404)
        .json({ message: 'Union outmigration record not found.' });
    }
    res.status(200).json(unionOutmigration);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Error fetching union outmigration record.' });
  }
};

// update a union outmigration record by ID
exports.update = async (req, res) => {
  try {
    const updatedUnionOutmigration =
      await UnionOutmigration.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true },
      );
    if (!updatedUnionOutmigration) {
      return res
        .status(404)
        .json({ message: 'Union outmigration record not found.' });
    }
    res.status(200).json(updatedUnionOutmigration);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Error updating union outmigration record.' });
  }
};

// delete a union outmigration record by ID
exports.delete = async (req, res) => {
  try {
    const deletedUnionOutmigration =
      await UnionOutmigration.findByIdAndDelete(req.params.id);
    if (!deletedUnionOutmigration) {
      return res
        .status(404)
        .json({ message: 'Union outmigration record not found.' });
    }
    res.status(200).json({
      message: 'Union outmigration record deleted successfully.',
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Error deleting union outmigration record.' });
  }
};
