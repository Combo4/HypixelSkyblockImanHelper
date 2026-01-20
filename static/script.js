// Global state
let currentSchedule = null;
let currentData = null;

// DOM Elements
const categorySelect = document.getElementById('category');
const itemSelect = document.getElementById('item');
const slotsInput = document.getElementById('forge-slots');
const quickForgeCheckbox = document.getElementById('quick-forge');
const coleCheckbox = document.getElementById('cole');
const startTimeInput = document.getElementById('start-time');
const sleepTimeInput = document.getElementById('sleep-time');
const wakeTimeInput = document.getElementById('wake-time');
const optimizeSleepCheckbox = document.getElementById('optimize-sleep');
const calculateBtn = document.getElementById('calculate-btn');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const resetBtn = document.getElementById('reset-btn');
const calendarView = document.getElementById('calendar-view');
const summaryView = document.getElementById('summary-view');
const toast = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    setupEventListeners();
    setCurrentTime();
    autoLoadFromBrowser();
});

// Set current time as default
function setCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    startTimeInput.value = `${hours}:${minutes}`;
}

// Setup Event Listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Category change
    categorySelect.addEventListener('change', () => {
        loadItems(categorySelect.value);
    });

    // Action buttons
    calculateBtn.addEventListener('click', calculate);
    saveBtn.addEventListener('click', saveSchedule);
    loadBtn.addEventListener('click', loadSchedule);
    resetBtn.addEventListener('click', resetCompletion);
}

// Tab Switching
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Load Categories
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();

        categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        showToast('Failed to load categories', 'error');
    }
}

// Load Items
async function loadItems(category) {
    if (!category) {
        itemSelect.innerHTML = '<option value="">-- Select Item --</option>';
        return;
    }

    try {
        const response = await fetch(`/api/items/${category}`);
        const items = await response.json();

        itemSelect.innerHTML = '<option value="">-- Select Item --</option>';
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            itemSelect.appendChild(option);
        });
    } catch (error) {
        showToast('Failed to load items', 'error');
    }
}

// Calculate
async function calculate() {
    const item = itemSelect.value;
    const category = categorySelect.value;
    const slots = parseInt(slotsInput.value);
    const quickForge = quickForgeCheckbox.checked;
    const cole = coleCheckbox.checked;
    const startTime = startTimeInput.value;
    const sleepTime = sleepTimeInput.value;
    const wakeTime = wakeTimeInput.value;
    const optimizeSleep = optimizeSleepCheckbox.checked;

    if (!item || !category) {
        showToast('Please select a category and item', 'error');
        return;
    }

    try {
        calculateBtn.disabled = true;
        calculateBtn.innerHTML = '<span class="loading"></span> Calculating...';

        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                item, 
                category, 
                slots, 
                quick_forge: quickForge, 
                cole,
                start_time: startTime,
                sleep_time: sleepTime,
                wake_time: wakeTime,
                optimize_sleep: optimizeSleep
            })
        });

        const data = await response.json();
        currentSchedule = data.schedule;
        currentData = { 
            item, 
            category, 
            slots, 
            quick_forge: quickForge, 
            cole,
            start_time: startTime,
            sleep_time: sleepTime,
            wake_time: wakeTime,
            optimize_sleep: optimizeSleep,
            ...data 
        };

        renderCalendar(data.schedule, item);
        renderSummary(data);
        autoSaveToBrowser();
        showToast('Calculation complete!');
    } catch (error) {
        showToast('Calculation failed', 'error');
    } finally {
        calculateBtn.disabled = false;
        calculateBtn.innerHTML = '🔨 Calculate';
    }
}

