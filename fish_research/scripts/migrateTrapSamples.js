/**
 * Migration script: Transform new schema (camelCase) data to merged schema (Title Case with spaces).
 *
 * Note: Historical data is already stored in Union_Outmigration collection using Title Case fields.
 * This script only transforms new entries that were created with camelCase field names.
 *
 * Old/Historical schema (Title Case with spaces):
 *   Date, Time, Trap Operating, RPM, Debris, Water (°C), Hobo Temp (°C), Visibility, Flow,
 *   Chum Fry, Chum Alevin, Chum DNA Taken, Chum Marked, Marked Chum Recap, Chum Fry Mort,
 *   Chum DNA IDs, Marked Chum Mort, Marked Chum Released, Coho Fry, Coho Parr, Coho Marked,
 *   Marked Coho Recap, Steelhead, Cutthroat, Chinook Fry, Chinook Parr, Sculpin, Lamprey,
 *   Stickleback, Pink Fry, Comments
 *
 * New entries schema (camelCase - needs transformation):
 *   userId, submittedBy, date, time, trapOperating, rpm, debris, waterTemp, hoboTemp,
 *   visibility, flow, chumCaught, chumDnaTaken, chumMarked, chumMarkedRecap, chumMorts,
 *   chumDnaIds, chumMortsMarked, chumMortsRecap, cohoFryCaught, cohoSmoltCaught,
 *   cohoSmoltMarked, cohoSmoltMarkedRecap, cohoFryMorts, cohoSmoltMorts,
 *   cohoSmoltMortsMarked, cohoSmoltMortsRecap, cohoParrCaught, steelheadCaught,
 *   steelheadMarked, steelheadMarkedRecap, cohoParrMorts, steelheadMorts,
 *   steelheadMortsMarked, steelheadMortsRecap, cutthroatCaught, chinookCaught,
 *   sculpinCaught, lampreyCaught, cutthroatMorts, chinookMorts, sculpinMorts,
 *   lampreyMorts, comments, createdAt
 *
 * Target merged schema (Title Case with spaces):
 *   User ID, Submitted By, Date, Time, Trap Operating, RPM, Debris, Water Temp, Hobo Temp,
 *   Visibility, Flow, Chum Fry, Chum DNA Taken, Chum Marked, Chum Recap, Chum Fry Mort,
 *   Chum DNA IDs, Chum Mort Marked, Chum Mort Recap, Coho Fry, Coho Smolt, Coho Smolt Marked,
 *   Coho Smolt Recap, Coho Fry Mort, Coho Smolt Mort, Coho Smolt Mort Marked,
 *   Coho Smolt Mort Recap, Coho Parr, Steelhead, Steelhead Marked, Steelhead Recap,
 *   Coho Parr Mort, Steelhead Mort, Steelhead Mort Marked, Steelhead Mort Recap, Cutthroat,
 *   Chinook, Sculpin, Lamprey, Cutthroat Mort, Chinook Mort, Sculpin Mort, Lamprey Mort,
 *   Comments, Created At
 *
 * Transformation details:
 *   - Converts camelCase field names to Title Case with spaces
 *   - Adds Created At timestamp if missing (uses current time)
 *   - Handles fields that don't exist yet (User ID, Submitted By may be missing)
 *   - Only transforms documents with camelCase fields (leaves historical data untouched)
 *
 * Usage:
 *   node migrateTrapSamples.js --dry-run    # Preview changes
 *   node migrateTrapSamples.js --commit     # Execute migration
 */

require('dotenv').config({
  path: require('path').join(__dirname, '../../.env'),
});

const mongoose = require('mongoose');

const mongoUri =
  process.env.MONGODB_URI || process.env.MONGODB_URI_DEV;
const mongoDbName =
  process.env.MONGODB_DB || process.env.MONGODB_DB_DEV || undefined;

if (!mongoUri) {
  console.error(
    '❌ No MongoDB URI found in env (MONGODB_URI or MONGODB_URI_DEV).',
  );
  process.exit(1);
}

// Parse command line args
const isDryRun = process.argv.includes('--dry-run');
const isCommit = process.argv.includes('--commit');

