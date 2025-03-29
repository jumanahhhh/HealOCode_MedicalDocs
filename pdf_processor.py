import os
import sys
import pdfplumber
import PyPDF2
from typing import Dict, Any, Optional

def extract_text_from_pdf(pdf_path):
    """
    Extract text from a PDF file using multiple methods
    
    :param pdf_path: Path to the PDF file
    :return: Extracted text or error message
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
                return {"success": True, "text": full_text}
        
        # Fallback to PyPDF2 if pdfplumber fails
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            full_text = ""
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"
            
            if full_text.strip():
                return {"success": True, "text": full_text}
            else:
                return {"success": False, "error": "No text could be extracted from the PDF"}
    
    except Exception as e:
        return {"success": False, "error": f"Error extracting text from PDF: {str(e)}"}

if __name__ == "__main__":
    # This script expects the PDF file path as the first argument
    if len(sys.argv) < 2:
        print({"success": False, "error": "No PDF path provided"})
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    # Check if file exists
    if not os.path.exists(pdf_path):
        print({"success": False, "error": f"File not found: {pdf_path}"})
        sys.exit(1)
    
    # Extract text from PDF
    result = extract_text_from_pdf(pdf_path)
    
    # Print result as JSON string for the Node.js app to parse
    import json
    print(json.dumps(result))