// Render Calendar
function renderCalendar(schedule, itemName) {
    if (!schedule || schedule.length === 0) {
        calendarView.innerHTML = '<p class="placeholder-text">No forge tasks needed for this item.</p>';
        return;
    }

    let html = `<h3 style="grid-column: 1/-1; text-align: center; color: #ffaa00; font-size: 1.5em;">
                    Forge Schedule for: ${itemName}
                </h3>`;

    schedule.forEach((slotTasks, slotIndex) => {
        const incompleteTasks = slotTasks.filter(t => !t.completed);
        const completedTasks = slotTasks.filter(t => t.completed);
        const nextTasks = incompleteTasks.slice(0, 5);
        const remainingTasks = incompleteTasks.slice(5);
        
        // Show only the last completed task (most recent)
        const lastCompleted = completedTasks.length > 0 ? [completedTasks[completedTasks.length - 1]] : [];
        const hiddenCompleted = completedTasks.slice(0, -1); // All except the last one
        
        const hasMore = remainingTasks.length > 0 || hiddenCompleted.length > 0;

        html += `<div class="slot-card">
                    <h3 onclick="toggleSlot(${slotIndex})" style="cursor: pointer;">
                        Slot ${slotIndex + 1} 
                        <span class="slot-toggle" id="toggle-${slotIndex}">▼</span>
                        <span style="font-size: 0.8em; color: #999;"> (${incompleteTasks.length} pending, ${completedTasks.length} done)</span>
                    </h3>
                    <div class="slot-tasks" id="slot-${slotIndex}">`;

        if (slotTasks.length === 0) {
            html += '<p style="color: #999; font-style: italic; padding: 10px;">Empty</p>';
        } else {
            // Show next 5 incomplete tasks
            nextTasks.forEach((task, taskIndex) => {
                const actualIndex = slotTasks.indexOf(task);
                html += renderTask(task, slotIndex, actualIndex, false);
            });
            
            // Show last completed task (most recent)
            if (lastCompleted.length > 0) {
                const actualIndex = slotTasks.indexOf(lastCompleted[0]);
                html += renderTask(lastCompleted[0], slotIndex, actualIndex, true);
            }

            // Hidden section for remaining and older completed tasks
            if (hasMore) {
                html += `<div class="collapsed-tasks" id="collapsed-${slotIndex}" style="display: none;">`;
                
                // Remaining incomplete tasks
                remainingTasks.forEach((task) => {
                    const actualIndex = slotTasks.indexOf(task);
                    html += renderTask(task, slotIndex, actualIndex, false);
                });
                
                // Older completed tasks (all except the last one)
                hiddenCompleted.forEach((task) => {
                    const actualIndex = slotTasks.indexOf(task);
                    html += renderTask(task, slotIndex, actualIndex, true);
                });
                
                html += '</div>';
                
                html += `<button class="show-more-btn" onclick="toggleCollapsed(${slotIndex})">
                            <span id="btn-text-${slotIndex}">Show ${remainingTasks.length + hiddenCompleted.length} More</span>
                            <span id="btn-icon-${slotIndex}">▼</span>
                        </button>`;
            }
        }

        html += '</div></div>';
    });

    calendarView.innerHTML = html;
}

// Render individual task
function renderTask(task, slotIndex, taskIndex, isCompleted) {
    const hours = Math.floor(task.start);
    const minutes = Math.floor((task.start - hours) * 60);
    const durationH = Math.floor(task.duration);
    const durationM = Math.floor((task.duration - durationH) * 60);

    const status = task.completed ? '✓' : '○';
    const completedClass = task.completed ? 'completed' : '';
    
    // Calculate queue number based on task position
    const queueNumber = taskIndex + 1;
    const queueDisplay = task.completed ? '' : `<span class="queue-number">#${queueNumber}</span>`;

    return `<div class="task-item ${completedClass}" data-slot="${slotIndex}" data-task="${taskIndex}">
                <input type="checkbox" class="task-checkbox" 
                       ${task.completed ? 'checked' : ''}
                       onchange="toggleTaskCompletion(${slotIndex}, ${taskIndex})">
                <div class="task-info">
                    <div class="task-name">
                        ${queueDisplay}
                        ${status} ${task.name}
                    </div>
                    <div class="task-time">
                        Start: ${String(hours).padStart(2, '0')}h${String(minutes).padStart(2, '0')}m | 
                        Duration: ${durationH}h${durationM}m
                    </div>
                </div>
            </div>`;
}

// Render Summary
function renderSummary(data) {
    let html = `
        <div class="summary-section">
            <h3>📊 Total Raw Materials Needed</h3>
            <ul class="materials-list">`;

    Object.entries(data.materials).sort().forEach(([item, qty]) => {
        html += `<li>• ${item}: <strong>${qty.toLocaleString()}</strong></li>`;
    });

    html += `</ul>
        </div>

        <div class="summary-section">
            <h3>⏰ Time Estimate</h3>
            <div class="time-info">
                <p>Total Man-Hours: ${data.total_hours}h</p>
                <p>Calendar Time (${currentData.slots} slots): ${data.calendar_days}d, ${data.calendar_hours}h</p>
            </div>
        </div>

        <div class="summary-section">
            <h3>💡 Efficiency Tips</h3>
            <ul class="tips-list">`;

    data.tips.forEach(tip => {
        html += `<li>• ${tip}</li>`;
    });

    html += `</ul></div>`;

    summaryView.innerHTML = html;
}

// Toggle Task Completion
function toggleTaskCompletion(slotIndex, taskIndex) {
    if (currentSchedule && currentSchedule[slotIndex] && currentSchedule[slotIndex][taskIndex]) {
        currentSchedule[slotIndex][taskIndex].completed = !currentSchedule[slotIndex][taskIndex].completed;
        renderCalendar(currentSchedule, currentData.item);
        autoSaveToBrowser();
    }
}

