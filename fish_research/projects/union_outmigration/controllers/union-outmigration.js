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

    // Add user information to form data using merged schema field names
    formData['User ID'] = req.user._id || req.user.id;
    formData['Submitted By'] = req.user.username || req.user.email;

    // Basic validations
    const requiredFields = [
      'Date',
      'Time',
      'Trap Operating',
      'RPM',
      'Debris',
      'Water Temp',
      'Hobo Temp',
      'Visibility',
      'Flow',
      'Chum Fry',
      'Chum DNA Taken',
      'Chum Marked',
      'Chum Recap',
      'Chum Fry Mort',
      'Chum DNA IDs',
      'Chum Mort Marked',
      'Chum Mort Recap',
      'Coho Fry',
      'Coho Smolt',
      'Coho Smolt Marked',
      'Coho Smolt Recap',
      'Coho Fry Mort',
      'Coho Smolt Mort',
      'Coho Smolt Mort Marked',
      'Coho Smolt Mort Recap',
      'Coho Parr',
      'Steelhead',
      'Steelhead Marked',
      'Steelhead Recap',
      'Coho Parr Mort',
      'Steelhead Mort',
      'Steelhead Mort Marked',
      'Steelhead Mort Recap',
      'Cutthroat',
      'Chinook',
      'Sculpin',
      'Lamprey',
      'Cutthroat Mort',
      'Chinook Mort',
      'Sculpin Mort',
      'Lamprey Mort',
      'Comments',
    ];

    // Check for missing required fields
    const missingFields = requiredFields.filter(
      (field) => !formData.hasOwnProperty(field) || formData[field] === ''
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'All form fields are required.',
        missingFields: missingFields,
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
      Date: -1,
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
