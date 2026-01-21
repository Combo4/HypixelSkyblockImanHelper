// Material Properties Database
const MATERIAL_PROPERTIES = {
    // Blocks (mining blocks drops their component items)
    "Enchanted Diamond Block": { type: "block", blockStrength: 2500, fortuneType: "block", spreadType: "mining", baseDrop: 9 },
    "Enchanted Gold Block": { type: "block", blockStrength: 2000, fortuneType: "block", spreadType: "mining", baseDrop: 9 },
    "Enchanted Iron Block": { type: "block", blockStrength: 2000, fortuneType: "block", spreadType: "mining", baseDrop: 9 },
    "Enchanted Redstone Block": { type: "block", blockStrength: 2500, fortuneType: "block", spreadType: "mining", baseDrop: 9 },
    "Enchanted Coal Block": { type: "block", blockStrength: 2000, fortuneType: "block", spreadType: "mining", baseDrop: 10 },
    
    // Enchanted items (crafted, not mined - mark as non_mineable)
    "Enchanted Diamond": { type: "non_mineable" },
    "Enchanted Gold": { type: "non_mineable" },
    "Enchanted Iron": { type: "non_mineable" },
    "Enchanted Redstone": { type: "non_mineable" },
    "Enchanted Coal": { type: "non_mineable" },
    
    // Dwarven Metals
    "Enchanted Mithril": { type: "dwarven_metal", blockStrength: 1500, fortuneType: "dwarven_metal", spreadType: "mining", baseDrop: 1 },
    "Enchanted Titanium": { type: "dwarven_metal", blockStrength: 2000, fortuneType: "dwarven_metal", spreadType: "mining", baseDrop: 1 },
    
    // Vanilla blocks (drop 9 of their base item when mined)
    "Coal Block": { type: "block", blockStrength: 600, fortuneType: "block", spreadType: "mining", baseDrop: 9 },
    "Iron Block": { type: "block", blockStrength: 1500, fortuneType: "block", spreadType: "mining", baseDrop: 9 },
    "Gold Block": { type: "block", blockStrength: 1500, fortuneType: "block", spreadType: "mining", baseDrop: 9 },
    "Diamond Block": { type: "block", blockStrength: 3000, fortuneType: "block", spreadType: "mining", baseDrop: 9 },
    "Redstone Block": { type: "block", blockStrength: 1500, fortuneType: "block", spreadType: "mining", baseDrop: 9 },
    
    // Ores and base materials (drop 1 item when mined)
    "Coal": { type: "ore", blockStrength: 600, fortuneType: "ore", spreadType: "mining", baseDrop: 1 },
    "Iron Ore": { type: "ore", blockStrength: 1500, fortuneType: "ore", spreadType: "mining", baseDrop: 1 },
    "Iron Ingot": { type: "ore", blockStrength: 1500, fortuneType: "ore", spreadType: "mining", baseDrop: 1 },
    "Gold Ore": { type: "ore", blockStrength: 1500, fortuneType: "ore", spreadType: "mining", baseDrop: 1 },
    "Gold Ingot": { type: "ore", blockStrength: 1500, fortuneType: "ore", spreadType: "mining", baseDrop: 1 },
    "Diamond Ore": { type: "ore", blockStrength: 3000, fortuneType: "ore", spreadType: "mining", baseDrop: 1 },
    "Diamond": { type: "ore", blockStrength: 3000, fortuneType: "ore", spreadType: "mining", baseDrop: 1 },
    "Redstone": { type: "ore", blockStrength: 1500, fortuneType: "ore", spreadType: "mining", baseDrop: 1 },
    
    // Dwarven base materials
    "Mithril": { type: "dwarven_metal", blockStrength: 1500, fortuneType: "dwarven_metal", spreadType: "mining", baseDrop: 1 },
    "Titanium": { type: "dwarven_metal", blockStrength: 2000, fortuneType: "dwarven_metal", spreadType: "mining", baseDrop: 1 },
    
    // Gemstones
    "Ruby": { type: "gemstone", blockStrength: 3200, fortuneType: "gemstone", spreadType: "gemstone", baseDrop: 4 },
    "Sapphire": { type: "gemstone", blockStrength: 3200, fortuneType: "gemstone", spreadType: "gemstone", baseDrop: 4 },
    "Jade": { type: "gemstone", blockStrength: 3200, fortuneType: "gemstone", spreadType: "gemstone", baseDrop: 4 },
    "Amethyst": { type: "gemstone", blockStrength: 3200, fortuneType: "gemstone", spreadType: "gemstone", baseDrop: 4 },
    "Amber": { type: "gemstone", blockStrength: 3200, fortuneType: "gemstone", spreadType: "gemstone", baseDrop: 4 },
    "Topaz": { type: "gemstone", blockStrength: 3200, fortuneType: "gemstone", spreadType: "gemstone", baseDrop: 4 },
    "Jasper": { type: "gemstone", blockStrength: 3200, fortuneType: "gemstone", spreadType: "gemstone", baseDrop: 4 },
    
    // Non-mineable materials (will be skipped in mining calculations)
    "Glacite Jewel": { type: "non_mineable" },
    "Treasurite": { type: "non_mineable" },
    "Plasma": { type: "non_mineable" },
    "Sludge Juice": { type: "non_mineable" },
    "Divan's Alloy": { type: "non_mineable" },
    "Fine Diamond": { type: "non_mineable" },
    "Fine Ruby": { type: "non_mineable" },
    "Fine Emerald": { type: "non_mineable" },
    "Fine Sapphire": { type: "non_mineable" },
    "Perfect Amber": { type: "non_mineable" },
    "Perfect Sapphire": { type: "non_mineable" },
    "Perfect Ruby": { type: "non_mineable" }
};