// Auto-save to browser localStorage
function autoSaveToBrowser() {
    if (!currentData) return;
    
    try {
        localStorage.setItem('forgeCalculatorData', JSON.stringify(currentData));
        console.log('Auto-saved to browser');
    } catch (error) {
        console.error('Auto-save failed:', error);
    }
}

// Auto-load from browser localStorage on page load
function autoLoadFromBrowser() {
    try {
        const saved = localStorage.getItem('forgeCalculatorData');
        if (saved) {
            const data = JSON.parse(saved);
            
            // Restore settings
            if (data.category) categorySelect.value = data.category;
            if (data.slots) slotsInput.value = data.slots;
            if (data.quick_forge !== undefined) quickForgeCheckbox.checked = data.quick_forge;
            if (data.cole !== undefined) coleCheckbox.checked = data.cole;
            if (data.start_time) startTimeInput.value = data.start_time;
            if (data.sleep_time) sleepTimeInput.value = data.sleep_time;
            if (data.wake_time) wakeTimeInput.value = data.wake_time;
            if (data.optimize_sleep !== undefined) optimizeSleepCheckbox.checked = data.optimize_sleep;
            
            // Restore item after category is set
            if (data.category && data.item) {
                setTimeout(async () => {
                    await loadItems(data.category);
                    itemSelect.value = data.item;
                    
                    // Restore schedule
                    currentSchedule = data.schedule;
                    currentData = data;
                    
                    if (data.schedule && data.item) {
                        renderCalendar(data.schedule, data.item);
                        renderSummary(data);
                        console.log('Auto-loaded from browser');
                    }
                }, 100);
            }
        }
    } catch (error) {
        console.error('Auto-load failed:', error);
    }
}

// Save Schedule (legacy - now also saves to browser)
async function saveSchedule() {
    if (!currentData) {
        showToast('No schedule to save. Calculate first.', 'error');
        return;
    }

    // Save to browser
    autoSaveToBrowser();
    
    // Also save to server file
    try {
        const response = await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentData)
        });

        const result = await response.json();
        if (result.success) {
            showToast('Schedule saved to browser & file!');
        }
    } catch (error) {
        showToast('Saved to browser only', 'error');
    }
}

// Load Schedule
async function loadSchedule() {
    try {
        const response = await fetch('/api/load');
        const result = await response.json();

        if (result.success) {
            const data = result.data;

            // Restore settings
            categorySelect.value = data.category;
            await loadItems(data.category);
            itemSelect.value = data.item;
            slotsInput.value = data.slots;
            quickForgeCheckbox.checked = data.quick_forge;
            coleCheckbox.checked = data.cole;

            // Restore schedule
            currentSchedule = data.schedule;
            currentData = data;

            renderCalendar(data.schedule, data.item);
            renderSummary(data);

            showToast('Schedule loaded successfully!');
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Failed to load schedule', 'error');
    }
}

// Reset Everything
function resetCompletion() {
    // Clear selections
    categorySelect.value = '';
    itemSelect.innerHTML = '<option value="">-- Select Item --</option>';
    
    // Clear schedule
    currentSchedule = null;
    currentData = null;
    
    // Clear browser storage
    localStorage.removeItem('forgeCalculatorData');
    
    // Clear calendar view
    calendarView.innerHTML = '<p class="placeholder-text">No schedule generated yet. Select an item and click Calculate to begin.</p>';
    
    // Clear summary view
    summaryView.innerHTML = '<p class="placeholder-text">Summary will appear here after calculation.</p>';
    
    showToast('Calculator reset!');
}

// Toggle slot collapse
function toggleSlot(slotIndex) {
    const slotContent = document.getElementById(`slot-${slotIndex}`);
    const toggle = document.getElementById(`toggle-${slotIndex}`);
    
    if (slotContent.style.display === 'none') {
        slotContent.style.display = 'block';
        toggle.textContent = '▼';
    } else {
        slotContent.style.display = 'none';
        toggle.textContent = '▶';
    }
}

// Toggle collapsed tasks visibility
function toggleCollapsed(slotIndex) {
    const collapsed = document.getElementById(`collapsed-${slotIndex}`);
    const btnText = document.getElementById(`btn-text-${slotIndex}`);
    const btnIcon = document.getElementById(`btn-icon-${slotIndex}`);
    
    if (collapsed.style.display === 'none') {
        collapsed.style.display = 'block';
        btnText.textContent = 'Show Less';
        btnIcon.textContent = '▲';
    } else {
        collapsed.style.display = 'none';
        const count = collapsed.querySelectorAll('.task-item').length;
        btnText.textContent = `Show ${count} More`;
        btnIcon.textContent = '▼';
    }
}

// Show Toast Notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
