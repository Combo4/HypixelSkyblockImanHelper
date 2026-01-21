from flask import Flask, render_template, request, jsonify, session
import json
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'skyblock_forge_secret_key_2026'

# Intermediate Components (Materials + Base Time in Hours)
COMPONENTS = {
    "Golden Plate": {"mats": {"Enchanted Gold Block": 2, "Refined Diamond": 1, "Glacite Jewel": 5}, "time": 6},
    "Mithril Plate": {"mats": {"Enchanted Iron Block": 1, "Refined Mithril": 5, "Golden Plate": 1, "Refined Titanium": 1}, "time": 18},
    "Refined Diamond": {"mats": {"Enchanted Diamond Block": 2}, "time": 8},
    "Refined Mithril": {"mats": {"Enchanted Mithril": 160}, "time": 6},
    "Refined Titanium": {"mats": {"Enchanted Titanium": 16}, "time": 12},
    "Fuel Canister": {"mats": {"Enchanted Coal Block": 2}, "time": 10},
    "Drill Motor": {"mats": {"Enchanted Iron Block": 1, "Enchanted Redstone Block": 3, "Golden Plate": 1, "Treasurite": 10}, "time": 30},
    "Gemstone Mixture": {"mats": {"Fine Diamond": 4, "Fine Ruby": 4, "Fine Emerald": 4, "Fine Sapphire": 4, "Sludge Juice": 320}, "time": 4},
    "Precursor Apparatus": {"mats": {}, "time": 0}
}

# Full Tree Data (times in hours)
DATA = {
    "Drills": {
        "Divan's Drill": {"mats": {"Titanium Drill DR-X655": 1, "Divan's Alloy": 1}, "time": 30/3600},
        "Titanium Drill DR-X655": {"mats": {"Titanium Drill DR-X555": 1, "Refined Diamond": 10, "Refined Titanium": 16, "Enchanted Iron Block": 10, "Mithril Plate": 6}, "time": 30/3600},
        "Titanium Drill DR-X555": {"mats": {"Titanium Drill DR-X455": 1, "Refined Diamond": 10, "Refined Titanium": 16, "Enchanted Iron Block": 2, "Mithril Plate": 10}, "time": 30/3600},
        "Titanium Drill DR-X455": {"mats": {"Titanium Drill DR-X355": 1, "Refined Diamond": 10, "Refined Titanium": 12, "Enchanted Iron Block": 5, "Mithril Plate": 5}, "time": 30/3600},
        "Titanium Drill DR-X355": {"mats": {"Drill Motor": 1, "Fuel Canister": 1, "Golden Plate": 6, "Refined Titanium": 8, "Refined Mithril": 8}, "time": 4},
        "Mithril Drill SX-R326": {"mats": {"Mithril Drill SX-R226": 1, "Golden Plate": 1, "Mithril Plate": 1}, "time": 30/3600},
        "Mithril Drill SX-R226": {"mats": {"Refined Mithril": 3, "Fuel Canister": 1, "Drill Motor": 1}, "time": 4}
    },
    "Fuel Tanks": {
        "Perfectly-Cut Fuel Tank": {"mats": {"Gemstone Fuel Tank": 1, "Precursor Apparatus": 16, "Gemstone Mixture": 25, "Plasma": 32}, "time": 30/3600},
        "Gemstone Fuel Tank": {"mats": {"Titanium-Infused Fuel Tank": 1, "Precursor Apparatus": 4, "Gemstone Mixture": 10}, "time": 30/3600},
        "Titanium-Infused Fuel Tank": {"mats": {"Mithril-Infused Fuel Tank": 1, "Refined Titanium": 10}, "time": 20},
        "Mithril-Infused Fuel Tank": {"mats": {"Refined Diamond": 5, "Refined Mithril": 10}, "time": 10}
    },
    "Engines": {
        "Amber-Polished Engine": {"mats": {"Sapphire-Polished Engine": 1, "Perfect Amber": 5, "Precursor Apparatus": 16, "Drill Motor": 5, "Plasma": 32}, "time": 30/3600},
        "Sapphire-Polished Engine": {"mats": {"Ruby-Polished Engine": 1, "Perfect Sapphire": 3, "Precursor Apparatus": 8, "Drill Motor": 5}, "time": 30/3600},
        "Ruby-Polished Engine": {"mats": {"Titanium-Plated Engine": 1, "Perfect Ruby": 1, "Precursor Apparatus": 4, "Drill Motor": 5}, "time": 30/3600},
        "Titanium-Plated Engine": {"mats": {"Mithril-Plated Engine": 1, "Refined Titanium": 8, "Drill Motor": 2}, "time": 24},
        "Mithril-Plated Engine": {"mats": {"Drill Motor": 2, "Mithril Plate": 1}, "time": 24}
    }
}

