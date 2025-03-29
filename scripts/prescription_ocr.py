import os
import cv2
import pytesseract
import sys
import json
from typing import Dict, Any, Optional

class PrescriptionOCR:
    def __init__(self):
        """
        Initialize the Prescription OCR processor
        """
        pass
        
    def preprocess_image(self, image_path: str) -> Optional[cv2.Mat]:
        """
        Preprocess the image for better OCR results
        
        :param image_path: Path to the image file
        :return: Processed image or None if processing fails
        """
        try:
            image = cv2.imread(image_path)
            if image is None:
                print(f"Error: Could not load image at {image_path}", file=sys.stderr)
                return None
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply thresholding
            _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
            
            return thresh
        except Exception as e:
            print(f"Error preprocessing image: {str(e)}", file=sys.stderr)
            return None
    
    def extract_text(self, image_path: str) -> Optional[str]:
        """
        Extract text from the image using OCR
        
        :param image_path: Path to the image file
        :return: Extracted text or None if extraction fails
        """
        try:
            processed_img = self.preprocess_image(image_path)
            if processed_img is None:
                return None
            
            # Run OCR on the processed image
            extracted_text = pytesseract.image_to_string(processed_img)
            return extracted_text.strip()
        except Exception as e:
            print(f"Error extracting text: {str(e)}", file=sys.stderr)
            return None
    
    def process_prescription(self, image_path: str) -> Dict[str, Any]:
        """
        Process a prescription image and return extracted information
        
        :param image_path: Path to the prescription image
        :return: Dictionary containing extracted text and processing status
        """
        try:
            extracted_text = self.extract_text(image_path)
            
            if not extracted_text:
                return {
                    "success": False,
                    "error": "Failed to extract text from the image",
                    "extracted_text": None
                }
            
            return {
                "success": True,
                "extracted_text": extracted_text,
                "error": None
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "extracted_text": None
            }

def main():
    if len(sys.argv) != 2:
        print("Usage: python prescription_ocr.py <image_path>", file=sys.stderr)
        sys.exit(1)
        
    image_path = sys.argv[1]
    
    # Check if image file exists
    if not os.path.exists(image_path):
        print(f"Error: The file {image_path} does not exist.", file=sys.stderr)
        sys.exit(1)
    
    # Process the prescription
    ocr = PrescriptionOCR()
    result = ocr.process_prescription(image_path)
    
    # Print result as JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main()