/**
 * Migration script: Transform historical trap-samples data to new Union_Outmigration schema.
 *
 * Old schema (historical data):
 *   Date, Time, Trap Operating, RPM, Debris, Visibility, Flow, Water (°C), Hobo Temp (°C),
 *   Chum Fry, Chum Fry Mort, Chum Alevin, Chum DNA Taken, Chum DNA IDs, Chum Marked,
 *   Marked Chum Released, Marked Chum Recap, Marked Chum Mort, Coho Fry, Coho Parr,
 *   Coho Marked, Marked Coho Recap, Chinook Fry, Chinook Parr, Pink Fry, Sculpin,
 *   Cutthroat, Steelhead, Lamprey, Stickleback, Comments
 *
 * New schema (app schema in camelCase):
 *   date, time, trapOperating, rpm, debris, waterTemp, hoboTemp, visibility, flow,
 *   chumCaught, chumDnaTaken, chumMarked, chumMarkedRecap, chumMorts, chumDnaIds,
 *   chumMortsMarked, chumMortsRecap, cohoFryCaught, cohoSmoltCaught, cohoSmoltMarked,
 *   cohoSmoltMarkedRecap, cohoFryMorts, cohoSmoltMorts, cohoSmoltMortsMarked,
 *   cohoSmoltMortsRecap, cohoParrCaught, steelheadCaught, steelheadMarked,
 *   steelheadMarkedRecap, cohoParrMorts, steelheadMorts, steelheadMortsMarked,
 *   steelheadMortsRecap, cutthroatCaught, chinookCaught, sculpinCaught, lampreyCaught,
 *   cutthroatMorts, chinookMorts, sculpinMorts, lampreyMorts, comments
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
    '❌ No MongoDB URI found in env (MONGODB_URI or MONGODB_URI_DEV).'
  );
  process.exit(1);
}

// Parse command line args
const isDryRun = process.argv.includes('--dry-run');
const isCommit = process.argv.includes('--commit');

if (!isDryRun && !isCommit) {
  console.log('Usage:');
  console.log(
    '  node migrateTrapSamples.js --dry-run    # Preview what will change'
  );
  console.log(
    '  node migrateTrapSamples.js --commit     # Execute migration'
  );
  process.exit(0);
}

/**
 * Transform a document from old schema to new schema.
 *
 * NOTES on ambiguous mappings:
 * - "Chum Fry" → "chumCaught" (assuming Fry + Alevin = total caught)
 * - "Chum Fry Mort" + "Marked Chum Mort" → "chumMorts" (summed or use Marked Chum Mort as primary)
 * - "Marked Chum Released" → dropped (no equivalent in new schema; review if needed)
 * - "Coho Fry" → "cohoFryCaught"
 * - "Coho Parr" → "cohoParrCaught"
 * - "Coho Marked" → "cohoSmoltMarked" (assuming Coho Marked refers to smolt; adjust if needed)
 * - "Marked Coho Recap" → "cohoSmoltMarkedRecap"
 * - "Chinook Fry" → "chinookCaught"
 * - "Chinook Parr" → dropped (no mapping in new schema)
 * - "Pink Fry" → dropped (no mapping)
 * - "Stickleback" → dropped (no mapping)
 * - "Water (°C)" → "waterTemp"
 *
 * @param {Object} oldDoc - Document from old collection
 * @returns {Object} - Document formatted for new collection
 */
function transformDocument(oldDoc) {
  const newDoc = {};

  // Direct mappings (field name changes only)
  const directMappings = {
    Date: 'date',
    Time: 'time',
    'Trap Operating': 'trapOperating',
    RPM: 'rpm',
    Debris: 'debris',
    Visibility: 'visibility',
    Flow: 'flow',
    'Chum DNA Taken': 'chumDnaTaken',
    'Chum DNA IDs': 'chumDnaIds',
    'Chum Marked': 'chumMarked',
    'Marked Chum Recap': 'chumMarkedRecap',
    'Marked Chum Mort': 'chumMorts', // Primary source for chum mortalities
    'Marked Chum Released': null, // No equivalent in new schema
    'Coho Fry': 'cohoFryCaught',
    'Coho Parr': 'cohoParrCaught',
    'Coho Marked': 'cohoSmoltMarked', // Assume Coho Marked = Coho Smolt Marked
    'Marked Coho Recap': 'cohoSmoltMarkedRecap',
    'Chinook Fry': 'chinookCaught',
    'Chinook Parr': null, // No equivalent in new schema
    'Pink Fry': null, // No equivalent in new schema
    Sculpin: 'sculpinCaught',
    Cutthroat: 'cutthroatCaught',
    Steelhead: 'steelheadCaught',
    Lamprey: 'lampreyCaught',
    Stickleback: null, // No equivalent in new schema
    Comments: 'comments',
  };

  // Apply direct mappings
  Object.entries(directMappings).forEach(([oldKey, newKey]) => {
    if (newKey && oldDoc.hasOwnProperty(oldKey)) {
      newDoc[newKey] = oldDoc[oldKey];
    }
  });

  // Special handling for "Water (°C)" → "waterTemp"
  if (oldDoc.hasOwnProperty('Water (°C)')) {
    newDoc.waterTemp = oldDoc['Water (°C)'];
  }

  // Special handling for "Hobo Temp (°C)" → "hoboTemp"
  if (oldDoc.hasOwnProperty('Hobo Temp (°C)')) {
    newDoc.hoboTemp = oldDoc['Hobo Temp (°C)'];
  }

  // "Chum Fry" → "chumCaught" (using Chum Fry as the primary value)
  // NOTE: If you want to add Chum Alevin to this, adjust the logic below
  if (oldDoc.hasOwnProperty('Chum Fry')) {
    newDoc.chumCaught = oldDoc['Chum Fry'];
  }

  // "Chum Fry Mort" → No direct mapping (Marked Chum Mort is used as chumMorts above)
  // If you want to include both mortalities, you may need to sum them or choose primary source

  // "Chum Alevin" → No direct mapping (no equivalent in new schema)
  // If this should be combined with chumCaught, adjust above

  // Fields in new schema with no old equivalents get default undefined
  // Mongoose will handle sparse documents; these won't be stored if undefined

  return newDoc;
}