def generate_forge_schedule(item_name, slots, total_mult, start_time=None, sleep_time=None, wake_time=None, optimize_sleep=False):
    """Generate an optimal forge schedule with dependency awareness"""
    forge_tasks = []
    task_dependencies = {}  # Maps task name to list of prerequisite names
    
    def collect_tasks(item, count=1, depth=0, parent=None):
        if isinstance(item, dict):
            for sub_item, sub_qty in item.items():
                collect_tasks(sub_item, sub_qty * count, depth, parent)
            return
        
        # Find item in DATA or COMPONENTS
        entry = None
        for cat in DATA:
            if item in DATA[cat]:
                entry = DATA[cat][item]
                break
        
        if not entry and item in COMPONENTS:
            entry = COMPONENTS[item]
        
        if entry and entry.get("time", 0) > 0.1:
            # Track dependencies
            if item not in task_dependencies:
                task_dependencies[item] = []
            
            # Add forge-able materials as dependencies
            for mat_name in entry.get("mats", {}).keys():
                if is_forgeable(mat_name):
                    task_dependencies[item].append(mat_name)
            
            # Create task
            forge_tasks.append({
                "name": item,
                "time": entry["time"] * total_mult,
                "count": count,
                "depth": depth,
                "dependencies": task_dependencies[item].copy()
            })
            
            # Recurse into materials
            collect_tasks(entry.get("mats", {}), count, depth + 1, item)
    
    def is_forgeable(item_name):
        """Check if an item requires forging"""
        for cat in DATA:
            if item_name in DATA[cat] and DATA[cat][item_name].get("time", 0) > 0.1:
                return True
        if item_name in COMPONENTS and COMPONENTS[item_name].get("time", 0) > 0:
            return True
        return False
    
    collect_tasks(item_name)
    
    # Sort by depth first (deepest prerequisites first), then by duration
    forge_tasks.sort(key=lambda x: (-x["depth"], -x["time"]))
    
    # Parse sleep schedule
    sleep_hours = None
    if optimize_sleep and sleep_time and wake_time:
        sleep_hours = parse_sleep_schedule(sleep_time, wake_time)
    
    # Track when each item type finishes (for dependency checking)
    item_completion_times = {}  # {item_name: [finish_time1, finish_time2, ...]}
    
    slot_timelines = [[] for _ in range(slots)]
    slot_end_times = [0.0 for _ in range(slots)]
    
    for task in forge_tasks:
        for i in range(task["count"]):
            # Calculate earliest start time based on dependencies
            earliest_start = 0.0
            
            for dep in task["dependencies"]:
                if dep in item_completion_times and item_completion_times[dep]:
                    # Use the earliest available completed dependency
                    earliest_start = max(earliest_start, min(item_completion_times[dep]))
                    # Remove this used dependency instance
                    item_completion_times[dep].remove(min(item_completion_times[dep]))
            
            # Find best slot that respects the earliest start time
            if optimize_sleep and sleep_hours:
                best_slot = find_best_slot_with_dependencies(
                    slot_end_times, task["time"], sleep_hours, earliest_start
                )
            else:
                best_slot = find_best_slot_simple(slot_end_times, earliest_start)
            
            task_start = max(slot_end_times[best_slot], earliest_start)
            task_end = task_start + task["time"]
            
            slot_timelines[best_slot].append({
                "name": task["name"],
                "start": task_start,
                "end": task_end,
                "duration": task["time"],
                "completed": False
            })
            slot_end_times[best_slot] = task_end
            
            # Track completion time for this item instance
            if task["name"] not in item_completion_times:
                item_completion_times[task["name"]] = []
            item_completion_times[task["name"]].append(task_end)
    
    return slot_timelines

