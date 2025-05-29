// Force update solution - add this to the page
function forceUpdateCoursePrice(courseId, newPrice) {
    console.log('🔧 Force updating course price:', courseId, newPrice);
    
    // Find all elements that might contain the course price
    const coursesTable = document.getElementById('courses-table-body');
    if (!coursesTable) {
        console.log('❌ Courses table not found');
        return;
    }
    
    // Find the row with this course ID
    const rows = coursesTable.querySelectorAll('tr');
    let updated = false;
    
    rows.forEach((row, index) => {
        // Look for edit button with matching course ID
        const editButton = row.querySelector('.edit-course');
        if (editButton && editButton.getAttribute('data-id') == courseId) {
            console.log(`📍 Found course row at index ${index}`);
            
            // Find the price cell (5th column - index 4)
            const cells = row.querySelectorAll('td');
            if (cells.length >= 5) {
                const priceCell = cells[4]; // 5th column (0-indexed)
                const oldContent = priceCell.innerHTML;
                
                // Update the price
                priceCell.innerHTML = `
                    <span class="badge bg-success">${parseInt(newPrice)} دينار</span>
                `;
                
                console.log('💰 Updated price cell:');
                console.log('  Old:', oldContent);
                console.log('  New:', priceCell.innerHTML);
                
                // Add visual feedback
                priceCell.style.backgroundColor = '#d4edda';
                priceCell.style.transition = 'background-color 0.5s';
                
                setTimeout(() => {
                    priceCell.style.backgroundColor = '';
                }, 2000);
                
                updated = true;
            }
        }
    });
    
    if (updated) {
        console.log('✅ Successfully updated course price in table');
    } else {
        console.log('❌ Could not find course row to update');
    }
    
    return updated;
}

// Test function
function testForceUpdate() {
    // Test with course ID 6 and price 555
    forceUpdateCoursePrice(6, 555);
}

console.log('🔧 Force update functions loaded. Use testForceUpdate() to test.');
console.log('🔧 Use forceUpdateCoursePrice(courseId, newPrice) to update any course.');
