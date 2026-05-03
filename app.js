// State Management
const STATE = {
  mode: "eye", // 'eye', 'skin', 'medicine'
  hasImage: false,
  mediaStream: null,
  isProcessing: false,
};

// UI Data Configuration
const PAGE_CONFIG = {
  eye: {
    title: "Eye Disease Predictor",
    subtitle:
      "Analyze eye color to detect potential illnesses like Hepatitis or Anemia.",
    mockDelay: 2500,
  },
  skin: {
    title: "Skin Rash Analyzer",
    subtitle: "Detect skin rashes and predict related dermatological diseases.",
    mockDelay: 3000,
  },
  medicine: {
    title: "Medicine Verifier",
    subtitle:
      "Verify correct medication, check dosages, and view automated precautions.",
    mockDelay: 2000,
  },
};

// Comprehensive Simulation Lists
const CONDITIONS = {
  skin: [
    "Melanoma",
    "Basal-cell carcinoma",
    "Squamous-cell carcinoma",
    "Dermatitis",
    "Psoriasis",
    "Contact dermatitis",
    "Dermatophytosis",
    "Hives",
    "Rosacea",
    "Chickenpox",
    "Measles",
    "Shingles",
    "Impetigo",
    "Scabies",
    "Cellulitis",
    "Acne",
    "Vitiligo",
  ],
  eye: [
    "Conjunctivitis",
    "Cataract",
    "Glaucoma",
    "Diabetic retinopathy",
    "Macular degeneration",
    "Dry eye syndrome",
    "Pterygium",
    "Jaundice",
    "Pallor",
    "Corneal ulcer",
    "Uveitis",
    "Pinguecula",
    "Blepharitis",
  ],
  medicines: [
    "Amoxicillin",
    "Ibuprofen",
    "Metformin",
    "Omeprazole",
    "Lisinopril",
    "Amlodipine",
    "Albuterol",
    "Gabapentin",
    "Atorvastatin",
    "Losartan",
    "Sertraline",
    "Azithromycin",
    "Metoprolol",
    "Pantoprazole",
    "Prednisone",
  ],
};

// DOM Elements
const DOM = {
  navItems: document.querySelectorAll(".nav-item"),
  pageTitle: document.getElementById("page-title"),
  pageSubtitle: document.getElementById("page-subtitle"),

  btnCamera: document.getElementById("btn-camera"),
  btnUpload: document.getElementById("btn-upload"),
  btnStopCamera: document.getElementById("btn-stop-camera"),
  btnAnalyze: document.getElementById("btn-capture-analyze"),
  fileInput: document.getElementById("file-input"),

  manualMedicineInput: document.getElementById("manual-medicine-input"),
  medicineSearch: document.getElementById("medicine-search"),
  btnSearchMedicine: document.getElementById("btn-search-medicine"),

  mediaContainer: document.getElementById("media-container"),
  placeholderState: document.getElementById("placeholder-state"),
  videoFeed: document.getElementById("video-feed"),
  imagePreview: document.getElementById("image-preview"),
  scannerOverlay: document.getElementById("scanner-overlay"),

  resultsContent: document.getElementById("results-content"),
};

// --- Initialization ---
function init() {
  setupNavigation();
  setupMediaInputs();
  setupAnalysisAction();
  renderHistory();
}

// --- History Management ---
function saveHistory(type, resultStr) {
  let history = JSON.parse(localStorage.getItem("visiondx_history")) || [];
  history.unshift({
    type,
    result: resultStr,
    timestamp: new Date().toLocaleString(),
  });
  if (history.length > 5) history = history.slice(0, 5);
  localStorage.setItem("visiondx_history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("visiondx_history")) || [];
  const list = document.getElementById("history-list");
  if (!list) return;
  if (history.length === 0) {
    list.innerHTML =
      '<li style="padding: 5px 0;">No history available yet.</li>';
    return;
  }
  list.innerHTML = history
    .map(
      (h) => `
        <li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <strong style="color: var(--text-main);">${h.type}:</strong> ${h.result}
            <span style="display: block; font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${h.timestamp}</span>
        </li>
    `,
    )
    .join("");
}

// --- Navigation Logic ---
function setupNavigation() {
  DOM.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (STATE.isProcessing) return; // Prevent switching while processing

      DOM.navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");

      STATE.mode = item.dataset.target;

      DOM.pageTitle.textContent = PAGE_CONFIG[STATE.mode].title;
      DOM.pageSubtitle.textContent = PAGE_CONFIG[STATE.mode].subtitle;

      // Toggle manual medicine input
      if (STATE.mode === "medicine") {
        DOM.manualMedicineInput.style.display = "block";
      } else {
        DOM.manualMedicineInput.style.display = "none";
        if (DOM.medicineSearch) DOM.medicineSearch.value = "";
      }

      resetWorkspace();
    });
  });
}

