// Initialize an array to store the unique CSV data
const uniqueData = [];
let shownData = [];
const originalData = []; // Store the original data for filter clearing
const sortingOrder = {}; // Object to track sorting order for each column

function handleScroll() {
    // Function to handle scrolling and showing/hiding the scroll-to-top button
    const scrollToTopButton = document.getElementById('scrollToTopButton');
    const scrollPosition = window.scrollY;

    // Show the button when the user scrolls down
    if (scrollPosition > 100) {
        scrollToTopButton.style.display = 'block';
    } else {
        scrollToTopButton.style.display = 'none';
    }
}

function handleFileInput(event) {
    // Handle file input change
    const fileInput = event.target;
    const files = fileInput.files;

    if (files.length > 0) {
        const file = files[0];

        readFile(file, () => {
            // Populate the table with data
            populateTable();
        });
    }
}

function readFile(file, callback) {
    // Function to read file content and process CSV data
    const reader = new FileReader();

    reader.onload = function (e) {
        const csvData = e.target.result;
        const rows = csvData.split('\n');

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].split(',');
            if (row.length === 4) {
                const [name, grade, month, year] = row;
                const uniqueKey = `${name}-${grade}-${month}-${year}`;

                // Check if the data is already in the uniqueData array to prevent duplicates
                if (!uniqueData.find((item) => item.key === uniqueKey)) {
                    uniqueData.push({ key: uniqueKey, name, grade, month, year });
                }
            }
        }

        callback();
    };
    reader.readAsText(file);
}

function generateCsvDownload(filteredData){
    // Function to generate csv file based on filtered data
    const titlekeys = ['name','grade','month','year'];
    const refinedData = [];

    refinedData.push(titlekeys);
    filteredData.forEach(item => {
        refinedData.push(Object.values(item).slice(1));
    });

    let csvContent = '';
    refinedData.forEach(row => {
        csvContent += row.join(',') + '\n'
    });
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' });
    const objUrl = URL.createObjectURL(blob);
    const link = document.getElementsByClassName('file-download')[0];
    link.href = objUrl;
    link.download = 'FilteredData.csv';
    link.classList.add('file-download');
    link.style.display = "inline-block";
}

function populateTable() {
    // Function to populate the table with merged data
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    if(shownData.length == 0){
        for (const { name, grade, month, year } of uniqueData) {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `<td>${name}</td><td>${grade}</td><td>${month}</td><td>${year}</td>`;
            tableBody.appendChild(newRow);
        }
    } else if(shownData != 0){
        for (const { name, grade, month, year } of shownData) {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `<td>${name}</td><td>${grade}</td><td>${month}</td><td>${year}</td>`;
            tableBody.appendChild(newRow);
        }
    }
}

function clearTable() {
    // Function to clear the table and the stored data
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    uniqueData.length = 0; 
    shownData.length = 0;
    originalData.length = 0;
    
    const downloadButton = document.getElementsByClassName('file-download')[0];
    downloadButton.style.display = 'none';
}

function filterAndSortTable(selectedColumn,triangleClass) {
    // Function to filter and sort the table based on user selection
    // Check if sorting order is not defined for the selected column
    if (!sortingOrder[selectedColumn]) {
        sortingOrder[selectedColumn] = 'ascending';

    } else {
        sortingOrder[selectedColumn] =
            sortingOrder[selectedColumn] === 'ascending' ? 'descending' : 'ascending';
    }

    const sortOrder = sortingOrder[selectedColumn];
    showTriangle(sortOrder,triangleClass);

    if (selectedColumn === 'month') {
        // Sort the "month" column in both ascending and descending order
        const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        if(shownData.length == 0){
            uniqueData.sort((a, b) => {
                const aValue = monthOrder.indexOf(a['month']);
                const bValue = monthOrder.indexOf(b['month']);
    
                return sortOrder === 'ascending' ? aValue - bValue : bValue - aValue;
            });
        } else if(shownData != 0){
            shownData.sort((a, b) => {
                const aValue = monthOrder.indexOf(a['month']);
                const bValue = monthOrder.indexOf(b['month']);
    
                return sortOrder === 'ascending' ? aValue - bValue : bValue - aValue;
            });
        }
    } else {
        if(shownData.length == 0){
            uniqueData.sort((a, b) => {
                const aValue = a[selectedColumn];
                const bValue = b[selectedColumn];
                if (sortOrder === 'ascending') {
                    return aValue.localeCompare(bValue);
                } else {
                    return bValue.localeCompare(aValue);
                }
            });
        } else if(shownData != 0){
            shownData.sort((a, b) => {
                const aValue = a[selectedColumn];
                const bValue = b[selectedColumn];
                if (sortOrder === 'ascending') {
                    return aValue.localeCompare(bValue);
                } else {
                    return bValue.localeCompare(aValue);
                }
            });   
        }
    }

    populateTable();
}

