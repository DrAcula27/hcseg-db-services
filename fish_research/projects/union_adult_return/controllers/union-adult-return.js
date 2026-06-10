const UnionAdultReturn = require('../models/Union_Adult_Return');

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
      'Time',
      'Trap Operating',
      'Date',
      'Number of Visitors',
      'Chum Males',
      'Chum Females',
      'Coho Males - Adipose Present',
      'Coho Females - Adipose Present',
      'Coho Males - Adipose Absent',
      'Coho Females - Adipose Absent',
      'Chinook Males - Adipose Present',
      'Chinook Females - Adipose Present',
      'Chinook Males - Adipose Absent',
      'Chinook Females - Adipose Absent',
      'Pink Males',
      'Pink Females',
      'Comments',
    ];

    // Check for missing required fields
    const missingFields = requiredFields.filter(
      (field) =>
        !formData.hasOwnProperty(field) || formData[field] === '',
    );

    if (missingFields.length > 0) {
      console.error(
        'UnionAdultReturn.create missing required fields:',
        missingFields,
      );
      console.error(
        'UnionAdultReturn.create formData keys:',
        Object.keys(formData || {}),
      );
      return res.status(400).json({
        message: 'All form fields are required.',
        missingFields: missingFields,
      });
    }

    // Create a new union outmigration instance
    const newUnionAdultReturn = new UnionAdultReturn(formData);

    // Check for duplicate entry before saving
    const isDuplicate = await UnionAdultReturn.findOne({
      Date: formData.Date,
      Time: formData.Time,
      Comments: formData.Comments,
    });
    if (isDuplicate) {
      return res.status(409).json({
        message:
          'Duplicate entry. This data has already been submitted.',
      });
    }

    // Save the union adult return to the database
    await newUnionAdultReturn.save();

    res.status(201).json({
      message: 'Union adult return data submitted successfully!',
      data: newUnionAdultReturn,
    });
  } catch (error) {
    console.error('Error saving union adult return data: ', error);
    res.status(500).json({
      message: 'Internal server error.',
      error: error.message,
    });
  }
};

// getAll union adult return records
exports.getAll = async (req, res, next) => {
  try {
    const unionAdultReturns = await UnionAdultReturn.find().sort({
      Date: -1,
    });
    res.status(200).json(unionAdultReturns);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error fetching union adult return records.',
    });
  }
};

// get a union adult return record by ID
exports.getById = async (req, res, next) => {
  try {
    const unionAdultReturn = await UnionAdultReturn.findById(
      req.params.id,
    );
    if (!unionAdultReturn) {
      return res
        .status(404)
        .json({ message: 'Union adult return record not found.' });
    }
    res.status(200).json(unionAdultReturn);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Error fetching union adult return record.' });
  }
};

// update a union adult return record by ID
exports.update = async (req, res) => {
  try {
    const updatedUnionAdultReturn =
      await UnionAdultReturn.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true },
      );
    if (!updatedUnionAdultReturn) {
      return res
        .status(404)
        .json({ message: 'Union adult return record not found.' });
    }
    res.status(200).json(updatedUnionAdultReturn);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Error updating union adult return record.' });
  }
};

// delete a union adult return record by ID
exports.delete = async (req, res) => {
  try {
    const deletedUnionAdultReturn =
      await UnionAdultReturn.findByIdAndDelete(req.params.id);
    if (!deletedUnionAdultReturn) {
      return res
        .status(404)
        .json({ message: 'Union adult return record not found.' });
    }
    res.status(200).json({
      message: 'Union adult return record deleted successfully.',
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Error deleting union adult return record.' });
  }
};
