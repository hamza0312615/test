import urllib.request
import json
import time

conditions = {
  "skin": [
    "Melanoma", "Basal-cell carcinoma", "Squamous-cell carcinoma",
    "Dermatitis", "Psoriasis", "Contact dermatitis", "Dermatophytosis",
    "Hives", "Rosacea", "Chickenpox", "Measles", "Shingles",
    "Impetigo", "Scabies", "Cellulitis", "Acne", "Vitiligo"
  ],
  "eye": [
    "Conjunctivitis", "Cataract", "Glaucoma", "Diabetic retinopathy",
    "Macular degeneration", "Dry eye syndrome", "Pterygium",
    "Jaundice", "Pallor", "Corneal ulcer", "Uveitis", "Pinguecula", "Blepharitis"
  ]
}

data = {"skin": {}, "eye": {}}

for cat, conds in conditions.items():
    for cond in conds:
        try:
            url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{cond.replace(' ', '_')}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                res_data = json.loads(response.read().decode())

            image_url = res_data.get("thumbnail", {}).get("source", f"https://placehold.co/400x300/00f0ff/0a0a0f?text={cond.replace(' ', '+')}")
            desc = res_data.get("extract", f"Information about {cond} is currently unavailable.")

            data[cat][cond] = {
                "name": cond,
                "description": desc,
                "image": image_url,
                "causes": f"Common causes of {cond} can include genetic factors, environmental exposure, infections, or underlying health conditions. Please consult a specialist for an accurate diagnosis.",
                "precautions": f"To prevent or manage {cond}, it is recommended to maintain good hygiene, avoid known triggers, and seek professional medical advice."
            }
            time.sleep(0.1)
        except Exception as e:
            print(f"Error for {cond}: {e}")
            data[cat][cond] = {
                "name": cond,
                "description": f"Information about {cond} is currently unavailable.",
                "image": f"https://placehold.co/400x300/00f0ff/0a0a0f?text={cond.replace(' ', '+')}",
                "causes": f"Common causes of {cond} can include genetic factors, environmental exposure, infections, or underlying health conditions.",
                "precautions": f"To prevent or manage {cond}, it is recommended to maintain good hygiene, avoid known triggers, and seek professional medical advice."
            }

with open("disease_data.json", "w") as f:
    json.dump(data, f, indent=2)
