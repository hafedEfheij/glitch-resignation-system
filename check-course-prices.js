const sqlite3 = require('sqlite3').verbose();

// Connect to database
const db = new sqlite3.Database('./server/university.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
});

// First check table structure
console.log('Checking table structure...\n');

db.all("PRAGMA table_info(courses)", (err, columns) => {
  if (err) {
    console.error('Error getting table info:', err.message);
    return;
  }

  console.log('Courses table columns:');
  columns.forEach(col => {
    console.log(`- ${col.name} (${col.type})`);
  });

  console.log('\n--- Checking course data ---\n');

  // Check course prices for enrolled courses
  const enrolledCourseIds = [14, 8, 18, 17];

  db.all(`
    SELECT id, course_code, name, department_id
    FROM courses
    WHERE id IN (${enrolledCourseIds.join(',')})
    ORDER BY id
  `, (err, courses) => {
  if (err) {
    console.error('Error fetching courses:', err.message);
    return;
  }

    console.log('Course ID | Code | Name | Department');
    console.log('----------|------|------|----------');

    courses.forEach(course => {
      console.log(`${course.id} | ${course.course_code} | ${course.name} | ${course.department_id}`);
    });

    console.log('\n--- Note ---');
    console.log('Price column does not exist in courses table');

    // Close database
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  });
});