/**
 * Main migration function
 */
async function migrate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Get source and target collections
    const sourceCollectionName = 'trap-samples'; // Old collection (if it exists)
    const targetCollectionName = 'Union_Outmigration'; // New collection

    // Check if source collection exists
    const collections = await db.listCollections().toArray();
    const sourceExists = collections.some(
      (c) => c.name === sourceCollectionName
    );
    const targetExists = collections.some(
      (c) => c.name === targetCollectionName
    );

    console.log(
      `Source collection '${sourceCollectionName}': ${
        sourceExists ? '✓ exists' : '✗ does not exist'
      }`
    );
    console.log(
      `Target collection '${targetCollectionName}': ${
        targetExists ? '✓ exists' : '✗ does not exist'
      }`
    );

    if (!sourceExists) {
      console.log('⚠️  No source collection found. Exiting.');
      process.exit(0);
    }

    // Fetch all documents from source collection
    const sourceCollection = db.collection(sourceCollectionName);
    const oldDocuments = await sourceCollection.find({}).toArray();

    console.log(
      `\n📦 Found ${oldDocuments.length} documents in '${sourceCollectionName}'`
    );

    if (oldDocuments.length === 0) {
      console.log('No documents to migrate.');
      process.exit(0);
    }

    // Transform documents
    const transformedDocs = oldDocuments.map((doc, index) => {
      const transformed = transformDocument(doc);
      // Preserve MongoDB _id if it exists
      if (doc._id) {
        transformed._id = doc._id;
      }
      return transformed;
    });

    // Display preview
    console.log(`\n📋 Preview of first transformed document:`);
    console.log(JSON.stringify(transformedDocs[0], null, 2));

    if (isDryRun) {
      console.log(
        `\n✓ DRY-RUN complete. ${transformedDocs.length} documents would be migrated.`
      );
      console.log(
        'To execute, run: node migrateTrapSamples.js --commit'
      );
      process.exit(0);
    }

    // Commit migration
    if (isCommit) {
      const targetCollection = db.collection(targetCollectionName);

      // Option 1: Overwrite target collection (DELETE old data in target)
      console.log(
        `\n⚠️  WARNING: About to overwrite '${targetCollectionName}' collection.`
      );
      console.log('Press Ctrl+C to cancel in the next 5 seconds...');
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Delete existing docs in target (optional: you can skip this and use upsert instead)
      await targetCollection.deleteMany({});
      console.log(`Cleared '${targetCollectionName}'`);

      // Insert transformed documents
      const result = await targetCollection.insertMany(
        transformedDocs
      );
      console.log(
        `✓ Migration complete! Inserted ${result.insertedCount} documents into '${targetCollectionName}'`
      );

      // Summary
      console.log('\n📊 Migration Summary:');
      console.log(
        `  Source: '${sourceCollectionName}' (${oldDocuments.length} docs)`
      );
      console.log(
        `  Target: '${targetCollectionName}' (${result.insertedCount} docs)`
      );
      console.log(
        '\n⚠️  IMPORTANT: Review the mapping logic in this script.'
      );
      console.log('   Some fields may require manual adjustment:');
      console.log('   - Chum Fry (mapped to chumCaught)');
      console.log(
        '   - Chum Fry Mort (not included; using Marked Chum Mort → chumMorts)'
      );
      console.log('   - Chum Alevin (dropped; no equivalent)');
      console.log(
        '   - Coho Marked (mapped to cohoSmoltMarked; verify correctness)'
      );
      console.log(
        '   - Chinook Parr, Pink Fry, Stickleback (dropped; no equivalents)'
      );
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