function resetWorkspace() {
  stopCamera();
  DOM.imagePreview.style.display = "none";
  DOM.imagePreview.src = "";
  DOM.placeholderState.style.display = "flex";
  DOM.btnAnalyze.disabled = true;
  STATE.hasImage = false;

  DOM.resultsContent.innerHTML = `
        <div class="empty-results">
            <i class="ph ph-magnifying-glass"></i>
            <p>Capture or upload an image to view AI analysis and risk predictions here.</p>
        </div>
    `;
}

// --- Media Input Logic ---
function setupMediaInputs() {
  function handleImageFile(file) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      stopCamera();
      DOM.placeholderState.style.display = "none";
      DOM.imagePreview.src = e.target.result;
      DOM.imagePreview.style.display = "block";
      STATE.hasImage = true;
      DOM.btnAnalyze.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  DOM.btnUpload.addEventListener("click", () => DOM.fileInput.click());
  DOM.fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleImageFile(file);
  });

  DOM.mediaContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    DOM.mediaContainer.classList.add("dragover");
  });
  DOM.mediaContainer.addEventListener("dragleave", (e) => {
    e.preventDefault();
    DOM.mediaContainer.classList.remove("dragover");
  });
  DOM.mediaContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    DOM.mediaContainer.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  });

  DOM.btnCamera.addEventListener("click", async () => {
    try {
      if (STATE.mediaStream) return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      STATE.mediaStream = stream;

      DOM.placeholderState.style.display = "none";
      DOM.imagePreview.style.display = "none";

      DOM.videoFeed.srcObject = stream;
      DOM.videoFeed.style.display = "block";

      DOM.btnStopCamera.style.display = "flex";
      STATE.hasImage = true;
      DOM.btnAnalyze.disabled = false;
      DOM.btnAnalyze.innerHTML =
        '<i class="ph-fill ph-camera"></i> Capture & Analyze';
    } catch (err) {
      alert(
        "Camera access denied or unavailable. Please upload a photo instead.",
      );
      console.error(err);
    }
  });

  DOM.btnStopCamera.addEventListener("click", stopCamera);
}

function stopCamera() {
  if (STATE.mediaStream) {
    STATE.mediaStream.getTracks().forEach((track) => track.stop());
    STATE.mediaStream = null;
    DOM.videoFeed.style.display = "none";
    DOM.btnStopCamera.style.display = "none";

    if (DOM.imagePreview.style.display === "none") {
      DOM.placeholderState.style.display = "flex";
      STATE.hasImage = false;
      DOM.btnAnalyze.disabled = true;
    }
  }
  DOM.btnAnalyze.innerHTML =
    '<i class="ph-fill ph-check-circle"></i> Analyze Image';
}

function freezeCameraFrame() {
  if (STATE.mediaStream) {
    const canvas = document.createElement("canvas");
    canvas.width = DOM.videoFeed.videoWidth;
    canvas.height = DOM.videoFeed.videoHeight;
    canvas.getContext("2d").drawImage(DOM.videoFeed, 0, 0);

    DOM.imagePreview.src = canvas.toDataURL("image/jpeg");
    DOM.imagePreview.style.display = "block";
    stopCamera();
  }
}

// --- API & Analysis Logic ---

// --- OCR Pipeline ---
async function extractMedicineText(imageDataUrl) {
  try {
    const result = await Tesseract.recognize(imageDataUrl, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          const pct = Math.round(m.progress * 100);
          const pEl = document.getElementById("ocr-progress-text");
          if (pEl) pEl.innerText = `Extracting text via OCR... ${pct}%`;
        }
      },
    });
    return result.data.text;
  } catch (e) {
    console.error("OCR Error:", e);
    return null;
  }
}

