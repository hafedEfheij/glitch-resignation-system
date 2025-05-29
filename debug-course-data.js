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

// Function to check table structure
function checkTableStructure() {
  return new Promise((resolve, reject) => {
    db.all("PRAGMA table_info(courses)", (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('\n📋 **Table Structure (courses):**');
      console.log('Column | Type | NotNull | Default | PrimaryKey');
      console.log('-------|------|---------|---------|----------');
      rows.forEach(row => {
        console.log(`${row.name} | ${row.type} | ${row.notnull} | ${row.dflt_value} | ${row.pk}`);
      });
      
      const hasPriceColumn = rows.some(row => row.name === 'price');
      console.log(`\n✅ Price column exists: ${hasPriceColumn}`);
      
      resolve(hasPriceColumn);
    });
  });
}

// Function to get all courses with their data
function getAllCourses() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT c.*, d.name as department_name
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
      ORDER BY c.id
    `, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('\n📊 **All Courses Data:**');
      console.log('ID | Code | Name | Price | Department');
      console.log('---|------|------|-------|----------');
      rows.forEach(row => {
        const price = row.price !== undefined ? row.price : 'UNDEFINED';
        const priceType = typeof row.price;
        console.log(`${row.id} | ${row.course_code} | ${row.name} | ${price} (${priceType}) | ${row.department_name || 'N/A'}`);
      });
      
      resolve(rows);
    });
  });
}

// Function to test getting a single course
function getSingleCourse(courseId) {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT c.*, d.name as department_name
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.id = ?
    `, [courseId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log(`\n🔍 **Single Course Data (ID: ${courseId}):**`);
      if (row) {
        console.log('Full course object:', JSON.stringify(row, null, 2));
        console.log(`Price value: ${row.price}`);
        console.log(`Price type: ${typeof row.price}`);
      } else {
        console.log('Course not found');
      }
      
      resolve(row);
    });
  });
}

// Function to test update operation
function testUpdateCourse(courseId, newPrice) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 **Testing Update Course (ID: ${courseId}, New Price: ${newPrice}):**`);
    
    // First get current data
    db.get('SELECT * FROM courses WHERE id = ?', [courseId], (err, beforeUpdate) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('Before update:', JSON.stringify(beforeUpdate, null, 2));
      
      // Update the course
      db.run('UPDATE courses SET price = ? WHERE id = ?', [newPrice, courseId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        console.log(`Update affected ${this.changes} rows`);
        
        // Get data after update
        db.get('SELECT * FROM courses WHERE id = ?', [courseId], (err, afterUpdate) => {
          if (err) {
            reject(err);
            return;
          }
          
          console.log('After update:', JSON.stringify(afterUpdate, null, 2));
          resolve(afterUpdate);
        });
      });
    });
  });
}

// Main execution
async function main() {
  try {
    console.log('🔧 **Starting Course Data Debug...**\n');
    
    // Step 1: Check table structure
    const hasPriceColumn = await checkTableStructure();
    
    if (!hasPriceColumn) {
      console.log('\n❌ Price column is missing! Adding it...');
      await new Promise((resolve, reject) => {
        db.run("ALTER TABLE courses ADD COLUMN price INTEGER DEFAULT 0", (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('✅ Price column added successfully');
            resolve();
          }
        });
      });
    }
    
    // Step 2: Get all courses
    const courses = await getAllCourses();
    
    if (courses.length > 0) {
      // Step 3: Test getting a single course
      await getSingleCourse(courses[0].id);
      
      // Step 4: Test update operation
      const testPrice = 123;
      await testUpdateCourse(courses[0].id, testPrice);
      
      // Step 5: Verify the update worked
      await getSingleCourse(courses[0].id);
    }
    
    console.log('\n🎉 **Debug completed successfully!**');
    
  } catch (error) {
    console.error('❌ **Error during debug:**', error.message);
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
