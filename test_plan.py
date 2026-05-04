import json

# Check the file contents
with open('app.js', 'r') as f:
    app_js = f.read()
    if "DISEASE_DATABASE" in app_js:
        print("DISEASE_DATABASE exists in app.js")

with open('disease_data.js', 'r') as f:
    data_js = f.read()
    if "DISEASE_DATABASE" in data_js:
        print("DISEASE_DATABASE exists in disease_data.js")