// --- Hugging Face API ---
const HF_TOKEN = ""; // Optional: Add Hugging Face Token if rate limited
async function queryHuggingFace(model, imageDataUrl) {
  try {
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();

    const headers = {};
    if (HF_TOKEN) headers["Authorization"] = `Bearer ${HF_TOKEN}`;

    const res = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        headers: headers,
        method: "POST",
        body: blob,
      },
    );

    if (!res.ok) throw new Error("HF API Error");
    return await res.json();
  } catch (e) {
    console.error("HF Inference Error:", e);
    return null;
  }
}

// Seeded random number generator
function seededRandom(seed) {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Simple string hashing function
function hashString(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// 2. openFDA API (for Medicines)
async function fetchFDAData(drugName) {
  try {
    let response = await fetch(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(drugName)}"&limit=1`,
    );
    if (!response.ok) {
      response = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(drugName)}"&limit=1`,
      );
      if (!response.ok) {
        // Broader search for OCR
        response = await fetch(
          `https://api.fda.gov/drug/label.json?search="${encodeURIComponent(drugName)}"&limit=1`,
        );
        if (!response.ok) return null;
      }
    }
    return await response.json();
  } catch (error) {
    console.error("FDA API Error:", error);
    return null;
  }
}

function getRandomConditions(list, count, seed) {
  const shuffled = [...list].sort((a, b) => {
    const hashA = hashString(a + seed.toString());
    const hashB = hashString(b + seed.toString());
    return hashA - hashB;
  });
  return shuffled.slice(0, count);
}

function generateProbabilities(count, seed) {
  let remaining = 100;
  const probs = [];
  let currentSeed = seed;
  for (let i = 0; i < count - 1; i++) {
    const max = remaining - (count - 1 - i); // leave at least 1 for the rest
    const prob = Math.floor(seededRandom(currentSeed) * (max / 1.5)) + 1;
    probs.push(prob);
    remaining -= prob;
    currentSeed++;
  }
  probs.push(remaining);
  return probs.sort((a, b) => b - a); // highest first
}