if (!isDryRun && !isCommit) {
  console.log('Usage:');
  console.log(
    '  node migrateTrapSamples.js --dry-run    # Preview what will change',
  );
  console.log(
    '  node migrateTrapSamples.js --commit     # Execute migration',
  );
  process.exit(0);
}

/**
 * Determine if a document is from the new schema (camelCase) that needs transformation.
 *
 * @param {Object} doc - Document to check
 * @returns {boolean} - true if document is new schema (camelCase), false if already merged
 */
function isNewSchemaDocument(doc) {
  // Check for camelCase field indicators (new schema)
  const newSchemaIndicators = [
    'date',
    'time',
    'trapOperating',
    'chumCaught',
    'cohoSmoltCaught',
  ];
  return newSchemaIndicators.some((key) => doc.hasOwnProperty(key));
}

/**
 * Check if a document is already in merged schema (Title Case with spaces).
 *
 * @param {Object} doc - Document to check
 * @returns {boolean} - true if document uses merged schema
 */
function isMergedSchemaDocument(doc) {
  const mergedSchemaIndicators = [
    'Date',
    'Time',
    'Trap Operating',
    'Chum Fry',
    'Coho Smolt',
  ];
  return mergedSchemaIndicators.some((key) =>
    doc.hasOwnProperty(key),
  );
}

/**
 * Transform a document from new schema (camelCase) to merged schema (Title Case with spaces).
 * This is the only transformation needed since historical data is already in Title Case.
 *
 * @param {Object} newDoc - Document from new entries (camelCase schema)
 * @returns {Object} - Document formatted for merged schema
 */
function transformNewToMerged(newDoc) {
  const mergedDoc = {};

  // Mapping from camelCase (new schema) to Title Case with spaces (merged schema)
  const camelToTitleMappings = {
    userId: 'User ID',
    submittedBy: 'Submitted By',
    date: 'Date',
    time: 'Time',
    trapOperating: 'Trap Operating',
    rpm: 'RPM',
    debris: 'Debris',
    waterTemp: 'Water Temp',
    hoboTemp: 'Hobo Temp',
    visibility: 'Visibility',
    flow: 'Flow',
    chumCaught: 'Chum Fry',
    chumDnaTaken: 'Chum DNA Taken',
    chumMarked: 'Chum Marked',
    chumMarkedRecap: 'Chum Recap',
    chumMorts: 'Chum Fry Mort',
    chumDnaIds: 'Chum DNA IDs',
    chumMortsMarked: 'Chum Mort Marked',
    chumMortsRecap: 'Chum Mort Recap',
    cohoFryCaught: 'Coho Fry',
    cohoSmoltCaught: 'Coho Smolt',
    cohoSmoltMarked: 'Coho Smolt Marked',
    cohoSmoltMarkedRecap: 'Coho Smolt Recap',
    cohoFryMorts: 'Coho Fry Mort',
    cohoSmoltMorts: 'Coho Smolt Mort',
    cohoSmoltMortsMarked: 'Coho Smolt Mort Marked',
    cohoSmoltMortsRecap: 'Coho Smolt Mort Recap',
    cohoParrCaught: 'Coho Parr',
    steelheadCaught: 'Steelhead',
    steelheadMarked: 'Steelhead Marked',
    steelheadMarkedRecap: 'Steelhead Recap',
    cohoParrMorts: 'Coho Parr Mort',
    steelheadMorts: 'Steelhead Mort',
    steelheadMortsMarked: 'Steelhead Mort Marked',
    steelheadMortsRecap: 'Steelhead Mort Recap',
    cutthroatCaught: 'Cutthroat',
    chinookCaught: 'Chinook',
    sculpinCaught: 'Sculpin',
    lampreyCaught: 'Lamprey',
    cutthroatMorts: 'Cutthroat Mort',
    chinookMorts: 'Chinook Mort',
    sculpinMorts: 'Sculpin Mort',
    lampreyMorts: 'Lamprey Mort',
    comments: 'Comments',
    createdAt: 'Created At',
  };

  // Apply mappings while preserving original field order
  // Iterate through the original document's keys to maintain order
  Object.keys(newDoc).forEach((camelKey) => {
    if (camelToTitleMappings.hasOwnProperty(camelKey)) {
      const titleKey = camelToTitleMappings[camelKey];
      mergedDoc[titleKey] = newDoc[camelKey];
    }
  });

  // Add Created At if missing (using current timestamp)
  if (!mergedDoc['Created At']) {
    mergedDoc['Created At'] = new Date();
  }

  // Preserve _id if it exists
  if (newDoc._id) {
    mergedDoc._id = newDoc._id;
  }

  return mergedDoc;
}

