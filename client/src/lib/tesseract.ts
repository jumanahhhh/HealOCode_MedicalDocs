import { createWorker } from 'tesseract.js';

// Configuration for OCR
const ocrWorker = createWorker();

// Initialize the worker
let workerInitialized = false;

const initializeWorker = async () => {
  if (!workerInitialized) {
    await ocrWorker.load();
    await ocrWorker.loadLanguage('eng');
    await ocrWorker.initialize('eng');
    workerInitialized = true;
  }
};

// Function to extract text from an image
export const extractTextFromImage = async (imageUrl: string): Promise<{ text: string, confidence: number }> => {
  try {
    await initializeWorker();
    
    const result = await ocrWorker.recognize(imageUrl);
    return {
      text: result.data.text,
      confidence: result.data.confidence
    };
  } catch (error) {
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

// Cleanup worker when app is closed
export const terminateWorker = async () => {
  if (workerInitialized) {
    await ocrWorker.terminate();
    workerInitialized = false;
  }
};

// Mock function to demonstrate OCR without actually processing - for UI demos
export const mockOcrProcess = async (imageUrl: string): Promise<{ text: string, medications: any[] }> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock data
  return {
    text: "Patient: Emma Wilson\nDOB: 05/12/1989\nRx: Atorvastatin 20mg\nSig: 1 tablet daily at bedtime\nQty: 30\nRefills: 3",
    medications: [{
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "daily at bedtime"
    }]
  };
};