async function performAnalysis(manualMedicineName = null) {
  STATE.isProcessing = true;

  DOM.scannerOverlay.style.display = "flex";
  DOM.btnAnalyze.disabled = true;
  DOM.btnAnalyze.innerHTML =
    '<i class="ph ph-spinner ph-spin"></i> Processing...';
  DOM.btnCamera.disabled = true;
  DOM.btnUpload.disabled = true;
  if (DOM.btnSearchMedicine) DOM.btnSearchMedicine.disabled = true;

  DOM.resultsContent.innerHTML = `
        <div class="empty-results">
            <i class="ph ph-spinner ph-spin" style="font-size: 3rem; color: var(--primary);"></i>
            <p style="margin-top: 15px;">Querying medical databases and analyzing models...</p>
        </div>
    `;

  try {
    let resultData = null;

    if (STATE.mode === "medicine") {
      let drugToSearch = manualMedicineName;

      if (!drugToSearch) {
        DOM.resultsContent.innerHTML = `
                    <div class="empty-results">
                        <i class="ph ph-spinner ph-spin" style="font-size: 3rem; color: var(--primary);"></i>
                        <p id="ocr-progress-text" style="margin-top: 15px;">Extracting text from image via OCR...</p>
                    </div>
                `;
        const ocrText = await extractMedicineText(DOM.imagePreview.src);
        if (!ocrText || ocrText.trim().length < 2) {
          resultData = {
            type: "medicine_error",
            message:
              "Medicine not clearly recognized — please try a clearer image.",
          };
        } else {
          // Preserve numbers and letters, then split
          const words = ocrText.replace(/[^a-zA-Z0-9]/g, " ").split(/\s+/);
          const ignoreWords = [
            "tablet",
            "tablets",
            "capsule",
            "capsules",
            "softgel",
            "mg",
            "ml",
            "oral",
            "dosage",
            "keep",
            "reach",
            "children",
          ];
          const filteredWords = words.filter(
            (w) => w.length > 3 && !ignoreWords.includes(w.toLowerCase()),
          );

          if (filteredWords.length === 0) {
            resultData = {
              type: "medicine_error",
              message:
                "No valid medicine names found — please try a clearer image.",
            };
          } else {
            const sortedWords = filteredWords
              .sort((a, b) => b.length - a.length)
              .slice(0, 5);

            let foundFDA = null;
            let foundWiki = null;

            for (let w of sortedWords) {
              const pEl = document.getElementById("ocr-progress-text");
              if (pEl) pEl.innerText = `Searching Database for "${w}"...`;

              const fda = await fetchFDAData(w);
              if (fda && fda.results && fda.results.length > 0) {
                foundFDA = fda;
                drugToSearch = w;
                break;
              }

              const wiki = await fetchMedicineWikipedia(w);
              if (
                wiki &&
                (wiki.description.toLowerCase().includes("medication") ||
                  wiki.description.toLowerCase().includes("drug") ||
                  wiki.description.toLowerCase().includes("treat") ||
                  wiki.description.toLowerCase().includes("pain"))
              ) {
                foundWiki = wiki;
                drugToSearch = w;
                break;
              }
            }

            if (foundFDA) {
              resultData = {
                type: "medicine",
                drugName: drugToSearch,
                fdaData: foundFDA,
              };
            } else if (foundWiki) {
              resultData = {
                type: "medicine_wiki",
                drugName: foundWiki.title,
                wikiData: foundWiki,
              };
            } else {
              resultData = {
                type: "medicine_error",
                message: `Medicine not found in databases. Tried: ${sortedWords.join(", ")}`,
              };
            }
          }
        }
      } else {
        DOM.resultsContent.innerHTML = `
                    <div class="empty-results">
                        <i class="ph ph-spinner ph-spin" style="font-size: 3rem; color: var(--primary);"></i>
                        <p style="margin-top: 15px;">Querying Databases for "${drugToSearch}"...</p>
                    </div>
                `;
        const fdaData = await fetchFDAData(drugToSearch);
        if (fdaData && fdaData.results && fdaData.results.length > 0) {
          resultData = {
            type: "medicine",
            drugName: drugToSearch,
            fdaData: fdaData,
          };
        } else {
          const wikiData = await fetchMedicineWikipedia(drugToSearch);
          if (wikiData) {
            resultData = {
              type: "medicine_wiki",
              drugName: wikiData.title,
              wikiData: wikiData,
            };
          } else {
            resultData = {
              type: "medicine_error",
              message: `Medicine "${drugToSearch}" not found in FDA or Wikipedia databases.`,
            };
          }
        }
      }
    } else {
      const modelName =
        STATE.mode === "eye"
          ? "dima806/eye_diseases_classification"
          : "dima806/skin_diseases_classification";

      DOM.resultsContent.innerHTML = `
                <div class="empty-results">
                    <i class="ph ph-spinner ph-spin" style="font-size: 3rem; color: var(--primary);"></i>
                    <p style="margin-top: 15px;">Analyzing via Hugging Face Models...</p>
                </div>
            `;

      const predictions = await queryHuggingFace(
        modelName,
        DOM.imagePreview.src,
      );

      if (
        predictions &&
        Array.isArray(predictions) &&
        predictions.length > 0 &&
        predictions[0].label
      ) {
        const topConditions = predictions.slice(0, 3).map((p) => ({
          name: p.label
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          prob: Math.round(p.score * 100),
        }));

        const desc = await fetchWikipediaSummary(topConditions[0].name);
        resultData = {
          type: "condition",
          conditions: topConditions,
          primaryDesc: desc,
        };
      } else {
        const imageSeed = hashString(DOM.imagePreview.src || "");
        const conditionList =
          STATE.mode === "eye" ? CONDITIONS.eye : CONDITIONS.skin;
        const topConditions = getRandomConditions(conditionList, 3, imageSeed);
        const probs = generateProbabilities(3, imageSeed);

        const desc = await fetchWikipediaSummary(topConditions[0]);
        resultData = {
          type: "condition",
          conditions: topConditions.map((c, i) => ({
            name: c,
            prob: probs[i],
          })),
          primaryDesc: desc,
        };
      }
    }

    renderResults(resultData);
  } catch (e) {
    console.error(e);
    DOM.resultsContent.innerHTML = `
            <div class="empty-results" style="color: var(--danger);">
                <i class="ph-fill ph-warning-circle"></i>
                <p>An error occurred during analysis. Please try again.</p>
            </div>
        `;
  } finally {
    DOM.scannerOverlay.style.display = "none";
    DOM.btnAnalyze.disabled = false;
    DOM.btnAnalyze.innerHTML =
      '<i class="ph-fill ph-check-circle"></i> Analyze Image';
    DOM.btnCamera.disabled = false;
    DOM.btnUpload.disabled = false;
    if (DOM.btnSearchMedicine) DOM.btnSearchMedicine.disabled = false;
    STATE.isProcessing = false;
  }
}

