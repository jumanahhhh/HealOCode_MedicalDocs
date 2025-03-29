import os
import sys
import ollama
import pdfplumber
import PyPDF2
from typing import Dict, Any, Optional

class MedicalPDFSummarizer:
    def __init__(self, model: str = "mistral"):
        """
        Initialize the Medical PDF Summarizer
        
        :param model: Ollama model to use for summarization
        """
        self.model = model
        
    def _medical_term_glossary(self) -> Dict[str, str]:
        """
        Create a glossary of medical terms with layman explanations
        
        :return: Dictionary of medical terms and their simple explanations
        """
        return {
            "Type 2 Diabetes": "A condition where the body doesn't use insulin properly, leading to high blood sugar levels.",
            "Hyperlipidemia": "High levels of cholesterol and fats in the blood, increasing heart disease risk.",
            "HbA1c": "A blood test that measures average blood sugar over the past 2-3 months.",
            "Metformin": "A medication that helps lower blood sugar levels in diabetes patients.",
            "Atorvastatin": "A cholesterol-lowering medication that reduces heart disease risk.",
            "Hypertension": "High blood pressure that can lead to heart disease or stroke.",
        }
    
    def extract_text_from_pdf(self, pdf_path: str) -> Optional[str]:
        """
        Extract text from a PDF file using multiple methods
        
        :param pdf_path: Path to the PDF file
        :return: Extracted text or None if extraction fails
        """
        try:
            # First, try pdfplumber for more robust extraction
            with pdfplumber.open(pdf_path) as pdf:
                # Extract text from all pages
                full_text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        full_text += page_text + "\n"
                
                # If text is extracted successfully
                if full_text.strip():
                    return full_text
            
            # Fallback to PyPDF2 if pdfplumber fails
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                full_text = ""
                for page in reader.pages:
                    full_text += page.extract_text() + "\n"
                
                return full_text
        
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return None
    
    def generate_patient_summary(self, medical_text: str) -> str:
        """
        Generate a patient-friendly summary with explanations of medical terms
        
        :param medical_text: Medical report text
        :return: Simplified summary with explanations
        """
        glossary = self._medical_term_glossary()
        
        patient_prompt = f"""
        Summarize the following medical document in a CONSISTENT format with the following MANDATORY fields:
        - Patient Name
        - Age
        - Gender
        - Medical History
        - Current Symptoms
        - Diagnostic Tests
        - Diagnosis
        - Prescription
        - Recommendations
        - Follow-up Plans
        
        Use simple language, explain medical terms, and provide clear information.
        If any field is not applicable, use 'N/A'

        Medical Document:
        {medical_text}
        """
        
        patient_summary = ollama.chat(
            model=self.model, 
            messages=[{"role": "user", "content": patient_prompt}]
        )
        
        summary_text = patient_summary['message']['content']
        
        for term, explanation in glossary.items():
            if term in summary_text:
                summary_text = summary_text.replace(term, f"{term} ({explanation})")
        
        return summary_text
    
    def generate_doctor_summary(self, medical_text: str) -> str:
        """
        Generate a detailed medical summary for healthcare providers
        
        :param medical_text: Medical report text
        :return: Detailed medical summary
        """
        doctor_prompt = f"""
        Provide a comprehensive medical summary for healthcare providers 
        using the SAME CONSISTENT format:
        - Patient Name
        - Age
        - Gender
        - Medical History
        - Current Symptoms
        - Diagnostic Tests
        - Diagnosis
        - Prescription
        - Recommendations
        - Follow-up Plans

        Use precise medical terminology and provide in-depth clinical insights.
        If any field is not applicable, use 'N/A'

        Medical Document:
        {medical_text}
        """
        
        doctor_summary = ollama.chat(
            model=self.model, 
            messages=[{"role": "user", "content": doctor_prompt}]
        )
        
        return doctor_summary['message']['content']

def process_pdf(pdf_path: str) -> str:
    """
    Process a PDF file and return the summaries
    
    :param pdf_path: Path to the PDF file
    :return: Combined summaries
    """
    # Initialize summarizer
    summarizer = MedicalPDFSummarizer()
    
    # Extract text from PDF
    medical_text = summarizer.extract_text_from_pdf(pdf_path)
    
    if not medical_text:
        print("Failed to extract text from the PDF.", file=sys.stderr)
        sys.exit(1)
    
    # Generate summaries
    patient_summary = summarizer.generate_patient_summary(medical_text)
    doctor_summary = summarizer.generate_doctor_summary(medical_text)
    
    # Combine summaries
    return f"Patient-Friendly Summary:\n{patient_summary}\n\nDoctor-Specific Summary:\n{doctor_summary}"

def main():
    if len(sys.argv) != 2:
        print("Usage: python summarise_pdf.py <pdf_path>", file=sys.stderr)
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    
    # Check if PDF file exists
    if not os.path.exists(pdf_path):
        print(f"Error: The file {pdf_path} does not exist.", file=sys.stderr)
        sys.exit(1)
    
    # Check if it's actually a PDF
    if not pdf_path.lower().endswith('.pdf'):
        print("Error: Please select a PDF file.", file=sys.stderr)
        sys.exit(1)
    
    try:
        summary = process_pdf(pdf_path)
        print(summary)
    except Exception as e:
        print(f"Error processing PDF: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()