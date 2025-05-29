const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '.data', 'university.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking receipt numbers in database...');

db.all(`
  SELECT 
    s.name as student_name,
    c.name as course_name,
    c.course_code,
    e.payment_status,
    e.receipt_number,
    typeof(e.receipt_number) as receipt_type,
    length(e.receipt_number) as receipt_length
  FROM enrollments e
  JOIN students s ON e.student_id = s.id
  JOIN courses c ON e.course_id = c.id
  WHERE e.receipt_number IS NOT NULL
  ORDER BY s.name, c.course_code
`, (err, rows) => {
  if (err) {
    console.error('❌ Database error:', err);
    process.exit(1);
  }
  
  console.log('📊 Found', rows.length, 'enrollments with receipt numbers:');
  console.log('');
  
  rows.forEach((row, index) => {
    console.log(`${index + 1}. ${row.student_name} - ${row.course_name} (${row.course_code})`);
    console.log(`   Receipt: '${row.receipt_number}'`);
    console.log(`   Type: ${row.receipt_type}`);
    console.log(`   Length: ${row.receipt_length}`);
    console.log(`   Payment Status: ${row.payment_status}`);
    console.log('   ---');
  });
  
  // Test JavaScript validation
  console.log('\n🧪 Testing JavaScript validation:');
  
  rows.forEach((row, index) => {
    const receiptNumber = row.receipt_number;
    
    // Test current validation
    const isValid1 = receiptNumber && 
                    receiptNumber !== null && 
                    receiptNumber !== undefined && 
                    receiptNumber !== 'null' && 
                    receiptNumber !== '' &&
                    receiptNumber.toString().trim() !== '';
    
    // Test simple validation
    const isValid2 = Boolean(receiptNumber);
    
    // Test string validation
    const isValid3 = receiptNumber && String(receiptNumber).trim() !== '';
    
    console.log(`${index + 1}. Receipt: '${receiptNumber}' (${typeof receiptNumber})`);
    console.log(`   Complex validation: ${isValid1 ? '✅' : '❌'}`);
    console.log(`   Simple validation: ${isValid2 ? '✅' : '❌'}`);
    console.log(`   String validation: ${isValid3 ? '✅' : '❌'}`);
    console.log(`   Display: ${isValid1 ? receiptNumber : 'غير محدد'}`);
    console.log('   ---');
  });
  
  db.close();
});
