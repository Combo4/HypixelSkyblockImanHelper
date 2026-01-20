import math
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import json
import os

def generate_forge_schedule(item_name, slots, total_mult, DATA, COMPONENTS):
    """Generate an optimal forge schedule showing which items to forge in which slots"""
    
    # Collect all forge tasks needed
    forge_tasks = []
    
    def collect_tasks(item, count=1, depth=0):
        # Check if it's a dict (materials list)
        if isinstance(item, dict):
            for sub_item, sub_qty in item.items():
                collect_tasks(sub_item, sub_qty * count, depth)
            return
        
        # Check if it's in DATA (top-level items)
        for cat in DATA:
            if item in DATA[cat]:
                entry = DATA[cat][item]
                if entry["time"] > 0.1:  # Only include items with significant forge time
                    forge_tasks.append({
                        "name": item,
                        "time": entry["time"] * total_mult,
                        "count": count,
                        "depth": depth
                    })
                collect_tasks(entry["mats"], count, depth + 1)
                return
        
        # Check if it's in COMPONENTS
        if item in COMPONENTS:
            comp = COMPONENTS[item]
            if comp["time"] > 0:
                forge_tasks.append({
                    "name": item,
                    "time": comp["time"] * total_mult,
                    "count": count,
                    "depth": depth
                })
            collect_tasks(comp["mats"], count, depth + 1)
    
    collect_tasks(item_name)
    
    # Sort by depth (deepest first = dependencies) then by time (longest first)
    forge_tasks.sort(key=lambda x: (-x["depth"], -x["time"]))
    
    # Create schedule
    slot_timelines = [[] for _ in range(slots)]  # Track what's in each slot
    slot_end_times = [0.0 for _ in range(slots)]  # When each slot becomes free
    
    for task in forge_tasks:
        for i in range(task["count"]):
            # Find the slot that will be free soonest
            earliest_slot = slot_end_times.index(min(slot_end_times))
            start_time = slot_end_times[earliest_slot]
            end_time = start_time + task["time"]
            
            slot_timelines[earliest_slot].append({
                "name": task["name"],
                "start": start_time,
                "end": end_time,
                "duration": task["time"],
                "completed": False
            })
            slot_end_times[earliest_slot] = end_time
    
    return slot_timelines