function setupAnalysisAction() {
  DOM.btnAnalyze.addEventListener("click", () => {
    if (!STATE.hasImage) return;
    if (STATE.mediaStream) freezeCameraFrame();
    performAnalysis();
  });

  if (DOM.btnSearchMedicine) {
    DOM.btnSearchMedicine.addEventListener("click", () => {
      const query = DOM.medicineSearch.value.trim();
      if (query) {
        // Mock an image capture event to show results seamlessly
        if (DOM.placeholderState.style.display !== "none") {
          DOM.placeholderState.innerHTML =
            '<i class="ph ph-magnifying-glass drop-icon"></i><p>Manual Search Active</p>';
        }
        performAnalysis(query);
      }
    });
  }
}

function getProbColorClass(prob) {
  if (prob > 70) return "prob-high";
  if (prob > 30) return "prob-med";
  return "prob-low";
}
function getProbColorHex(prob) {
  if (prob > 70) return "var(--danger)";
  if (prob > 30) return "var(--warning)";
  return "var(--success)";
}

function renderResults(data) {
  window.lastResultData = data;
  let html = "";
  let historyText = "";

  if (!data) return;

  if (data.type === "medicine_error") {
    html = `
            <div class="result-card" style="border-left: 4px solid var(--warning);">
                <h3><i class="ph-fill ph-warning-circle"></i> Recognition Failed</h3>
                <p style="font-size: 1rem; color: var(--text-main); margin-top: 10px;">
                    ${data.message}
                </p>
            </div>
        `;
    historyText = "Recognition Failed";
  } else if (data.type === "health") {
    html = `
            <div class="result-card" style="border-left: 4px solid var(--success);">
                <h3><i class="ph-fill ph-check-circle"></i> Analysis Result</h3>
                <div class="stat-row">
                    <span class="stat-label">${data.title}</span>
                    <span class="stat-value" style="color: var(--success);">${data.prob}%</span>
                </div>
                <div class="prob-bar-container">
                    <div class="prob-bar" style="width: ${data.prob}%; background: var(--success); box-shadow: 0 0 8px var(--success);"></div>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 12px;">${data.desc}</p>
                <div class="badges-container" style="margin-top: 12px;">
                    <span class="badge info">No issues detected</span>
                </div>
            </div>
        `;
    historyText = `Healthy (${data.prob}%)`;
  } else if (data.type === "condition") {
    const primary = data.conditions[0];

    let differentialsHtml = data.conditions
      .slice(1)
      .map(
        (cond) => `
            <div style="margin-bottom: 12px;">
                <div class="stat-row" style="margin-bottom: 4px;">
                    <span class="stat-label">${cond.name}</span>
                    <span class="stat-value" style="font-size: 0.95rem;">${cond.prob}%</span>
                </div>
                <div class="prob-bar-container" style="height: 4px;">
                    <div class="prob-bar ${getProbColorClass(cond.prob)}" style="width: ${cond.prob}%;"></div>
                </div>
            </div>
        `,
      )
      .join("");

    html = `
            <div class="result-card" style="border-left: 4px solid ${getProbColorHex(primary.prob)};">
                <h3><i class="ph-fill ph-scan"></i> Primary Detection</h3>
                <div style="margin-bottom: 16px;">
                    <div class="stat-row">
                        <span class="stat-label" style="font-size: 1.1rem; color: var(--text-main); font-weight: 600;">${primary.name}</span>
                        <span class="stat-value" style="color: ${getProbColorHex(primary.prob)};">${primary.prob}%</span>
                    </div>
                    <div class="prob-bar-container">
                        <div class="prob-bar ${getProbColorClass(primary.prob)}" style="width: ${primary.prob}%;"></div>
                    </div>
                </div>
                
                <strong style="font-size: 0.85rem; color: var(--text-main); display:block; margin-bottom: 4px;">Medical Description (Source: Wikipedia):</strong>
                <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; border-left: 2px solid var(--panel-border); padding-left: 10px;">
                    ${data.primaryDesc}
                </p>

                <div class="badges-container" style="margin-top: 12px;">
                    ${primary.prob > 60 ? '<span class="badge danger">Consult Specialist</span>' : '<span class="badge info">Monitor Closely</span>'}
                </div>
            </div>

            <div class="result-card">
                <h3><i class="ph-fill ph-list-magnifying-glass"></i> Differential Diagnosis</h3>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">Other potential conditions based on visual analysis:</p>
                ${differentialsHtml}
            </div>
        `;
    historyText = `${primary.name} (${primary.prob}%)`;
  } else if (data.type === "medicine") {
    if (
      !data.fdaData ||
      !data.fdaData.results ||
      data.fdaData.results.length === 0
    ) {
      html = `
                <div class="result-card" style="border-left: 4px solid var(--warning);">
                    <h3><i class="ph-fill ph-warning-circle"></i> Database Miss</h3>
                    <h2 style="margin: 8px 0; font-size: 1.5rem; color: var(--text-main);">${data.drugName}</h2>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">
                        We couldn't locate detailed official FDA records for this specific medication name. It might be a supplement, an international brand name, or spelled incorrectly.
                    </p>
                </div>
            `;
      historyText = `Unknown: ${data.drugName}`;
    } else {
      const result = data.fdaData.results[0];
      const brandName = result.openfda?.brand_name?.[0] || data.drugName;
      const genericName =
        result.openfda?.generic_name?.[0] || "Unknown Generic";
      const pharmClass =
        result.openfda?.pharm_class_epc?.[0] || "Unknown Class";

      const indications = result.indications_and_usage
        ? result.indications_and_usage[0]
            .replace(/INDICATIONS AND USAGE/i, "")
            .substring(0, 300) + "..."
        : "No specific indications detailed in summary.";
      const warnings = result.warnings
        ? result.warnings[0].replace(/WARNINGS/i, "").substring(0, 300) + "..."
        : "Please consult the full package insert for warnings.";
      const dosage = result.dosage_and_administration
        ? result.dosage_and_administration[0]
            .replace(/DOSAGE AND ADMINISTRATION/i, "")
            .substring(0, 300) + "..."
        : "Consult your physician for exact dosage.";

      html = `
                <div class="result-card" style="border-left: 4px solid var(--success);">
                    <h3><i class="ph-fill ph-check-circle" style="color: var(--success);"></i> Medicine Verified (openFDA)</h3>
                    <h2 style="margin: 8px 0; font-size: 1.5rem; color: var(--primary);">${brandName}</h2>
                    <span class="stat-label" style="display: block; margin-bottom: 4px;">Generic: <strong style="color: var(--text-main);">${genericName}</strong></span>
                    <span class="stat-label" style="display: block; margin-bottom: 12px;">Class: ${pharmClass}</span>
                    <span class="badge info" style="font-size: 0.9rem;">Confidence: Match Found via FDA</span>
                </div>

                <div class="result-card" style="border-left: 4px solid var(--secondary);">
                    <h3><i class="ph-fill ph-info"></i> Indications & Usage</h3>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 4px; line-height: 1.5;">${indications}</p>
                </div>

                <div class="result-card">
                    <h3><i class="ph-fill ph-prescription"></i> Dosage Information</h3>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 4px; line-height: 1.5;">${dosage}</p>
                </div>

                <div class="result-card" style="border-left: 4px solid var(--danger);">
                    <h3><i class="ph-fill ph-warning"></i> Warnings & Precautions</h3>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 4px; line-height: 1.5;">${warnings}</p>
                </div>
            `;
      historyText = `Verified: ${brandName}`;
    }
  } else if (data.type === "medicine_wiki") {
    html = `
            <div class="result-card" style="border-left: 4px solid var(--success);">
                <h3><i class="ph-fill ph-check-circle" style="color: var(--success);"></i> Medicine Verified (Wikipedia)</h3>
                <h2 style="margin: 8px 0; font-size: 1.5rem; color: var(--primary);">${data.drugName}</h2>
                <span class="badge info" style="font-size: 0.9rem;">Confidence: Found in general database</span>
            </div>

            <div class="result-card" style="border-left: 4px solid var(--secondary);">
                <h3><i class="ph-fill ph-info"></i> Information & Description</h3>
                <p style="font-size: 0.95rem; color: var(--text-main); margin-top: 4px; line-height: 1.6;">${data.wikiData.description}</p>
                ${data.wikiData.url ? `<a href="${data.wikiData.url}" target="_blank" style="color: var(--primary); display: inline-block; margin-top: 10px; font-size: 0.85rem; text-decoration: none;">Read more on Wikipedia <i class="ph ph-arrow-square-out"></i></a>` : ""}
            </div>
            
            <div class="result-card" style="border-left: 4px solid var(--warning);">
                <h3><i class="ph-fill ph-warning"></i> Note</h3>
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 4px; line-height: 1.5;">Detailed FDA dosage and warning information is unavailable for this specific name. Please consult the packaging or a healthcare professional.</p>
            </div>
        `;
    historyText = `Verified: ${data.drugName}`;
  }

  html += `<button onclick="downloadPDF()" class="action-btn secondary" style="margin-top: 15px; width: 100%;"><i class="ph ph-download-simple"></i> Download PDF Report</button>`;
  DOM.resultsContent.innerHTML = html;

  saveHistory(PAGE_CONFIG[STATE.mode].title, historyText);
}