def find_best_slot_simple(slot_end_times, earliest_start):
    """Find the slot that can start soonest after earliest_start"""
    best_slot = 0
    best_time = float('inf')
    
    for i, end_time in enumerate(slot_end_times):
        actual_start = max(end_time, earliest_start)
        if actual_start < best_time:
            best_time = actual_start
            best_slot = i
    
    return best_slot

def find_best_slot_with_dependencies(slot_end_times, task_duration, sleep_hours, earliest_start):
    """Find the best slot considering both dependencies and sleep schedule"""
    best_slot = 0
    best_score = float('inf')
    
    for i, end_time in enumerate(slot_end_times):
        actual_start = max(end_time, earliest_start)
        score = actual_start
        
        # Check if task would span sleep time
        task_start_hour = actual_start % 24
        
        # Long tasks (>6h) should start before sleep if possible
        if task_duration >= 6:
            if task_start_hour < sleep_hours['sleep'] - 2:
                score -= 5  # Bonus for starting before sleep
        else:
            # Short tasks should be during awake hours
            if task_start_hour >= sleep_hours['wake'] or task_start_hour < sleep_hours['sleep']:
                score -= 3  # Bonus for awake time
        
        if score < best_score:
            best_score = score
            best_slot = i
    
    return best_slot

def parse_sleep_schedule(sleep_time, wake_time):
    """Parse sleep and wake times to calculate sleep duration"""
    sleep_h, sleep_m = map(int, sleep_time.split(':'))
    wake_h, wake_m = map(int, wake_time.split(':'))
    
    sleep_decimal = sleep_h + sleep_m / 60.0
    wake_decimal = wake_h + wake_m / 60.0
    
    # Handle overnight sleep
    if wake_decimal <= sleep_decimal:
        wake_decimal += 24
    
    return {
        'sleep': sleep_decimal,
        'wake': wake_decimal,
        'duration': wake_decimal - sleep_decimal
    }


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/categories')
def get_categories():
    return jsonify(list(DATA.keys()))

@app.route('/api/items/<category>')
def get_items(category):
    if category in DATA:
        return jsonify(list(DATA[category].keys()))
    return jsonify([])

# Crafting recipes for expanding materials
CRAFTING_RECIPES = {
    "Enchanted Diamond Block": {"recipe": {"Enchanted Diamond": 160}, "crafted": True},
    "Enchanted Diamond": {"recipe": {"Diamond": 160}, "crafted": True},
    "Enchanted Gold Block": {"recipe": {"Enchanted Gold": 160}, "crafted": True},
    "Enchanted Gold": {"recipe": {"Gold Ingot": 160}, "crafted": True},
    "Enchanted Iron Block": {"recipe": {"Enchanted Iron": 160}, "crafted": True},
    "Enchanted Iron": {"recipe": {"Iron Ingot": 160}, "crafted": True},
    "Enchanted Redstone Block": {"recipe": {"Enchanted Redstone": 160}, "crafted": True},
    "Enchanted Redstone": {"recipe": {"Redstone": 160}, "crafted": True},
    "Enchanted Coal Block": {"recipe": {"Enchanted Coal": 160}, "crafted": True},
    "Enchanted Coal": {"recipe": {"Coal": 160}, "crafted": True},
    "Enchanted Mithril": {"recipe": {"Mithril": 160}, "crafted": True},
    "Enchanted Titanium": {"recipe": {"Titanium": 160}, "crafted": True},
}

