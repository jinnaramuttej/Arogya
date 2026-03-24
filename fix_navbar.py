import os
import re

def add_nav_link(file_path):
    if not os.path.exists(file_path):
        print(f"Skipping {os.path.basename(file_path)}, file not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    pharmacy_link = """<li class="nav-item"><a href="pharmacy.html" class="nav-link" data-lang-key="navPharmacy"><i class="fas fa-pills"></i>Pharmacy</a></li>"""
    anchor_pattern = re.compile(r'(<li class="nav-item"><a href="symptom.html".*?</i>AI Checker</a></li>)')

    if "href=\"pharmacy.html\"" in content:
        print(f"Pharmacy link already exists in {os.path.basename(file_path)}.")
        return

    if anchor_pattern.search(content):
        new_content = anchor_pattern.sub(r'\\1\n            ' + pharmacy_link, content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Successfully added Pharmacy link to {os.path.basename(file_path)}.")
    else:
        print(f"Could not find anchor point to add Pharmacy link in {os.path.basename(file_path)}.")

script_dir = os.path.dirname(os.path.abspath(__file__))
files_to_patch = ['about.html', 'health-dashboard.html', 'index.html'] 

for filename in files_to_patch:
    add_nav_link(os.path.join(script_dir, filename))