/**
 * Main migration function
 */
async function migrate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log(`✓ Connected to MongoDB Database: ${mongoDbName}`);

    const db = mongoose.connection.db;

    // Define collection
    const unionOutmigrationCollectionName = 'Union_Outmigration';

    // Check if collection exists
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(
      (c) => c.name === unionOutmigrationCollectionName,
    );

    if (!collectionExists) {
      console.log(
        `❌ Collection '${unionOutmigrationCollectionName}' does not exist. Exiting.`,
      );
      process.exit(1);
    }

    console.log(
      `✓ Collection '${unionOutmigrationCollectionName}' found`,
    );

    // Fetch all documents from collection
    const collection = db.collection(unionOutmigrationCollectionName);
    const allDocuments = await collection.find({}).toArray();

    console.log(
      `\n📦 Found ${allDocuments.length} total documents in '${unionOutmigrationCollectionName}'`,
    );

    // Separate documents by schema type
    const newSchemaDocs = allDocuments.filter((doc) =>
      isNewSchemaDocument(doc),
    );
    const mergedSchemaDocs = allDocuments.filter((doc) =>
      isMergedSchemaDocument(doc),
    );
    const unknownDocs = allDocuments.filter(
      (doc) =>
        !isNewSchemaDocument(doc) && !isMergedSchemaDocument(doc),
    );

    console.log(
      `  - ${newSchemaDocs.length} documents in new schema (camelCase) - need transformation`,
    );
    console.log(
      `  - ${mergedSchemaDocs.length} documents in merged schema (Title Case) - no action needed`,
    );
    if (unknownDocs.length > 0) {
      console.log(
        `  - ${unknownDocs.length} documents with unknown schema`,
      );
      console.log(`\n📋 Unknown schema document IDs:`);
      unknownDocs.forEach((doc) => {
        console.log(`    ${doc._id}`);
      });
    }

    if (newSchemaDocs.length === 0) {
      console.log(
        '\n✓ No documents requiring transformation. All data is already in merged schema.',
      );
      process.exit(0);
    }

    // Transform only the new schema documents
    const transformedDocs = newSchemaDocs.map((doc) =>
      transformNewToMerged(doc),
    );

    // Display preview
    console.log(`\n📋 Preview of first transformed document:`);
    console.log(JSON.stringify(transformedDocs[0], null, 2));

    if (isDryRun) {
      console.log(
        `\n✓ DRY-RUN complete. ${transformedDocs.length} documents would be transformed to merged schema.`,
      );
      console.log(
        'To execute, run: node migrateTrapSamples.js --commit',
      );
      process.exit(0);
    }

    // Commit migration
    if (isCommit) {
      // Warn user before modifying
      console.log(
        `\n⚠️  WARNING: About to update ${transformedDocs.length} documents in '${unionOutmigrationCollectionName}'.`,
      );
      console.log('Press Ctrl+C to cancel in the next 5 seconds...');
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Update each transformed document by ID
      let updateCount = 0;

      for (const doc of transformedDocs) {
        if (doc._id) {
          // Use replaceOne to replace entire document and preserve field order
          // (replaceOne maintains _id automatically)
          await collection.replaceOne({ _id: doc._id }, doc);
          updateCount++;
        }
      }

      console.log(
        `✓ Migration complete! Updated ${updateCount} documents in '${unionOutmigrationCollectionName}'`,
      );

      // Summary
      console.log('\n📊 Migration Summary:');
      console.log(
        `  Collection: '${unionOutmigrationCollectionName}'`,
      );
      console.log(`  Documents transformed: ${updateCount}`);
      console.log(
        `  Documents already merged: ${mergedSchemaDocs.length}`,
      );
      console.log('\n✓ Schema transformation successful!');
      console.log(
        '  - New schema (camelCase) documents converted to Title Case',
      );
      console.log('  - Created At field added where missing');
      console.log('  - Historical data (Title Case) left untouched');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

migrate();
