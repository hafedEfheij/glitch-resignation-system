const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '.data', 'university.db');

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Function to check if price column exists and add it if not
function ensurePriceColumn() {
  return new Promise((resolve, reject) => {
    // Check if price column exists
    db.all("PRAGMA table_info(courses)", (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      const hasPriceColumn = rows.some(row => row.name === 'price');
      
      if (!hasPriceColumn) {
        console.log('Price column not found. Adding it...');
        // Add price column as INTEGER for whole numbers only
        db.run("ALTER TABLE courses ADD COLUMN price INTEGER DEFAULT 0", (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('✅ Added price column to courses table');
            resolve();
          }
        });
      } else {
        console.log('✅ Price column already exists');
        resolve();
      }
    });
  });
}

// Function to update existing courses with default price
function updateExistingCourses() {
  return new Promise((resolve, reject) => {
    // Update all courses that have NULL or 0 price to a default value
    db.run("UPDATE courses SET price = 50 WHERE price IS NULL OR price = 0", function(err) {
      if (err) {
        reject(err);
      } else {
        console.log(`✅ Updated ${this.changes} courses with default price of 50 dinars`);
        resolve();
      }
    });
  });
}

// Function to display current courses with prices
function displayCourses() {
  return new Promise((resolve, reject) => {
    db.all("SELECT id, course_code, name, price FROM courses ORDER BY id", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        console.log('\n📊 Current courses with prices:');
        console.log('ID | Code | Name | Price');
        console.log('---|------|------|------');
        rows.forEach(row => {
          console.log(`${row.id} | ${row.course_code} | ${row.name} | ${row.price || 0} دينار`);
        });
        resolve();
      }
    });
  });
}

// Main execution
async function main() {
  try {
    console.log('🔧 Starting course price update...\n');
    
    // Step 1: Ensure price column exists
    await ensurePriceColumn();
    
    // Step 2: Update existing courses with default prices
    await updateExistingCourses();
    
    // Step 3: Display current courses
    await displayCourses();
    
    console.log('\n🎉 Course price update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during update:', error.message);
  } finally {
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\n📝 Database connection closed.');
      }
    });
  }
}

// Run the script
main();