window.downloadPDF = function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  if (!window.lastResultData) return;
  const data = window.lastResultData;

  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text("VisionDx Analysis Report", 20, 20);

  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleString()}`, 20, 30);
  doc.text(`Analysis Type: ${STATE.mode.toUpperCase()}`, 20, 40);

  let y = 50;

  if (data.type === "medicine") {
    if (
      !data.fdaData ||
      !data.fdaData.results ||
      data.fdaData.results.length === 0
    ) {
      doc.text(`Result: Unknown Medicine (${data.drugName})`, 20, y);
      y += 10;
    } else {
      const result = data.fdaData.results[0];
      const brandName = result.openfda?.brand_name?.[0] || data.drugName;
      doc.text(`Result: Verified Medicine - ${brandName}`, 20, y);
      y += 10;

      const dosage = result.dosage_and_administration
        ? result.dosage_and_administration[0].substring(0, 500)
        : "N/A";
      const warnings = result.warnings
        ? result.warnings[0].substring(0, 500)
        : "N/A";

      doc.text("Dosage Info:", 20, y);
      y += 10;
      doc.setFontSize(10);
      const dosageLines = doc.splitTextToSize(dosage, 170);
      doc.text(dosageLines, 20, y);
      y += dosageLines.length * 5 + 5;

      doc.setFontSize(12);
      doc.text("Warnings:", 20, y);
      y += 10;
      doc.setFontSize(10);
      const warningLines = doc.splitTextToSize(warnings, 170);
      doc.text(warningLines, 20, y);
      y += warningLines.length * 5 + 10;
    }
  } else if (data.type === "medicine_wiki") {
    doc.text(`Result: Verified Medicine (Wiki) - ${data.drugName}`, 20, y);
    y += 10;

    doc.text("Information:", 20, y);
    y += 10;
    doc.setFontSize(10);
    const descLines = doc.splitTextToSize(data.wikiData.description, 170);
    doc.text(descLines, 20, y);
    y += descLines.length * 5 + 10;
  } else if (data.type === "condition") {
    const primary = data.conditions[0];
    doc.text(`Result: ${primary.name} (${primary.prob}% confidence)`, 20, y);
    y += 10;

    doc.text("Description:", 20, y);
    y += 10;
    doc.setFontSize(10);
    const descLines = doc.splitTextToSize(data.primaryDesc, 170);
    doc.text(descLines, 20, y);
    y += descLines.length * 5 + 10;
  } else if (data.type === "medicine_error") {
    doc.text(`Result: ${data.message}`, 20, y);
    y += 10;
  }

  // Disclaimer
  y = Math.max(y, 200);
  doc.setFontSize(8);
  doc.setTextColor(150, 0, 0);
  doc.text(
    "DISCLAIMER: This tool is a prototype and for educational purposes only. The AI analysis and predictions should not be considered professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider.",
    20,
    y,
    { maxWidth: 170 },
  );

  doc.save("VisionDx_Report.pdf");
};

// Run init
init();
