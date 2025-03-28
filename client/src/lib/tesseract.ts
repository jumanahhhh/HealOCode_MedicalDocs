import * as Tesseract from 'tesseract.js';
import { addNotification } from './notification';

// Processing state flag
let isProcessing = false;

// Function to extract text from an image
export const extractTextFromImage = async (imageUrl: string): Promise<{ text: string, confidence: number }> => {
  if (isProcessing) {
    throw new Error('OCR is already processing an image');
  }
  
  isProcessing = true;
  
  try {
    const worker = await Tesseract.createWorker('eng');
    const result = await worker.recognize(imageUrl);
    await worker.terminate();
    
    isProcessing = false;
    return {
      text: result.data.text,
      confidence: result.data.confidence
    };
  } catch (error) {
    isProcessing = false;
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from the image');
  }
};

// Function to extract medications from OCR result
export const extractMedications = (text: string): { name?: string, dosage?: string, frequency?: string }[] => {
  // Simple regex-based medication extraction
  // In a production system, this would be more sophisticated NLP
  const medicationRegex = /([A-Za-z]+)\s+(\d+\s*mg)\s+([a-zA-Z0-9\s]+)/g;
  const medications = [];
  let match;
  
  while ((match = medicationRegex.exec(text)) !== null) {
    medications.push({
      name: match[1],
      dosage: match[2],
      frequency: match[3].trim()
    });
  }
  
  // If no matches, try a more lenient approach
  if (medications.length === 0) {
    // Look for any capitalized words followed by numbers
    const simpleRegex = /([A-Z][a-z]+)\s+(\d+\s*[a-z]*)/g;
    
    while ((match = simpleRegex.exec(text)) !== null) {
      medications.push({
        name: match[1],
        dosage: match[2],
        frequency: "as directed"
      });
    }
  }
  
  return medications;
};

// Cleanup function (not needed with per-operation worker)
export const terminateWorker = async () => {
  isProcessing = false;
};

// Mock function to demonstrate OCR without actually processing - for UI demos
export const mockOcrProcess = async (imageUrl: string): Promise<{ text: string, medications: any[] }> => {
  if (isProcessing) {
    throw new Error('OCR is already processing an image');
  }
  
  isProcessing = true;
  console.log("Processing image:", imageUrl.substring(0, 50) + "...");
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Create a sample prescription text with current date
  const currentDate = new Date().toLocaleDateString();
  const prescriptionText = `Patient: Emma Wilson
DOB: 05/12/1989
Date: ${currentDate}

Rx: Atorvastatin 20mg
Sig: 1 tablet daily at bedtime
Qty: 30
Refills: 3

Rx: Lisinopril 10mg
Sig: 1 tablet daily
Qty: 30
Refills: 3`;
  
  // Sample medications extracted from the text
  const medications = [
    {
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "daily at bedtime"
    },
    {
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "daily"
    }
  ];
  
  // Generate a notification about the processed prescription
  addNotification('Prescription Processed', 'New prescription for Emma Wilson has been processed successfully');
  
  isProcessing = false;
  return {
    text: prescriptionText,
    medications: medications
  };
};
