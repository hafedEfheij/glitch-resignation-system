const sqlite3 = require('sqlite3').verbose();

// Connect to database
const db = new sqlite3.Database('./server/university.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
});

console.log('Adding price column to courses table...\n');

// Add price column to courses table
db.run(`ALTER TABLE courses ADD COLUMN price DECIMAL(10,2) DEFAULT 0`, (err) => {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('Price column already exists');
    } else {
      console.error('Error adding price column:', err.message);
      return;
    }
  } else {
    console.log('Successfully added price column to courses table');
  }

  // Update some courses with sample prices
  console.log('\nUpdating courses with sample prices...');
  
  const updates = [
    { id: 8, price: 150 },   // حاسب 3
    { id: 14, price: 200 },  // قواعد بيانات 1
    { id: 17, price: 100 },  // جبر
    { id: 18, price: 180 }   // مادة أخرى
  ];

  let completed = 0;
  
  updates.forEach(update => {
    db.run(`UPDATE courses SET price = ? WHERE id = ?`, [update.price, update.id], function(err) {
      if (err) {
        console.error(`Error updating course ${update.id}:`, err.message);
      } else {
        console.log(`Updated course ${update.id} with price ${update.price} دينار`);
      }
      
      completed++;
      if (completed === updates.length) {
        // Verify the updates
        console.log('\n--- Verification ---');
        db.all(`
          SELECT id, course_code, name, price 
          FROM courses 
          WHERE id IN (${updates.map(u => u.id).join(',')})
          ORDER BY id
        `, (err, courses) => {
          if (err) {
            console.error('Error verifying updates:', err.message);
          } else {
            console.log('Course ID | Code | Name | Price');
            console.log('----------|------|------|------');
            courses.forEach(course => {
              console.log(`${course.id} | ${course.course_code} | ${course.name} | ${course.price} دينار`);
            });
          }

          // Close database
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
            } else {
              console.log('\nDatabase connection closed');
            }
          });
        });
      }
    });
  });
});