def get_ironman_forge_calculator():
    # Create main window
    root = tk.Tk()
    root.title("Skyblock Forge Calculator - 2026")
    root.geometry("900x850")
    root.resizable(True, True)
    
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
        "Precursor Apparatus": {"mats": {}, "time": 0}  # Not forgeable, obtained from chests
    }

    # Full Tree Data (times in hours)
    DATA = {
        "Drills": {
            "Divan's Drill": {"mats": {"Titanium Drill DR-X655": 1, "Divan's Alloy": 1}, "time": 30/3600},  # 30 seconds
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

    # Variables for user settings
    slots_var = tk.IntVar(value=5)
    quick_forge_var = tk.BooleanVar(value=False)
    cole_var = tk.BooleanVar(value=False)
    category_var = tk.StringVar(value="Drills")
    item_var = tk.StringVar()
    
    # Store current schedule
    current_schedule = []
    completion_checkboxes = []

    # Create GUI Layout
    main_frame = ttk.Frame(root, padding="10")
    main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
    root.columnconfigure(0, weight=1)
    root.rowconfigure(0, weight=1)

    # Title
    title_label = ttk.Label(main_frame, text="⛏️ Skyblock Forge Calculator 2026 ⛏️", font=("Arial", 16, "bold"))
    title_label.grid(row=0, column=0, columnspan=2, pady=10)

    # Settings Frame
    settings_frame = ttk.LabelFrame(main_frame, text="Settings", padding="10")
    settings_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)

    ttk.Label(settings_frame, text="Forge Slots:").grid(row=0, column=0, sticky=tk.W, pady=2)
    slots_spinbox = ttk.Spinbox(settings_frame, from_=1, to=10, textvariable=slots_var, width=10)
    slots_spinbox.grid(row=0, column=1, sticky=tk.W, pady=2)

    quick_forge_check = ttk.Checkbutton(settings_frame, text="Quick Forge Level 20 (30% off)", variable=quick_forge_var)
    quick_forge_check.grid(row=1, column=0, columnspan=2, sticky=tk.W, pady=2)

    cole_check = ttk.Checkbutton(settings_frame, text="Mayor Cole (25% off)", variable=cole_var)
    cole_check.grid(row=2, column=0, columnspan=2, sticky=tk.W, pady=2)

    # Selection Frame
    selection_frame = ttk.LabelFrame(main_frame, text="Item Selection", padding="10")
    selection_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)

    ttk.Label(selection_frame, text="Category:").grid(row=0, column=0, sticky=tk.W, pady=2)
    category_combo = ttk.Combobox(selection_frame, textvariable=category_var, values=list(DATA.keys()), state="readonly", width=20)
    category_combo.grid(row=0, column=1, sticky=(tk.W, tk.E), pady=2)
    
    ttk.Label(selection_frame, text="Item:").grid(row=1, column=0, sticky=tk.W, pady=2)
    item_combo = ttk.Combobox(selection_frame, textvariable=item_var, state="readonly", width=30)
    item_combo.grid(row=1, column=1, sticky=(tk.W, tk.E), pady=2)

    def update_items(*args):
        category = category_var.get()
        if category in DATA:
            items = list(DATA[category].keys())
            item_combo['values'] = items
            if items:
                item_var.set(items[0])

    category_var.trace('w', update_items)
    update_items()

    # Notebook for tabs
    notebook = ttk.Notebook(main_frame)
    notebook.grid(row=4, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=5)
    main_frame.rowconfigure(4, weight=1)

    # Calendar View Tab
    calendar_frame = ttk.Frame(notebook, padding="10")
    notebook.add(calendar_frame, text="📅 Forge Calendar")

    calendar_canvas = tk.Canvas(calendar_frame, bg="white")
    calendar_scrollbar = ttk.Scrollbar(calendar_frame, orient="vertical", command=calendar_canvas.yview)
    scrollable_calendar = ttk.Frame(calendar_canvas)

    scrollable_calendar.bind(
        "<Configure>",
        lambda e: calendar_canvas.configure(scrollregion=calendar_canvas.bbox("all"))
    )

    calendar_canvas.create_window((0, 0), window=scrollable_calendar, anchor="nw")
    calendar_canvas.configure(yscrollcommand=calendar_scrollbar.set)

    calendar_canvas.pack(side="left", fill="both", expand=True)
    calendar_scrollbar.pack(side="right", fill="y")

    # Summary Tab
    summary_frame = ttk.Frame(notebook, padding="10")
    notebook.add(summary_frame, text="📊 Summary")

    results_text = scrolledtext.ScrolledText(summary_frame, width=90, height=30, wrap=tk.WORD, font=("Courier New", 9))
    results_text.pack(fill="both", expand=True)

    def save_schedule():
        """Save current schedule to file"""
        if not current_schedule:
            messagebox.showwarning("No Schedule", "Please calculate a schedule first before saving.")
            return
        
        data = {
            "item": item_var.get(),
            "category": category_var.get(),
            "slots": slots_var.get(),
            "quick_forge": quick_forge_var.get(),
            "cole": cole_var.get(),
            "schedule": current_schedule
        }
        
        with open("forge_schedule.json", "w") as f:
            json.dump(data, f, indent=2)
        
        messagebox.showinfo("Saved", "Schedule saved to forge_schedule.json")

    def load_schedule():
        """Load schedule from file"""
        if not os.path.exists("forge_schedule.json"):
            messagebox.showwarning("No Save File", "No saved schedule found.")
            return
        
        try:
            with open("forge_schedule.json", "r") as f:
                data = json.load(f)
            
            # Restore settings
            category_var.set(data["category"])
            update_items()
            item_var.set(data["item"])
            slots_var.set(data["slots"])
            quick_forge_var.set(data["quick_forge"])
            cole_var.set(data["cole"])
            
            # Trigger calculation
            calculate()
            
            messagebox.showinfo("Loaded", f"Schedule for {data['item']} loaded successfully!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load schedule: {str(e)}")

    def reset_schedule():
        """Reset all completion checkmarks"""
        nonlocal current_schedule
        for slot_tasks in current_schedule:
            for task in slot_tasks:
                task["completed"] = False
        
        # Redraw calendar
        draw_calendar()
        messagebox.showinfo("Reset", "All completion marks cleared!")

    def draw_calendar():
        """Draw the forge calendar in a compact side-by-side view"""
        # Clear existing widgets
        for widget in scrollable_calendar.winfo_children():
            widget.destroy()
        
        completion_checkboxes.clear()
        
        if not current_schedule:
            ttk.Label(scrollable_calendar, text="No schedule generated yet. Click Calculate to begin.", 
                     font=("Arial", 11)).pack(pady=20)
            return
        
        # Title
        title = ttk.Label(scrollable_calendar, text=f"Forge Schedule for: {item_var.get()}", 
                         font=("Arial", 12, "bold"))
        title.pack(pady=10)
        
        # Create frame for slots (side by side)
        slots_container = ttk.Frame(scrollable_calendar)
        slots_container.pack(fill="both", expand=True, padx=5)
        
        # Display slots side by side
        num_slots = len(current_schedule)
        cols = min(3, num_slots)  # Max 3 columns
        
        for slot_idx, slot_tasks in enumerate(current_schedule):
            row = slot_idx // cols
            col = slot_idx % cols
            
            slot_frame = ttk.LabelFrame(slots_container, text=f"Slot {slot_idx + 1}", padding="5")
            slot_frame.grid(row=row, column=col, padx=5, pady=5, sticky="n")
            
            if not slot_tasks:
                ttk.Label(slot_frame, text="Empty", foreground="gray").pack()
                continue
            
            for task_idx, task in enumerate(slot_tasks):
                task_frame = ttk.Frame(slot_frame)
                task_frame.pack(fill="x", pady=2)
                
                # Checkbox for completion
                var = tk.BooleanVar(value=task["completed"])
                cb = ttk.Checkbutton(task_frame, variable=var, 
                                    command=lambda t=task, v=var: toggle_completion(t, v))
                cb.pack(side="left")
                completion_checkboxes.append((task, var))
                
                # Time and item info
                hours = int(task["start"])
                minutes = int((task["start"] - hours) * 60)
                duration_h = int(task["duration"])
                duration_m = int((task["duration"] - duration_h) * 60)
                
                status = "✓" if task["completed"] else "○"
                text = f"{status} [{hours:02d}h{minutes:02d}m] {task['name']}\n    Duration: {duration_h}h{duration_m}m"
                
                label = ttk.Label(task_frame, text=text, 
                                 font=("Courier New", 9),
                                 foreground="green" if task["completed"] else "black")
                label.pack(side="left", padx=5)

    def toggle_completion(task, var):
        """Toggle task completion status"""
        task["completed"] = var.get()
        draw_calendar()

    def calculate():
        nonlocal current_schedule
        
        selected_item = item_var.get()
        category = category_var.get()
        slots = slots_var.get()
        
        if not selected_item:
            messagebox.showwarning("No Item Selected", "Please select an item to calculate.")
            return

        # Calculate multipliers
        qf_mult = 0.7 if quick_forge_var.get() else 1.0
        cole_mult = 0.75 if cole_var.get() else 1.0
        total_mult = qf_mult * cole_mult

        total_man_hours = 0
        final_mats = {}
        forge_steps = []

        def process(item_name, count=1):
            nonlocal total_man_hours
            # 1. Check if it's an intermediate forgeable component (dict of materials)
            if isinstance(item_name, dict):
                for sub_item, sub_qty in item_name.items():
                    process(sub_item, sub_qty * count)
                return
            
            # 2. Check if it's a "Top-Level" item (e.g. DR-X655)
            for cat in DATA:
                if item_name in DATA[cat]:
                    entry = DATA[cat][item_name]
                    total_man_hours += entry["time"] * total_mult * count
                    process(entry["mats"], count)
                    return

            # 3. Check if it's a forgeable component (e.g. Mithril Plate)
            if item_name in COMPONENTS:
                total_man_hours += COMPONENTS[item_name]["time"] * total_mult * count
                forge_steps.append(f"Forge {count}x {item_name}")
                process(COMPONENTS[item_name]["mats"], count)
            else:
                # 4. It's a raw material (Enchanted Mithril, etc.)
                final_mats[item_name] = final_mats.get(item_name, 0) + count

        process(selected_item)

        # Generate schedule
        current_schedule = generate_forge_schedule(selected_item, slots, total_mult, DATA, COMPONENTS)
        draw_calendar()

        # Display Results in Summary tab
        results_text.delete(1.0, tk.END)
        results_text.insert(tk.END, "="*70 + "\n")
        results_text.insert(tk.END, f"RESULTS FOR: {selected_item.upper()}\n")
        results_text.insert(tk.END, "="*70 + "\n\n")
        
        results_text.insert(tk.END, "Total Raw Materials Needed:\n")
        results_text.insert(tk.END, "-"*50 + "\n")
        for item, qty in sorted(final_mats.items()):
            results_text.insert(tk.END, f" • {item}: {qty:,}\n")

        # Time Estimate
        parallel_hours = total_man_hours / slots
        days = int(parallel_hours // 24)
        hours = int(parallel_hours % 24)
        
        results_text.insert(tk.END, f"\n{'='*70}\n")
        results_text.insert(tk.END, "TIME ESTIMATE\n")
        results_text.insert(tk.END, f"{'='*70}\n")
        results_text.insert(tk.END, f"Total Man-Hours: {round(total_man_hours, 1)}h\n")
        results_text.insert(tk.END, f"Calendar Time ({slots} slots): {days}d, {hours}h\n")
        
        # Tips
        results_text.insert(tk.END, f"\n{'='*70}\n")
        results_text.insert(tk.END, "EFFICIENCY TIPS\n")
        results_text.insert(tk.END, f"{'='*70}\n")
        if category == "Drills":
            results_text.insert(tk.END, "• Refined materials have long wait times - start early\n")
            results_text.insert(tk.END, "• Drill Motors take 30 hours - perfect for overnight\n")
            results_text.insert(tk.END, "• Golden Plates need Refined Diamonds as dependency\n")
        elif category == "Fuel Tanks":
            results_text.insert(tk.END, "• Start with Mithril-Infused (10h) and Titanium (20h)\n")
            results_text.insert(tk.END, "• Gemstone Mixtures are fast (4h each)\n")
        else:  # Engines
            results_text.insert(tk.END, "• Both engine tiers take 24 hours each\n")
            results_text.insert(tk.END, "• Start Drill Motors early (30h each)\n")
            results_text.insert(tk.END, "• Work on Mithril Plates and Refined materials first\n")

    # Button Frame
    button_frame = ttk.Frame(main_frame)
    button_frame.grid(row=3, column=0, columnspan=2, pady=10)

    calc_button = ttk.Button(button_frame, text="Calculate", command=calculate)
    calc_button.grid(row=0, column=0, padx=5)

    save_button = ttk.Button(button_frame, text="💾 Save", command=save_schedule)
    save_button.grid(row=0, column=1, padx=5)

    load_button = ttk.Button(button_frame, text="📂 Load", command=load_schedule)
    load_button.grid(row=0, column=2, padx=5)

    reset_button = ttk.Button(button_frame, text="🔄 Reset", command=reset_schedule)
    reset_button.grid(row=0, column=3, padx=5)

    # Start the GUI
    root.mainloop()

if __name__ == "__main__":
    get_ironman_forge_calculator()
