import os
import joblib
import pandas as pd
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
from keras.models import load_model

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = load_model(os.path.join(BASE_DIR, "model.keras"))
print("Model loaded.")

preprocessor = joblib.load(os.path.join(BASE_DIR, "preprocessor.pkl"))
print("Preprocessor loaded.")

THRESHOLD = 0.40

# ── Feature order must match what the preprocessor was fitted on ──────────────
FEATURE_COLS = [
    "Age", "Gender", "Blink_Rate", "Eye_Closure_Duration",
    "Yawning_Count", "Heart_Rate", "Head_Tilt_Angle",
    "Steering_Variation", "Reaction_Time", "Sleep_Hours_Last_Night",
]

# ── Flask app ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        # Build a single-row DataFrame in the correct column order
        row = {
            "Age": float(data["age"]),
            "Gender": str(data["gender"]),
            "Blink_Rate": float(data["blink_rate"]),
            "Eye_Closure_Duration": float(data["eye_closure_duration"]),
            "Yawning_Count": float(data["yawning_count"]),
            "Heart_Rate": float(data["heart_rate"]),
            "Head_Tilt_Angle": float(data["head_tilt_angle"]),
            "Steering_Variation": float(data["steering_variation"]),
            "Reaction_Time": float(data["reaction_time"]),
            "Sleep_Hours_Last_Night": float(data["sleep_hours"]),
        }

        # Clip Blink_Rate as done during training
        row["Blink_Rate"] = min(row["Blink_Rate"], 41.0)

        df_input = pd.DataFrame([row], columns=FEATURE_COLS)

        # Preprocess & Predict
        X_prep = preprocessor.transform(df_input)
        prob = float(model.predict(X_prep).ravel()[0])
        drowsy = prob >= THRESHOLD
        print(drowsy,prob,"-------------------------------------------------------------")
        return jsonify({
            "drowsy": bool(drowsy),
            "probability": round(prob, 4),
            "label": "Drowsy" if drowsy else "Alert",
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)