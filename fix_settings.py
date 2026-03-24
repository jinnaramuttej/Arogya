
import os

# By default, this looks for 'settings.html' in the same folder as this script.
# To change the system details/path, replace the line below with your specific path.
# Example: file_path = r"C:\Users\YourName\Downloads\Project\settings.html"
file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'settings.html')

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the start of the bad script block (approx line 925)
start_index = -1
for i, line in enumerate(lines):
    # If your file structure is different, you may need to adjust '900' or remove the check.
    if i > 900 and '<script>' in line and 'type="module"' not in line:
        start_index = i
        break

# Find the start of the GOOD script block (approx line 1134)
end_index = -1
for i, line in enumerate(lines):
    if i > start_index and '<script type="module">' in line:
        end_index = i
        break

if start_index != -1 and end_index != -1:
    print(f"Removing lines from {start_index+1} to {end_index}")
    
    # Keep header
    new_lines = lines[:start_index]
    
    # Process the good block (dedent)
    good_block = lines[end_index:]
    
    # Calculate dedent amount based on the script tag line
    script_line = lines[end_index]
    current_indent = len(script_line) - len(script_line.lstrip())
    target_indent = 4
    dedent_amount = current_indent - target_indent
    
    if dedent_amount > 0:
        cleaned_block = []
        for line in good_block:
            if len(line.strip()) == 0:
                cleaned_block.append(line)
                continue
                
            line_indent = len(line) - len(line.lstrip())
            if line_indent >= dedent_amount:
                cleaned_block.append(line[dedent_amount:])
            else:
                cleaned_block.append(line.lstrip()) # Fallback
        new_lines.extend(cleaned_block)
    else:
        new_lines.extend(good_block)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("File updated successfully.")

else:
    print("Could not find start or end indices.")
    print(f"Start: {start_index}, End: {end_index}")

input("Press Enter to exit...")
