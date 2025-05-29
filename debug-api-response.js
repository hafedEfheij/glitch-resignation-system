const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a simple test server to check API response
const app = express();
const dbPath = path.join(__dirname, '.data', 'university.db');

console.log('🔍 Starting API response analysis...');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err);
        return;
    }
    console.log('✅ Connected to database');
});

// Test the exact API endpoint that the frontend uses
app.get('/test-api', (req, res) => {
    console.log('\n🔍 Testing /api/admin/students-enrollments endpoint...');
    
    const query = `
        SELECT 
            s.id as student_id,
            s.name as student_name,
            s.student_id as student_registration,
            s.registration_number,
            s.department_id,
            s.semester,
            s.group_name,
            d.name as department_name,
            e.id as enrollment_id,
            e.payment_status,
            e.receipt_number,
            e.created_at as enrollment_created_at,
            c.id as course_id,
            c.name as course_name,
            c.course_code,
            c.semester as course_semester
        FROM students s
        LEFT JOIN departments d ON s.department_id = d.id
        LEFT JOIN enrollments e ON s.id = e.student_id
        LEFT JOIN courses c ON e.course_id = c.id
        ORDER BY s.name, c.course_code
    `;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('❌ Query error:', err);
            return res.status(500).json({ error: err.message });
        }
        
        console.log(`📊 Raw query returned ${rows.length} rows`);
        
        // Group by students (same logic as the real API)
        const studentsMap = new Map();
        
        rows.forEach(row => {
            console.log('\n📝 Processing row:', {
                student_name: row.student_name,
                course_name: row.course_name,
                course_code: row.course_code,
                payment_status: row.payment_status,
                receipt_number: row.receipt_number,
                receipt_type: typeof row.receipt_number,
                receipt_raw: JSON.stringify(row.receipt_number)
            });
            
            if (!studentsMap.has(row.student_id)) {
                studentsMap.set(row.student_id, {
                    id: row.student_id,
                    name: row.student_name,
                    student_id: row.student_registration,
                    registration_number: row.registration_number,
                    department_id: row.department_id,
                    department_name: row.department_name,
                    semester: row.semester,
                    group_name: row.group_name,
                    enrollments: []
                });
            }
            
            if (row.enrollment_id) {
                const enrollment = {
                    enrollment_id: row.enrollment_id,
                    course_id: row.course_id,
                    course_name: row.course_name,
                    course_code: row.course_code,
                    semester: row.course_semester,
                    payment_status: row.payment_status,
                    receipt_number: row.receipt_number,
                    created_at: row.enrollment_created_at
                };
                
                console.log('📋 Created enrollment object:', {
                    course_name: enrollment.course_name,
                    receipt_number: enrollment.receipt_number,
                    receipt_type: typeof enrollment.receipt_number,
                    receipt_raw: JSON.stringify(enrollment.receipt_number)
                });
                
                studentsMap.get(row.student_id).enrollments.push(enrollment);
            }
        });
        
        const students = Array.from(studentsMap.values());
        
        console.log('\n🎯 Final API response structure:');
        students.forEach(student => {
            console.log(`\n👤 Student: ${student.name}`);
            student.enrollments.forEach(enrollment => {
                console.log(`  📚 Course: ${enrollment.course_name} (${enrollment.course_code})`);
                console.log(`    💰 Payment: ${enrollment.payment_status}`);
                console.log(`    🧾 Receipt: "${enrollment.receipt_number}" (${typeof enrollment.receipt_number})`);
                console.log(`    🔍 Raw: ${JSON.stringify(enrollment.receipt_number)}`);
                
                // Test the validation logic
                const isValid1 = Boolean(enrollment.receipt_number);
                const isValid2 = Boolean(enrollment.receipt_number && String(enrollment.receipt_number).trim() !== '');
                const isValid3 = enrollment.receipt_number && 
                                enrollment.receipt_number !== null && 
                                enrollment.receipt_number !== undefined && 
                                enrollment.receipt_number !== 'null' && 
                                enrollment.receipt_number !== '' &&
                                enrollment.receipt_number.toString().trim() !== '';
                
                console.log(`    ✅ Simple Boolean: ${isValid1}`);
                console.log(`    ✅ String check: ${isValid2}`);
                console.log(`    ✅ Complex check: ${isValid3}`);
                console.log(`    📤 Would display: ${isValid2 ? enrollment.receipt_number : 'غير محدد'}`);
            });
        });
        
        res.json({ 
            success: true, 
            students: students,
            total_rows: rows.length,
            total_students: students.length
        });
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Test server running on http://localhost:${PORT}`);
    console.log(`🔗 Test the API: http://localhost:${PORT}/test-api`);
    console.log('\n📋 This will show exactly what data structure is being returned...');
});

// Also run a direct database test
setTimeout(() => {
    console.log('\n🔍 Direct database test for receipt numbers...');
    
    db.all(`
        SELECT 
            s.name as student_name,
            c.name as course_name,
            c.course_code,
            e.payment_status,
            e.receipt_number,
            typeof(e.receipt_number) as receipt_type,
            length(e.receipt_number) as receipt_length,
            quote(e.receipt_number) as receipt_quoted
        FROM enrollments e
        JOIN students s ON e.student_id = s.id
        JOIN courses c ON e.course_id = c.id
        WHERE e.receipt_number IS NOT NULL
        ORDER BY s.name, c.course_code
    `, (err, rows) => {
        if (err) {
            console.error('❌ Direct query error:', err);
            return;
        }
        
        console.log('\n📊 Direct database results:');
        rows.forEach((row, index) => {
            console.log(`\n${index + 1}. ${row.student_name} - ${row.course_name} (${row.course_code})`);
            console.log(`   Receipt: ${row.receipt_quoted}`);
            console.log(`   Type: ${row.receipt_type}`);
            console.log(`   Length: ${row.receipt_length}`);
            console.log(`   Payment Status: ${row.payment_status}`);
            
            // Test JavaScript validation on the raw value
            const receiptValue = row.receipt_number;
            console.log(`   JS typeof: ${typeof receiptValue}`);
            console.log(`   JS Boolean: ${Boolean(receiptValue)}`);
            console.log(`   JS String check: ${Boolean(receiptValue && String(receiptValue).trim() !== '')}`);
        });
    });
}, 1000);