function showTriangle(sortOrder,triangleClass){
    const triangle = document.getElementsByClassName(triangleClass)[0];
    
    if(sortOrder == 'descending'){
        triangle.classList.remove('triangle-ascending');
        triangle.classList.add('triangle-descending');
    }
    else if(sortOrder == 'ascending'){
        triangle.classList.remove('triangle-descending');
        triangle.classList.add('triangle-ascending');
    }
}

function filterTable() {
    const selectedColumn = document.getElementById('filterColumn').value;
    const filterValue = document.getElementById('filterInput').value.toLowerCase();

    const filteredData = uniqueData.filter(item => item[selectedColumn].toLowerCase().includes(filterValue));
    shownData = [...filteredData];
    
    if(shownData.length > 0){
        generateCsvDownload(shownData);
    }

    // Store the original data for filter clearing
    if (originalData.length === 0) {
        originalData.push(...uniqueData);
    }

    // Clear existing data and populate the table with filtered data
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';


    for (const { name, grade, month, year } of filteredData) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `<td>${name}</td><td>${grade}</td><td>${month}</td><td>${year}</td>`;
        tableBody.appendChild(newRow);
    }
}

function clearFilter() {
    // Restore the original data and repopulate the table
    if(shownData != 0){
        uniqueData.length = 0;
        shownData.length = 0;
        uniqueData.push(...originalData);
        document.getElementById('filterInput').value = '';
        
        const downloadButton = document.getElementsByClassName('file-download')[0];
        downloadButton.style.display = 'none';
        populateTable();
    } 
}

// Add event listeners for DOM
document.addEventListener('DOMContentLoaded', function () {
    const tableHeaders = ['Name', 'Grade', 'Month', 'Year']; 
    const filterColumnDropdown = document.getElementById('filterColumn');

    // Populate filter column dropdown with table headers
    tableHeaders.forEach(header => {
        const option = document.createElement('option');
        option.value = header.toLowerCase();
        option.text = header;
        filterColumnDropdown.add(option);
    });

    const filterButton = document.getElementById('filterButton');
    filterButton.addEventListener('click', filterTable);

    const clearFilterButton = document.getElementById('clearFilterButton');
    clearFilterButton.addEventListener('click', clearFilter);
});

// Add event listeners to column headers for sorting
const nameHeader = document.getElementById('nameHeader');
const gradeHeader = document.getElementById('gradeHeader');
const monthHeader = document.getElementById('monthHeader');
const yearHeader = document.getElementById('yearHeader');

nameHeader.addEventListener('click', () => filterAndSortTable('name','triangleNameHeader'));
gradeHeader.addEventListener('click', () => filterAndSortTable('grade','triangleGradeHeader'));
monthHeader.addEventListener('click', () => filterAndSortTable('month','triangleMonthHeader'));
yearHeader.addEventListener('click', () => filterAndSortTable('year','triangleYearHeader'));

// Attach event listeners
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', handleFileInput);

const clearTableButton = document.getElementById('clearTableButton');
clearTableButton.addEventListener('click', clearTable);

// Add an event listener to the scroll-to-top button
const scrollToTopButton = document.getElementById('scrollToTopButton');
scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
});

// Add an event listener for scrolling
window.addEventListener('scroll', handleScroll);
