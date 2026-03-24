# Driver Drowsiness Detection System

> A real-time intelligent web application that predicts driver fatigue using a deep learning model trained on physiological and behavioral sensor data. Built with Keras, Flask, and a responsive vanilla JavaScript frontend.

---

## Table of Contents

- [About the Project](#about-the-project)
- [How It Works](#how-it-works)
- [Model Architecture](#model-architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setting Up a Virtual Environment](#setting-up-a-virtual-environment)
- [Installing Dependencies](#installing-dependencies)
- [Running the Application](#running-the-application)
- [Tech Stack](#tech-stack)

---

## About the Project

Driver drowsiness is one of the leading causes of road accidents worldwide. This system provides an intelligent, data-driven solution to detect fatigue in real time by analyzing a combination of physiological signals and driving behavior patterns.

The application presents a clean web interface where sensor readings — such as eye closure duration, blink rate, heart rate, and reaction time — are input via interactive sliders. These values are sent to a Flask backend, preprocessed, and passed through a trained Artificial Neural Network (ANN) that predicts the driver's alertness level along with a risk probability score.

### Key Highlights

- Trained ANN model with **binary classification** (Alert vs Drowsy)
- Custom **decision threshold of 0.46** tuned for higher recall (safety-critical)
- Interactive **risk gauge**, **probability bar**, and **reasons panel** on the frontend
- Fully decoupled frontend and backend communicating via a REST API
- Lightweight and runs entirely on a local machine — no cloud dependency

---

## How It Works

```
User adjusts sliders  →  JavaScript collects values  →  POST /predict (JSON)
        ↓
Flask receives request  →  Pandas DataFrame  →  Preprocessor (scale + encode)
        ↓
Keras ANN predicts probability  →  Threshold applied  →  JSON response
        ↓
Frontend renders gauge, status badge, probability bar, and reasons panel
```

1. The user sets all sensor values using the sliders in the browser.
2. On clicking **Analyze Driver State**, the frontend sends a JSON POST request to `/predict`.
3. Flask preprocesses the input using a saved `scikit-learn` preprocessor (handles scaling and encoding).
4. The Keras model outputs a drowsiness probability between 0 and 1.
5. If probability ≥ 0.46, the driver is classified as **Drowsy**; otherwise **Alert**.
6. The result is displayed with a visual gauge, color-coded status, and an explanation panel listing the top contributing factors.

---

## Model Architecture

The model is a fully connected feedforward neural network (ANN) built with the Keras Sequential API.

- **Loss Function:** Binary Crossentropy
- **Optimizer:** Adam
- **Evaluation Metrics:** Accuracy, Recall, AUC-ROC
- **Decision Threshold:** 0.40 — tuned to minimize false negatives, since missing a drowsy driver is more dangerous than a false alarm

---

## Project Structure

```
deep learning/
│
├── app.py                        # Flask application — API routes and model inference
├── model.keras                   # Saved Keras ANN model
├── preprocessor.pkl              # Saved scikit-learn preprocessor pipeline
│
├── templates/
│   └── index.html                # Main frontend HTML page (served by Flask)
│
└── static/
    ├── style.css                 # All styling — layout, gauge, sliders, badges
    └── app.js                    # Frontend logic — sliders, API call, gauge, reasons
```


## Prerequisites

Before setting up the project, ensure the following are installed on your system.

| Requirement | Version | Notes |
|-------------|---------|-------|
| Python | **3.10.x** | TensorFlow does NOT support Python 3.11 or 3.13 |
| pip | Latest | Comes bundled with Python |

### Check your Python version

```bash
python --version
```

If you have multiple Python versions installed:

```bash
py -3.10 --version
```

Download Python 3.10 from: https://www.python.org/downloads/release/python-31011/

> During installation on Windows, check  **"Add Python to PATH"**

---

## Setting Up a Virtual Environment

A virtual environment isolates your project's dependencies from your global Python installation. This prevents version conflicts between different projects and is strongly recommended.

### Step 1 — Navigate to the project folder

```bash
cd "path/to/ann"
```

Example on Windows:
```bash
cd "C:/Users/yourname/Desktop/projects/ann

### Step 2 — Create the virtual environment

```bash
py -3.10 -m venv venv
```

This creates a `venv/` folder inside your project directory containing an isolated Python 3.10 environment. Always create the venv **inside the project folder** — creating it elsewhere causes broken pip paths.

### Step 3 — Activate the virtual environment

**On Windows:**
```bash
venv\Scripts\activate
```

**On macOS / Linux:**
```bash
source venv/bin/activate
```

Once activated, your terminal prompt will show `(venv)` at the start:

```
(venv) PS C:\Users\yourname\Desktop\projects\ann>
```

### Step 4 — Deactivating when done

```bash
deactivate
```

> ⚠️ Always ensure the venv is activated before running the app or installing packages. If you see `ModuleNotFoundError`, the venv is likely not active.

---

## Installing Dependencies

With the virtual environment activated, install all required packages in one command:

```bash
pip install tensorflow keras flask flask-cors joblib pandas scikit-learn
```

| Package | Purpose |
|---------|---------|
| `tensorflow` | Deep learning backend for Keras |
| `keras` | High-level neural network API |
| `flask` | Web framework for the REST API |
| `flask-cors` | Handles Cross-Origin Resource Sharing |
| `joblib` | Loads the saved preprocessor |
| `pandas` | Constructs the input DataFrame for inference |
| `scikit-learn` | Required by the saved preprocessor pipeline |

Verify all packages are installed:
```bash
pip list
```

---

## Running the Application

### Step 1 — Activate the virtual environment

```bash
venv\Scripts\activate
```

### Step 2 — Start the Flask server

```bash
python app.py
```

You should see:

```
Model loaded.
Preprocessor loaded.
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### Step 3 — Open in your browser

```
http://127.0.0.1:5000
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Deep Learning | Keras / TensorFlow 2.x |
| Backend | Flask, Flask-CORS |
| Data Processing | Pandas, NumPy, Scikit-learn |
| Model Persistence | Joblib, Keras `.keras` format |
| Frontend | HTML5, CSS3, Vanilla JavaScript |

---


## Important Notes

- Always use the **same virtual environment** for both training the model (notebook) and running the Flask app. Mixing Keras versions causes deserialization errors when loading `model.keras`.
- The threshold of **0.46** was deliberately set below 0.5 to prioritize **recall** over precision — in a safety-critical system, a false drowsiness alarm is far less harmful than missing a truly drowsy driver.
- The frontend reasons panel is generated entirely client-side using rule-based thresholds on the raw input values. It does not use the model's internals, making it fast and transparent.

---

*Built for road safety research and educational purposes.*
