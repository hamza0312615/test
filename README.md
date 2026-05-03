# VisionDx | AI Medical Assistant

VisionDx is a web-based, AI-powered medical assistant prototype designed to provide instant analysis and predictions using computer vision and public medical databases. With a sleek glassmorphism interface, it allows users to perform preliminary medical checks from any device.

> **Disclaimer:** This tool is a prototype and intended for educational purposes only. The AI analysis and predictions are simulated or retrieved from public databases (like openFDA and Wikipedia) and should **not** be considered professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider.

##  Features

VisionDx currently supports three main analysis modes:

### 1.  Eye Disease Predictor
Analyze eye color and visual features to detect potential illnesses like Hepatitis, Anemia, Cataracts, and Glaucoma.
- Takes advantage of Hugging Face image classification models.
- Provides probability scores and differential diagnoses.

### 2.  Skin Rash Analyzer
Detect skin rashes and predict related dermatological diseases such as Melanoma, Dermatitis, and Psoriasis.
- Leverages computer vision to evaluate skin irregularities.
- Fetches detailed condition descriptions directly from Wikipedia.

### 3.  Medicine Verifier
Verify correct medication, check dosages, and view automated precautions directly from the label.
- Uses **Tesseract.js** for Optical Character Recognition (OCR) to extract text from medicine bottles/labels.
- Queries the **openFDA API** to verify brand names, generic names, pharmacological classes, and warnings.
- Supports manual search fallback for hard-to-read labels.

##  Technologies Used

- **Frontend Core:** Vanilla HTML5, CSS3 (Custom properties, Glassmorphism design), and JavaScript (ES6+).
- **Computer Vision & AI:** [Hugging Face Inference API](https://huggingface.co/docs/api-inference/index) for image classification.
- **Optical Character Recognition (OCR):** [Tesseract.js](https://tesseract.projectnaptha.com/) for reading text from images.
- **Medical Data:** [openFDA API](https://open.fda.gov/apis/) and the Wikipedia API.
- **UI Assets:** [Phosphor Icons](https://phosphoricons.com/) and Google Fonts (Outfit).
- **Utilities:** [jsPDF](https://parall.ax/products/jspdf) for generating downloadable reports.

## Installation & Usage

Because VisionDx is built using vanilla web technologies, no build steps or bundlers are strictly required to run it locally.

1. **Clone or Download the Repository**
2. **Serve the Directory**
   Since the application fetches external APIs and uses the camera, it must be served over `http://` or `https://` (not `file://` protocols) to avoid CORS issues and allow camera permissions.
   
   You can use any local server, for example, using Node.js:
   ```bash
   npx serve .
   ```
   Or using Python:
   ```bash
   python -m http.server 8000
   ```
3. **Open your browser**
   Navigate to `http://localhost:8000` (or the port specified by your local server).

## How to Use

1. **Select a Mode:** Choose between Eye Analysis, Skin/Rash Detection, or Medicine Verifier from the sidebar.
2. **Provide an Image:**
   - **Take a Photo:** Click "Take Photo" to use your device's webcam or back camera.
   - **Upload Image:** Upload a pre-existing image file.
   - **Drag & Drop:** Drag an image directly into the drop zone.
3. **Analyze:** Click "Analyze Image" to start the automated process.
4. **View Results:** The application will display primary detections, differential diagnoses, confidence bars, and relevant medical descriptions or FDA data.

##  Project Structure

- `index.html`: The main structural layout of the application.
- `style.css`: Contains the design system, animations, responsive media queries, and glassmorphism UI rules.
- `app.js`: The core logic file handling state management, API calls, camera hardware interaction, OCR extraction, and DOM updates.

##  Privacy

VisionDx processes image data in the browser (via Tesseract.js) or sends it temporarily to Hugging Face's inference API. No patient data or imagery is permanently stored by this application. Session history is kept strictly locally inside the browser's `localStorage`.
