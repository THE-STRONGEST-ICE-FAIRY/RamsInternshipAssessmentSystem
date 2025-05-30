document.addEventListener("DOMContentLoaded", function () {
    setup();
    fetchStudentInterns();
    rowManip();
    updateRemoveButtonsVisibility();
    selectAutocomplete();
    fetchDropdowns();
    addIntern();
});

function setup() {
    const backBtn = document.getElementById("back");

    backBtn.addEventListener("click", () => {
        changeIframe("masterlist.html");
    });
}

function fetchStudentInterns() {
    fetch('masterlist~student.php')
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('studentInternList');
            tbody.innerHTML = ''; // nuke the old data

            if (data.error) {
                console.error("💥 ERROR:", data.error);
                return;
            }

            data.forEach((row, index) => {
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${row.user_email || ''}</td>
                    <td>${row.full_name || ''}</td>
                    <td>${row.intern_gender || ''}</td>
                    <td>${row.intern_birthdate || ''}</td>
                    <td>${row.address || ''}</td>
                    <td>${row.user_date_created || ''}</td>
                    <td>${row.user_date_updated || ''}</td>
                    <td>${row.batch || ''}</td>
                    <td>${row.school || ''}</td>
                    <td>${row.program_name || ''}</td>
                    <td>${row.internship_year || ''}</td>
                    <td>${row.internship_date_started || ''}</td>
                    <td>${row.internship_date_ended || ''}</td>
                    <td>${row.company_name || ''}</td>
                    <td>${row.department_name || ''}</td>
                    <td>${row.internship_job_role || ''}</td>
                    <td>${row.supervisor_name || ''}</td>
                    <td>${row.supervisor_email || ''}</td>
                    <td>${row.supervisor_contact_no || ''}</td>
                    <td>N/A</td> <!-- Replace with assessment logic -->
                `;

                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("💩 FETCH FAILED:", err);
        });
}

function rowManip() {
    const table = document.getElementById('internTable');
    const tbody = table.querySelector('tbody');

    table.addEventListener('paste', function (e) {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        const rows = paste.split('\n').filter(row => row.trim() !== '');

        const active = document.activeElement;

        let startRow = -1;
        let startCol = -1;

        [...tbody.rows].forEach((row, i) => {
            [...row.cells].forEach((cell, j) => {
                if (cell.contains(active)) {
                    startRow = i;
                    startCol = j;
                }
            });
        });

        if (startRow === -1 || startCol === -1) return;

        rows.forEach((rowData, i) => {
            const cols = rowData.split('\t');
            let row = tbody.rows[startRow + i];
            if (!row) {
                addRow();
                row = tbody.rows[startRow + i];
            }

            cols.forEach((value, j) => {
                const cell = row.cells[startCol + j];
                const input = cell?.querySelector('input, select');
                if (input) {
                    const val = value.trim();
                    if (input.type === 'date') {
                        input.value = formatExcelDateToISO(val);
                    } else {
                        input.value = val;
                    }

                    var inputEvent = new Event('input', { bubbles: true });
                    input.dispatchEvent(inputEvent);
                }
            });
        });
    });

    function formatExcelDateToISO(dateStr) {
        const parts = dateStr.trim().split(/[\/\-]/);
        if (parts.length === 3) {
            let [month, day, year] = parts.map(p => p.padStart(2, '0'));
            if (year.length === 2) year = '20' + year;
            if (year.length === 4 && +month <= 12 && +day <= 31) {
                return `${year}-${month}-${day}`;
            }
        }
        return '';
    }

    table.addEventListener('click', function (e) {
        if (e.target && e.target.classList.contains('removeRow')) {
            const row = e.target.closest('tr');
            if (row) {
                row.remove();
                updateRemoveButtonsVisibility();
            }
        }
    });
}

let rowCount = 1;

function addRow() {
    const table = document.getElementById('internTable').getElementsByTagName('tbody')[0];
    const firstRow = table.rows[0];
    const newRow = firstRow.cloneNode(true);

    rowCount++; // increase row count for new row

    // Clear input values in the cloned row & fix datalist IDs
    Array.from(newRow.querySelectorAll('input, select')).forEach(el => {
        if (el.tagName === 'SELECT') {
            el.selectedIndex = 0;
        } else {
            el.value = '';
        }
    });

    // Find the program input and datalist, update their IDs & list attributes to be unique
    const programInput = newRow.querySelector('.programInput');
    const oldListId = programInput.getAttribute('list'); // should be "programOptions"
    const newListId = `programOptionsRow${rowCount}`;

    // Change program input list attribute to new unique datalist ID
    programInput.setAttribute('list', newListId);

    // Find the old datalist element in the cloned row and update its ID
    const oldDatalist = newRow.querySelector(`#${oldListId}`);
    if (oldDatalist) {
        oldDatalist.id = newListId;
        oldDatalist.innerHTML = ''; // clear options to start fresh
    }

    table.appendChild(newRow);
    updateRemoveButtonsVisibility();
}

function updateRemoveButtonsVisibility() {
    const table = document.getElementById('internTable');
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    const removeHeader = table.querySelector('thead th:last-child');

    if (rows.length <= 1) {
        // Hide all remove buttons in this table
        tbody.querySelectorAll('.removeRow').forEach(btn => btn.style.display = 'none');

        // Hide the entire column in all rows and header
        removeHeader.style.display = 'none';
        rows.forEach(row => {
            const cell = row.querySelector('td:last-child');
            if (cell) cell.style.display = 'none';
        });
    } else {
        // Show the remove buttons again
        tbody.querySelectorAll('.removeRow').forEach(btn => btn.style.display = '');

        // Show the column again
        removeHeader.style.display = '';
        rows.forEach(row => {
            const cell = row.querySelector('td:last-child');
            if (cell) cell.style.display = '';
        });
    }
}

function validateAgainstOptions(input) {
    const val = input.value.toLowerCase();

    if (val.trim() === '') {
        input.dataset.closestMatch = '';
        input.dataset.closestDistance = '';
        return;
    }

    const listId = input.getAttribute('list');
    const list = listId ? document.getElementById(listId) : null;

    if (!list) {
        console.warn('No datalist found for input:', input, 'with list ID:', listId);
        input.dataset.closestMatch = '';
        input.dataset.closestDistance = '';
        return;
    }

    const options = [...list.options];

    const viable = options.filter(opt =>
        opt.value.toLowerCase().includes(val)
    );

    if (viable.length === 1) {
        input.value = viable[0].value;
        input.dataset.closestMatch = viable[0].value;
        input.dataset.closestDistance = 0;
        return;
    }

    let closest = '';
    let closestDistance = Infinity;

    for (const option of options) {
        const optionValue = option.value;
        const dist = levenshteinDistance(val, optionValue.toLowerCase());
        if (dist < closestDistance) {
            closestDistance = dist;
            closest = optionValue;
        }
    }

    input.dataset.closestMatch = closest;
    input.dataset.closestDistance = closestDistance;
}

function levenshteinDistance(a, b) {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }
    return matrix[b.length][a.length];
}
    
function findClosestOption(listId, val) {
    if (!val) return null;
    const list = document.getElementById(listId);
    if (!list) return null;
    const options = [...list.options];
    const valLower = val.toLowerCase();

    // First try substring match (viable)
    const viable = options.filter(opt => opt.value.toLowerCase().includes(valLower));
    if (viable.length === 1) return viable[0].value;

    // Otherwise find closest by Levenshtein distance
    let closest = null;
    let closestDistance = Infinity;

    for (const option of options) {
        const dist = levenshteinDistance(valLower, option.value.toLowerCase());
        if (dist < closestDistance) {
            closestDistance = dist;
            closest = option.value;
        }
    }

    // If closest distance is too big, reject (you decide threshold)
    if (closestDistance <= 3) return closest;
    return null;
}

function selectAutocomplete() {
    document.addEventListener('input', (e) => {
        if (e.target.matches('input[list]')) {
            validateAgainstOptions(e.target);

            if (e.target.classList.contains('schoolInput')) {
                const closest = e.target.dataset.closestMatch || '';
                const schoolId = getSchoolIdFromInput(closest);
            
                const row = e.target.closest('tr');
                const programInput = row.querySelector('.programInput');
                const programDatalistId = programInput?.getAttribute('list');
                const programOptions = document.getElementById(programDatalistId);
        
                if (schoolId) {
                    programInput.value = '';
                    if (programOptions) programOptions.innerHTML = '';
            
                    fetchProgramsBySchoolId(schoolId).then(programs => {    
                        if (programOptions) {
                            programOptions.innerHTML = programs.map(prog => `<option value="${prog.program_name}">`).join('');
                        
                            validateAgainstOptions(programInput);
                        }
                    });
                } else {
                    if (programInput) programInput.value = '';
                    if (programOptions) programOptions.innerHTML = '';
                }
            }
        }
    });

    document.getElementById('internTable').addEventListener('paste', function(e) {
        const target = e.target;
        if (!target.matches('input[list]')) return;
    
        e.preventDefault();
    
        const pasteText = (e.clipboardData || window.clipboardData).getData('text').trim();
        const pastedCols = pasteText.split('\t');
    
        const cell = target.closest('td');
        const row = target.closest('tr');
        const cellIndex = [...row.cells].indexOf(cell);
    
        for (let i = 0; i < pastedCols.length; i++) {
            const colIdx = cellIndex + i;
            const cellToFill = row.cells[colIdx];
            if (!cellToFill) break;
    
            const input = cellToFill.querySelector('input[list]');
            if (!input) continue;
    
            const val = pastedCols[i].trim();
            const closestOption = findClosestOption(input.getAttribute('list'), val);
    
            if (closestOption) {
                input.value = closestOption;
                input.dataset.closestMatch = closestOption;
                input.dataset.closestDistance = 0;
            } else {
                input.value = '';
                input.dataset.closestMatch = '';
                input.dataset.closestDistance = Infinity;
            }
    
            input.dispatchEvent(new Event('input', { bubbles: true }));

            if (input.classList.contains('schoolInput')) {
                const schoolId = getSchoolIdFromInput(closestOption);
                if (schoolId) {
                    const programInput = row.querySelector('.programInput');
            
                    if (programInput) {
                        const programDatalistId = programInput.getAttribute('list');
                        const programOptions = document.getElementById(programDatalistId);
            
                        programInput.value = '';
                        if (programOptions) programOptions.innerHTML = '';
            
                        fetchProgramsBySchoolId(schoolId).then(programs => {
                            // Populate programOptions for this row's datalist only!
                            if (programOptions) {
                                programOptions.innerHTML = programs.map(prog => `<option value="${prog.program_name}">`).join('');
                            }
                        });
                    }
                } else {
                    // No valid school: clear only this row's program input & datalist
                    const programInput = row.querySelector('.programInput');
                    if (programInput) {
                        const programDatalistId = programInput.getAttribute('list');
                        const programOptions = document.getElementById(programDatalistId);
            
                        programInput.value = '';
                        if (programOptions) programOptions.innerHTML = '';
                    }
                }
            }        
        }
    });

    document.addEventListener('blur', (e) => {
        if (e.target.matches('input[list]')) {
            const val = e.target.value.toLowerCase();

            if (!val) {
                e.target.dataset.closestMatch = '';
                e.target.dataset.closestDistance = '';
                e.target.value = '';
                return;
            }

            const closest = e.target.dataset.closestMatch;
            const dist = Number(e.target.dataset.closestDistance);

            if (closest && !isNaN(dist)) {
                if (dist < 3) {
                    e.target.value = closest;
                } else {
                    e.target.value = '';
                }
            } else {
                e.target.value = '';
            }
        }
    }, true);
}

function getSchoolIdFromInput(name) {
    const options = document.querySelectorAll('#schoolOptions option');
    for (const opt of options) {
        if (opt.value === name) return opt.dataset.id;
    }
    return null;
}
    
function fetchProgramsBySchoolId(schoolId) {
    return fetch(`masterlist~student.php?type=programs&school_id=${schoolId}`)
        .then(res => res.json());
}

function fetchDropdowns() {
    function fetchSchools() {
        fetch('masterlist~student.php?type=schools')
          .then(res => res.json())
          .then(schools => {
            const schoolOptions = document.getElementById('schoolOptions');
            schoolOptions.innerHTML = '';
            schools.forEach(school => {
              const opt = document.createElement('option');
              opt.value = school.school_name; // typable
              opt.dataset.id = school.school_id;
              schoolOptions.appendChild(opt);
            });
          });
    }
    fetchSchools();

    // Common handler for both input and paste events
    function handleSchoolChange(e) {
        if (!e.target.classList.contains('schoolInput')) return;
    
        const schoolName = e.target.value;
        const schoolId = getSchoolIdFromInput(schoolName);
    
        const row = e.target.closest('tr');
        if (!row) return;
    
        const programInput = row.querySelector('.programInput');
        const programDatalistId = programInput?.getAttribute('list');
        const programDatalist = programDatalistId ? document.getElementById(programDatalistId) : null;
    
        if (programInput) {
            programInput.value = '';
        }
        if (programDatalist) {
            programDatalist.innerHTML = '';
        }
    
        if (schoolId) {
            fetchProgramsBySchoolId(schoolId).then(programs => {
                if (programDatalist) {
                    programDatalist.innerHTML = programs.map(p => `<option value="${p.program_name}">`).join('');
                }
            });
        }
    }    
    
    // Listen for both input and paste events on the body, delegating to schoolInput elements
    document.body.addEventListener('input', handleSchoolChange);
    document.body.addEventListener('paste', handleSchoolChange);
}

function addIntern() {
    document.getElementById('bulkAddInternForm').addEventListener('submit', function (e) {
        // e.preventDefault();
    
        const formData = new FormData(this);
    
        fetch('masterlist~student.php?type=add_interns', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(json => {
            const result = json[0]; // first item in array
        
            if (result.status === 'success') {
                alert("Intern added successfully!");
            } else {
                alert("Error: " + result.error);
            }
        })
        .catch(err => {
            console.error(err);
            alert("Failed to submit interns.");
        });
    });
}