def expand_materials_with_recipes(materials):
    """Expand materials to show crafting chain (e.g., Enchanted Diamond Block -> Enchanted Diamond -> Diamond)"""
    expanded = {}
    
    for mat_name, qty in materials.items():
        if mat_name in CRAFTING_RECIPES:
            recipe = CRAFTING_RECIPES[mat_name]
            # Store material with its recipe chain
            chain = []
            current_mat = mat_name
            current_qty = qty
            
            while current_mat in CRAFTING_RECIPES:
                recipe_data = CRAFTING_RECIPES[current_mat]
                next_mat = list(recipe_data['recipe'].keys())[0]
                next_qty = list(recipe_data['recipe'].values())[0]
                current_qty *= next_qty
                chain.append({"material": next_mat, "quantity": current_qty})
                current_mat = next_mat
            
            expanded[mat_name] = {
                "quantity": qty,
                "chain": chain
            }
        else:
            expanded[mat_name] = {
                "quantity": qty,
                "chain": []
            }
    
    return expanded

@app.route('/api/calculate', methods=['POST'])
def calculate():
    data = request.json
    
    item_name = data.get('item')
    category = data.get('category')
    slots = int(data.get('slots', 5))
    quick_forge = data.get('quick_forge', False)
    cole = data.get('cole', False)
    start_time = data.get('start_time')
    sleep_time = data.get('sleep_time')
    wake_time = data.get('wake_time')
    optimize_sleep = data.get('optimize_sleep', False)
    
    # Calculate multipliers
    qf_mult = 0.7 if quick_forge else 1.0
    cole_mult = 0.75 if cole else 1.0
    total_mult = qf_mult * cole_mult
    
    # Calculate materials and time
    total_man_hours = 0
    final_mats = {}
    
    def process(item, count=1):
        nonlocal total_man_hours
        
        if isinstance(item, dict):
            for sub_item, sub_qty in item.items():
                process(sub_item, sub_qty * count)
            return
        
        for cat in DATA:
            if item in DATA[cat]:
                entry = DATA[cat][item]
                total_man_hours += entry["time"] * total_mult * count
                process(entry["mats"], count)
                return
        
        if item in COMPONENTS:
            total_man_hours += COMPONENTS[item]["time"] * total_mult * count
            process(COMPONENTS[item]["mats"], count)
        else:
            final_mats[item] = final_mats.get(item, 0) + count
    
    process(item_name)
    
    # Generate schedule with sleep optimization
    schedule = generate_forge_schedule(
        item_name, 
        slots, 
        total_mult,
        start_time,
        sleep_time,
        wake_time,
        optimize_sleep
    )
    
    # Calculate time
    parallel_hours = total_man_hours / slots
    days = int(parallel_hours // 24)
    hours = int(parallel_hours % 24)
    
    # Get direct materials needed for the selected item (not recursive)
    forge_materials = {}
    
    # Find the item's direct materials
    entry = None
    for cat in DATA:
        if item_name in DATA[cat]:
            entry = DATA[cat][item_name]
            break
    
    if not entry and item_name in COMPONENTS:
        entry = COMPONENTS[item_name]
    
    if entry and entry.get("mats"):
        # Only include direct materials that need forging
        for mat_name, mat_qty in entry["mats"].items():
            # Check if this material needs forging
            is_forgeable = False
            for cat in DATA:
                if mat_name in DATA[cat] and DATA[cat][mat_name].get("time", 0) > 0.1:
                    is_forgeable = True
                    break
            if not is_forgeable and mat_name in COMPONENTS and COMPONENTS[mat_name].get("time", 0) > 0:
                is_forgeable = True
            
            if is_forgeable:
                forge_materials[mat_name] = mat_qty
    
    # Expand materials to show crafting chain
    expanded_materials = expand_materials_with_recipes(final_mats)
    
    return jsonify({
        'schedule': schedule,
        'materials': final_mats,
        'expanded_materials': expanded_materials,
        'forge_materials': forge_materials,
        'total_hours': round(total_man_hours, 1),
        'calendar_days': days,
        'calendar_hours': hours
    })

@app.route('/api/save', methods=['POST'])
def save_schedule():
    data = request.json
    
    with open('web_forge_schedule.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    return jsonify({'success': True, 'message': 'Schedule saved successfully!'})

@app.route('/api/load', methods=['GET'])
def load_schedule():
    if os.path.exists('web_forge_schedule.json'):
        with open('web_forge_schedule.json', 'r') as f:
            data = json.load(f)
        return jsonify({'success': True, 'data': data})
    return jsonify({'success': False, 'message': 'No saved schedule found'})

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
