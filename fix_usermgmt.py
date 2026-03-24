
import os

# By default, this looks for 'user-management.html' in the same folder as this script.
# To change the system details/path, replace the line below with your specific path.
# Example: file_path = r"C:\Users\YourName\Downloads\Project\user-management.html"
file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'user-management.html')

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Locate the start of the NEW module script (the good one)
module_script_start = -1
for i, line in enumerate(lines):
    if '<script type="module">' in line:
        module_script_start = i
        break

if module_script_start == -1:
    print("Could not find module script start.")
    exit()

# We want to remove the OLD script code that is likely *before* this module script
# AND the trailing garbage *after* the module script closing tag.

# Find the CLOSING tag of the module script
module_script_end = -1
for i in range(module_script_start, len(lines)):
    if '</script>' in lines[i]:
        module_script_end = i
        break

if module_script_end == -1:
    print("Could not find module script end.")
    exit()

print(f"Good Module Script detected at: {module_script_start+1} to {module_script_end+1}")

# Finding the BAD old script content.
# Based on logs, there is code like "const allNavLinks = ..." around line 1281.
# And a "<script>" tag might be missing or it's just raw JS code floating in HTML body?
# In Step 199, lines 1281-1338 are raw JS code NOT inside a script tag (or inside an unclosed one further up?).
# Wait, look at line 1339: <script type="module">
# PROBABLY the old script tag was *closed* or *removed* but the content remained?
# Actually, the file previously had a <script> tag at the end.
# I will assume everything between </footer> (approx 1200?) and <script type="module"> is GARBAGE.

footer_end_index = -1
for i in range(module_script_start - 1, 0, -1):
    if '</footer>' in lines[i]:
        footer_end_index = i
        break

if footer_end_index != -1:
    print(f"Footer ends at {footer_end_index+1}")
    # Remove everything between footer end and module script start
    del lines[footer_end_index+1 : module_script_start]
    
    # Re-calculate indices after deletion
    # The module script start is now at footer_end_index + 1
    current_module_start = footer_end_index + 1
    
    # Now look for garbage AFTER the module script.
    # We need to find the new end index.
    current_module_end = -1
    for i in range(current_module_start, len(lines)):
        if '</script>' in lines[i]:
            current_module_end = i
            break
            
    if current_module_end != -1:
        # Check for garbage after script end
        # lines like "// --- Final Initialization ---" etc.
        # remove everything after script end until </body>
        body_end_index = -1
        for i in range(current_module_end + 1, len(lines)):
            if '</body>' in lines[i]:
                body_end_index = i
                break
        
        if body_end_index != -1:
            print(f"Removing garbage between {current_module_end+1} and {body_end_index+1}")
            del lines[current_module_end+1 : body_end_index]
            
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("File cleaned successfully.")
else:
    print("Could not find </footer> tag. Unsafe to proceed.")

input("Press Enter to exit...")