// Global state
let currentSchedule = null;
let currentData = null;
let miningProfiles = {
    fortune: null,
    spread: null
};

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
    loadMiningProfilesFromStorage();
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
    
    // Mining calculator button
    document.getElementById('calculate-mining-btn').addEventListener('click', calculateMiningTime);
    
    // Profile management buttons
    document.getElementById('save-profile-btn').addEventListener('click', saveMiningProfile);
    document.getElementById('load-profile-btn').addEventListener('click', loadMiningProfile);
    document.getElementById('mining-profile').addEventListener('change', onProfileChange);
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
        // Capture mining stats for auto-fill
        const miningStats = {
            mining_speed: document.getElementById('mining-speed').value,
            base_fortune: document.getElementById('base-fortune').value,
            block_fortune: document.getElementById('block-fortune').value,
            ore_fortune: document.getElementById('ore-fortune').value,
            dwarven_fortune: document.getElementById('dwarven-fortune').value,
            gemstone_fortune: document.getElementById('gemstone-fortune').value,
            pristine: document.getElementById('pristine').value,
            mining_spread: document.getElementById('mining-spread').value,
            gemstone_spread: document.getElementById('gemstone-spread').value,
            efficiency: document.getElementById('efficiency').value
        };

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
            mining_stats: miningStats,
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
            <h3>📦 Raw Materials Needed</h3>
            <ul class="materials-list">`;

    // Use expanded materials if available
    if (data.expanded_materials) {
        Object.entries(data.expanded_materials).sort().forEach(([item, info]) => {
            let chainText = '';
            let multiplierText = '';
            if (info.chain && info.chain.length > 0) {
                // Build chain string: "(320 Enchanted Diamonds → 51,200 Diamonds)"
                const chainParts = info.chain.map(link => 
                    `${link.quantity.toLocaleString()} ${link.material}${link.quantity > 1 ? 's' : ''}`
                );
                chainText = ` <span style="color: #888;">(→ ${chainParts.join(' → ')})</span>`;
                
                // Calculate total multiplier (multiply all multipliers in chain, then by quantity)
                const totalMultiplier = info.chain.reduce((product, link) => product * link.multiplier, 1) * info.quantity;
                if (totalMultiplier > 1) {
                    multiplierText = ` <span style="color: #ffaa00;">(x${totalMultiplier.toLocaleString()})</span>`;
                }
            }
            html += `<li>• ${item}: <strong>${info.quantity.toLocaleString()}</strong>${multiplierText}${chainText}</li>`;
        });
    } else {
        // Fallback to simple materials
        Object.entries(data.materials).sort().forEach(([item, qty]) => {
            html += `<li>• ${item}: <strong>${qty.toLocaleString()}</strong></li>`;
        });
    }

    html += `</ul>
        </div>

        <div class="summary-section">
            <h3>⏰ Time Estimate</h3>
            <div class="time-info">
                <p><strong>Forge Time:</strong></p>
                <p style="margin-left: 20px;">• Total Man-Hours: <strong>${data.total_hours}h</strong></p>
                <p style="margin-left: 20px;">• Calendar Time (${currentData.slots} slots): <strong>${data.calendar_days}d ${data.calendar_hours}h</strong></p>`;
    
    // Add mining time if available
    if (data.expanded_materials) {
        let materialsForMining = {};
        for (const [item, info] of Object.entries(data.expanded_materials)) {
            if (info.chain && info.chain.length > 0) {
                const deepest = info.chain[info.chain.length - 1];
                materialsForMining[deepest.material] = (materialsForMining[deepest.material] || 0) + deepest.quantity;
            } else {
                // No chain, check if it's mineable
                const props = MATERIAL_PROPERTIES[item];
                if (props && props.type !== 'non_mineable') {
                    materialsForMining[item] = info.quantity;
                }
            }
        }
        const miningData = calculateMiningBreakdown(materialsForMining);
        if (miningData.breakdown.length > 0) {
            html += `
                <p style="margin-top: 15px;"><strong>Resource Gathering Time:</strong> <span style="color: #ff6600;">${miningData.totalTime}</span></p>`;
        }
    }
    
    html += `
            </div>
        </div>

        <div class="summary-section">
            <h3>🔨 Forge Items Needed</h3>
            <ul class="materials-list">`;

    if (data.forge_materials && Object.keys(data.forge_materials).length > 0) {
        Object.entries(data.forge_materials).sort().forEach(([item, qty]) => {
            html += `<li>• ${item}: <strong>${qty}</strong></li>`;
        });
    } else {
        html += `<li style="color: #999; font-style: italic;">No intermediate forge items required</li>`;
    }

    html += `</ul></div>`;

    // Add Mining Breakdown Section (use deepest raw materials like the summary)
    let materialsForMining = {};
    if (data.expanded_materials) {
        // Use the deepest (most raw) material in each chain for mining calculation
        for (const [item, info] of Object.entries(data.expanded_materials)) {
            if (info.chain && info.chain.length > 0) {
                // Use the last item in chain (most raw)
                const deepest = info.chain[info.chain.length - 1];
                materialsForMining[deepest.material] = (materialsForMining[deepest.material] || 0) + deepest.quantity;
            } else {
                // No chain, use the material itself if it's mineable
                const props = MATERIAL_PROPERTIES[item];
                if (props && props.type !== 'non_mineable') {
                    materialsForMining[item] = info.quantity;
                }
            }
        }
    } else {
        materialsForMining = data.materials;
    }
    
    const miningData = calculateMiningBreakdown(materialsForMining);
    
    if (miningData.breakdown.length > 0) {
        html += `
        <div class="summary-section">
            <h3>⛏️ Resource Gathering Breakdown</h3>
            <p style="color: #999; font-size: 0.9em; margin-bottom: 10px;">Mining time for base materials (deepest in crafting chain)</p>
            <p style="color: #ff6600; font-size: 1.2em; margin-bottom: 15px;">
                Total Mining Time: <strong>${miningData.totalTime}</strong>
            </p>
            <table style="width: 100%; border-collapse: collapse; color: #ccc;">
                <thead>
                    <tr style="border-bottom: 2px solid #ff6600; text-align: left;">
                        <th style="padding: 8px;">Raw Material</th>
                        <th style="padding: 8px;">Raw Quantity Needed</th>
                        <th style="padding: 8px;">Fortune Type</th>
                        <th style="padding: 8px;">Blocks Needed</th>
                        <th style="padding: 8px;">Time</th>
                    </tr>
                </thead>
                <tbody>`;
        
        miningData.breakdown.forEach(item => {
            const fortuneColor = {
                'block': '#8B4513',
                'ore': '#C0C0C0', 
                'dwarven_metal': '#FFD700',
                'gemstone': '#FF1493'
            }[item.fortuneType] || '#999';
            
            html += `
                    <tr style="border-bottom: 1px solid #3a3a3a;">
                        <td style="padding: 8px;">${item.material}</td>
                        <td style="padding: 8px;">${item.quantity.toLocaleString()}</td>
                        <td style="padding: 8px; color: ${fortuneColor};">${item.fortuneType.replace('_', ' ')}</td>
                        <td style="padding: 8px;">${item.blocksNeeded.toLocaleString()} (${item.dropsPerBlock}/block)</td>
                        <td style="padding: 8px; color: #ffaa00;"><strong>${item.time}</strong></td>
                    </tr>`;
        });
        
        html += `
                </tbody>
            </table>
            <button onclick="switchTab('mining')" class="btn btn-primary" style="margin-top: 15px;">
                ⛏️ View Detailed Mining Calculator
            </button>
        </div>`;
    }

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
            
            // Restore mining stats
            if (data.mining_stats) {
                if (data.mining_stats.mining_speed) document.getElementById('mining-speed').value = data.mining_stats.mining_speed;
                if (data.mining_stats.base_fortune) document.getElementById('base-fortune').value = data.mining_stats.base_fortune;
                if (data.mining_stats.block_fortune) document.getElementById('block-fortune').value = data.mining_stats.block_fortune;
                if (data.mining_stats.ore_fortune) document.getElementById('ore-fortune').value = data.mining_stats.ore_fortune;
                if (data.mining_stats.dwarven_fortune) document.getElementById('dwarven-fortune').value = data.mining_stats.dwarven_fortune;
                if (data.mining_stats.gemstone_fortune) document.getElementById('gemstone-fortune').value = data.mining_stats.gemstone_fortune;
                if (data.mining_stats.pristine) document.getElementById('pristine').value = data.mining_stats.pristine;
                if (data.mining_stats.mining_spread) document.getElementById('mining-spread').value = data.mining_stats.mining_spread;
                if (data.mining_stats.gemstone_spread) document.getElementById('gemstone-spread').value = data.mining_stats.gemstone_spread;
                if (data.mining_stats.efficiency) document.getElementById('efficiency').value = data.mining_stats.efficiency;
            }
            
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

// Mining Time Calculator (Enhanced with fortune types and spread)
function calculateMiningTime() {
    const materialSelect = document.getElementById('material-select').value;
    const miningSpeed = parseFloat(document.getElementById('mining-speed').value);
    const baseFortune = parseFloat(document.getElementById('base-fortune').value) || 0;
    const blockFortune = parseFloat(document.getElementById('block-fortune').value) || 0;
    const oreFortune = parseFloat(document.getElementById('ore-fortune').value) || 0;
    const dwarvenFortune = parseFloat(document.getElementById('dwarven-fortune').value) || 0;
    const gemstoneFortune = parseFloat(document.getElementById('gemstone-fortune').value) || 0;
    const pristine = parseFloat(document.getElementById('pristine').value) || 0;
    const oreSpread = parseFloat(document.getElementById('ore-spread').value) || 0;
    const blockSpread = parseFloat(document.getElementById('block-spread').value) || 0;
    const dwarvenSpread = parseFloat(document.getElementById('dwarven-spread').value) || 0;
    const gemstoneSpread = parseFloat(document.getElementById('gemstone-spread').value) || 0;
    const efficiency = parseFloat(document.getElementById('efficiency').value) / 100;
    const targetQuantity = parseFloat(document.getElementById('target-quantity').value);

    if (!materialSelect || !miningSpeed) {
        showToast('Please select a material and enter mining speed', 'error');
        return;
    }

    // Extract block strength from material value
    const blockStrength = parseFloat(materialSelect.split('-')[1]);
    const isGemstone = materialSelect.includes('ruby') || materialSelect.includes('sapphire') || 
                       materialSelect.includes('jade') || materialSelect.includes('amethyst') || 
                       materialSelect.includes('amber') || materialSelect.includes('topaz') || 
                       materialSelect.includes('jasper');

    // Determine fortune type and spread value
    let totalFortune = baseFortune;
    let spreadValue = 0;
    
    if (isGemstone) {
        totalFortune += gemstoneFortune;
        spreadValue = gemstoneSpread;
    } else if (materialSelect.includes('mithril') || materialSelect.includes('titanium')) {
        totalFortune += dwarvenFortune;
        spreadValue = dwarvenSpread;
    } else if (materialSelect.includes('coal') || materialSelect.includes('iron') || 
               materialSelect.includes('gold') || materialSelect.includes('diamond') ||
               materialSelect.includes('redstone')) {
        // Check if it's a block or ore
        if (materialSelect.includes('coal-') || materialSelect.includes('iron-') || 
            materialSelect.includes('gold-') || materialSelect.includes('diamond-') ||
            materialSelect.includes('redstone-')) {
            // It's a block (has block strength in name)
            totalFortune += blockFortune;
            spreadValue = blockSpread;
        } else {
            // It's an ore
            totalFortune += oreFortune;
            spreadValue = oreSpread;
        }
    } else {
        // Default to block (e.g., hardstone)
        totalFortune += blockFortune;
        spreadValue = blockSpread;
    }

    // Calculate mining time in ticks (rounded to nearest integer per wiki)
    let ticks = Math.round((blockStrength * 30) / miningSpeed);
    
    // Softcap: minimum 4 ticks
    if (ticks < 4) ticks = 4;
    
    // Convert to seconds (divide by 20 per wiki formula)
    const breakTimeSeconds = ticks / 20;

    // Calculate spread multiplier
    let spreadMultiplier = 1;
    if (spreadValue > 0) {
        const guaranteedBlocks = Math.floor(spreadValue / 100);
        const chancePercent = spreadValue % 100;
        spreadMultiplier = 1 + guaranteedBlocks + (chancePercent / 100);
    }

    // Calculate drops per block
    let dropsPerBlock;
    if (isGemstone) {
        // Base gemstone drops: 3-5, average = 4
        const baseDrop = 4;
        
        // Mining fortune multiplier
        const fortuneMultiplier = 1 + (totalFortune / 100);
        
        // Rough gemstones from fortune
        const roughGems = baseDrop * fortuneMultiplier;
        
        // Pristine bonus: each rough gem has pristine% chance to become flawed
        const pristineBonus = pristine / 100 * 0.79;
        dropsPerBlock = roughGems * (1 + pristineBonus) * spreadMultiplier;
    } else {
        // Non-gemstone: simple fortune multiplication
        const baseDrop = 1;
        dropsPerBlock = baseDrop * (1 + (totalFortune / 100)) * spreadMultiplier;
    }

    // Calculate blocks needed
    const blocksNeeded = Math.ceil(targetQuantity / dropsPerBlock);

    // Calculate blocks per hour with efficiency
    const blocksPerHourTheoretical = 3600 / breakTimeSeconds;
    const blocksPerHourActual = blocksPerHourTheoretical * efficiency;

    // Calculate time needed
    const hoursNeeded = blocksNeeded / blocksPerHourActual;
    const minutesNeeded = hoursNeeded * 60;

    // Format time estimate
    let timeEstimate;
    if (hoursNeeded >= 1) {
        const hours = Math.floor(hoursNeeded);
        const minutes = Math.floor((hoursNeeded - hours) * 60);
        timeEstimate = `${hours}h ${minutes}m`;
    } else {
        timeEstimate = `${Math.ceil(minutesNeeded)}m`;
    }

    // Display results
    const spreadInfo = spreadMultiplier > 1 ? ` (×${spreadMultiplier.toFixed(2)} spread)` : '';
    document.getElementById('break-ticks').textContent = `${ticks} ticks (${(ticks / 20).toFixed(3)}s)`;
    document.getElementById('drops-per-block').textContent = `${dropsPerBlock.toFixed(2)}${spreadInfo}`;
    document.getElementById('blocks-needed').textContent = blocksNeeded.toLocaleString();
    document.getElementById('blocks-per-hour').textContent = Math.floor(blocksPerHourActual).toLocaleString();
    document.getElementById('mining-time').textContent = timeEstimate;
    document.getElementById('mining-results').style.display = 'block';

    showToast('Mining time calculated!');
}

// Calculate mining breakdown for all raw materials
function calculateMiningBreakdown(materials) {
    const miningSpeed = parseFloat(document.getElementById('mining-speed').value) || 5000;
    const baseFortune = parseFloat(document.getElementById('base-fortune').value) || 200;
    const blockFortune = parseFloat(document.getElementById('block-fortune').value) || 0;
    const oreFortune = parseFloat(document.getElementById('ore-fortune').value) || 0;
    const dwarvenFortune = parseFloat(document.getElementById('dwarven-fortune').value) || 0;
    const gemstoneFortune = parseFloat(document.getElementById('gemstone-fortune').value) || 0;
    const pristine = parseFloat(document.getElementById('pristine').value) || 0;
    const oreSpread = parseFloat(document.getElementById('ore-spread').value) || 0;
    const blockSpread = parseFloat(document.getElementById('block-spread').value) || 0;
    const dwarvenSpread = parseFloat(document.getElementById('dwarven-spread').value) || 0;
    const gemstoneSpread = parseFloat(document.getElementById('gemstone-spread').value) || 0;
    const efficiency = parseFloat(document.getElementById('efficiency').value) / 100 || 0.5;

    const breakdown = [];
    let totalMinutes = 0;

    for (const [materialName, quantity] of Object.entries(materials)) {
        // Auto-select block variant if it exists (e.g., Coal -> Coal Block)
        let actualMaterial = materialName;
        const blockVariant = materialName + " Block";
        if (MATERIAL_PROPERTIES[blockVariant] && MATERIAL_PROPERTIES[blockVariant].type === 'block') {
            actualMaterial = blockVariant;
        }
        
        const props = MATERIAL_PROPERTIES[actualMaterial];
        
        // Skip non-mineable materials
        if (!props || props.type === 'non_mineable') {
            continue;
        }

        // Determine total fortune and spread based on material type
        let totalFortune = baseFortune;
        let spreadValue = 0;
        
        if (props.fortuneType === 'gemstone') {
            totalFortune += gemstoneFortune;
            spreadValue = gemstoneSpread;
        } else if (props.fortuneType === 'dwarven_metal') {
            totalFortune += dwarvenFortune;
            spreadValue = dwarvenSpread;
        } else if (props.fortuneType === 'ore') {
            totalFortune += oreFortune;
            spreadValue = oreSpread;
        } else if (props.fortuneType === 'block') {
            totalFortune += blockFortune;
            spreadValue = blockSpread;
        }

        // Calculate mining time in ticks (rounded to nearest integer per wiki)
        let ticks = Math.round((props.blockStrength * 30) / miningSpeed);
        if (ticks < 4) ticks = 4;
        const breakTimeSeconds = ticks / 20;

        // Calculate spread multiplier
        let spreadMultiplier = 1;
        if (spreadValue > 0) {
            const guaranteedBlocks = Math.floor(spreadValue / 100);
            const chancePercent = spreadValue % 100;
            spreadMultiplier = 1 + guaranteedBlocks + (chancePercent / 100);
        }

        // Calculate drops per block
        let dropsPerBlock;
        if (props.fortuneType === 'gemstone') {
            const baseDrop = props.baseDrop || 4;
            const fortuneMultiplier = 1 + (totalFortune / 100);
            const roughGems = baseDrop * fortuneMultiplier;
            const pristineBonus = pristine / 100 * 0.79;
            dropsPerBlock = roughGems * (1 + pristineBonus) * spreadMultiplier;
        } else {
            const baseDrop = props.baseDrop || 1;
            dropsPerBlock = baseDrop * (1 + (totalFortune / 100)) * spreadMultiplier;
        }

        // Calculate blocks needed and time
        const blocksNeeded = Math.ceil(quantity / dropsPerBlock);
        const blocksPerHourActual = (3600 / breakTimeSeconds) * efficiency;
        const hoursNeeded = blocksNeeded / blocksPerHourActual;
        const minutesNeeded = hoursNeeded * 60;

        totalMinutes += minutesNeeded;

        // Format time
        let timeStr;
        if (hoursNeeded >= 1) {
            const hours = Math.floor(hoursNeeded);
            const minutes = Math.floor((hoursNeeded - hours) * 60);
            timeStr = `${hours}h ${minutes}m`;
        } else {
            timeStr = `${Math.ceil(minutesNeeded)}m`;
        }

        breakdown.push({
            material: actualMaterial,
            quantity: quantity,
            fortuneType: props.fortuneType,
            blocksNeeded: blocksNeeded,
            dropsPerBlock: dropsPerBlock.toFixed(2),
            time: timeStr,
            minutes: minutesNeeded
        });
    }

    // Format total time
    let totalTimeStr;
    if (totalMinutes >= 60) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);
        totalTimeStr = `${hours}h ${minutes}m`;
    } else {
        totalTimeStr = `${Math.ceil(totalMinutes)}m`;
    }

    return { breakdown, totalTime: totalTimeStr, totalMinutes };
}

// Mining Profile Management
function getMiningStats() {
    return {
        mining_speed: document.getElementById('mining-speed').value,
        base_fortune: document.getElementById('base-fortune').value,
        block_fortune: document.getElementById('block-fortune').value,
        ore_fortune: document.getElementById('ore-fortune').value,
        dwarven_fortune: document.getElementById('dwarven-fortune').value,
        gemstone_fortune: document.getElementById('gemstone-fortune').value,
        pristine: document.getElementById('pristine').value,
        ore_spread: document.getElementById('ore-spread').value,
        block_spread: document.getElementById('block-spread').value,
        dwarven_spread: document.getElementById('dwarven-spread').value,
        gemstone_spread: document.getElementById('gemstone-spread').value,
        efficiency: document.getElementById('efficiency').value
    };
}

function setMiningStats(stats) {
    if (stats.mining_speed) document.getElementById('mining-speed').value = stats.mining_speed;
    if (stats.base_fortune) document.getElementById('base-fortune').value = stats.base_fortune;
    if (stats.block_fortune) document.getElementById('block-fortune').value = stats.block_fortune;
    if (stats.ore_fortune) document.getElementById('ore-fortune').value = stats.ore_fortune;
    if (stats.dwarven_fortune) document.getElementById('dwarven-fortune').value = stats.dwarven_fortune;
    if (stats.gemstone_fortune) document.getElementById('gemstone-fortune').value = stats.gemstone_fortune;
    if (stats.pristine) document.getElementById('pristine').value = stats.pristine;
    if (stats.ore_spread) document.getElementById('ore-spread').value = stats.ore_spread;
    if (stats.block_spread) document.getElementById('block-spread').value = stats.block_spread;
    if (stats.dwarven_spread) document.getElementById('dwarven-spread').value = stats.dwarven_spread;
    if (stats.gemstone_spread) document.getElementById('gemstone-spread').value = stats.gemstone_spread;
    if (stats.efficiency) document.getElementById('efficiency').value = stats.efficiency;
}

function saveMiningProfile() {
    const profileSelect = document.getElementById('mining-profile');
    const profileType = profileSelect.value;
    
    if (profileType === 'current') {
        showToast('Select "Fortune Setup" or "Spread Setup" to save', 'error');
        return;
    }
    
    const stats = getMiningStats();
    miningProfiles[profileType] = stats;
    
    // Save to localStorage
    localStorage.setItem('miningProfiles', JSON.stringify(miningProfiles));
    
    showToast(`${profileType.charAt(0).toUpperCase() + profileType.slice(1)} profile saved!`);
}

function loadMiningProfile() {
    const profileSelect = document.getElementById('mining-profile');
    const profileType = profileSelect.value;
    
    if (profileType === 'current') {
        showToast('Select a profile to load', 'error');
        return;
    }
    
    const profile = miningProfiles[profileType];
    if (!profile) {
        showToast(`No ${profileType} profile saved`, 'error');
        return;
    }
    
    setMiningStats(profile);
    showToast(`${profileType.charAt(0).toUpperCase() + profileType.slice(1)} profile loaded!`);
}

function onProfileChange() {
    const profileSelect = document.getElementById('mining-profile');
    const profileType = profileSelect.value;
    
    if (profileType !== 'current') {
        if (miningProfiles[profileType]) {
            setMiningStats(miningProfiles[profileType]);
            showToast(`Switched to ${profileType} profile`);
        } else {
            showToast(`No ${profileType} profile saved. Please save one first.`, 'error');
        }
    }
}

// Load profiles from localStorage on page load
function loadMiningProfilesFromStorage() {
    try {
        const saved = localStorage.getItem('miningProfiles');
        if (saved) {
            miningProfiles = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Failed to load mining profiles:', error);
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
