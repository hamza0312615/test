import json

with open("disease_data.json", "r") as f:
    data = json.load(f)

js_content = f"const DISEASE_DATABASE = {json.dumps(data, indent=2)};\n"
with open("disease_data.js", "w") as f:
    f.write(js_content)
