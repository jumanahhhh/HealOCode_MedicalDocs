from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import sys
from pathlib import Path

# Add the scripts directory to Python path
scripts_dir = Path(__file__).parent.parent / "scripts"
sys.path.append(str(scripts_dir))

from summarise_pdf import MedicalPDFSummarizer

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/process_excel', methods=['POST'])
def process_excel():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        # Read the Excel file
        df = pd.read_excel(filepath)
        data_summary = df.describe().to_dict()  # Example processing

        return jsonify({"message": "File processed successfully", "summary": data_summary})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.remove(filepath)  # Clean up after processing

@app.route('/process_pdf', methods=['POST'])
def process_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "File must be a PDF"}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        # Initialize the summarizer
        summarizer = MedicalPDFSummarizer()
        
        # Extract text from PDF
        medical_text = summarizer.extract_text_from_pdf(filepath)
        
        if not medical_text:
            return jsonify({"error": "Failed to extract text from PDF"}), 500
        
        # Generate both summaries
        patient_summary = summarizer.generate_patient_summary(medical_text)
        doctor_summary = summarizer.generate_doctor_summary(medical_text)
        
        return jsonify({
            "message": "PDF processed successfully",
            "patient_summary": patient_summary,
            "doctor_summary": doctor_summary
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.remove(filepath)  # Clean up after processing

if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Run Flask on port 5001
