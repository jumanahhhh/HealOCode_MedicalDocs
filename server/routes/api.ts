import { Router } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { storage } from '../storage';


import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });}




// Ensure uploads directory exists


router.post('/medical-records/:recordId/summarize', async (req, res) => {
  const { recordId } = req.params;
  
  try {
    console.log('Starting summarization for record:', recordId);
    
    // Get the medical record to find the file path
    const record = await storage.getMedicalRecord(parseInt(recordId));
    console.log('Retrieved record:', record);
    
    if (!record || !record.fileUrl) {
      console.log('No record or file URL found');
      return res.status(404).json({ 
        message: 'Medical record not found or no PDF file associated',
        error: `No PDF found for record ID: ${recordId}`
      });
    }

    // Convert the URL path to a filesystem path
    const filePath = path.join(process.cwd(), record.fileUrl);
    console.log('Looking for file at path:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log('File not found at path:', filePath);
      return res.status(404).json({ 
        message: 'PDF file not found',
        error: `File not found at path: ${filePath}`
      });
    }
    
    console.log('File found, starting Python process');
    
    // Spawn Python process
    const scriptPath = path.join(process.cwd(), 'scripts', 'summarise_pdf.py');
    console.log('Python script path:', scriptPath);
    
    const pythonProcess = spawn('python3', [scriptPath, filePath]);
    console.log('Python process spawned');

    let outputData = '';
    let errorData = '';

    // Collect data from script
    pythonProcess.stdout.on('data', (data) => {
      console.log('Received output from Python:', data.toString());
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Received error from Python:', data.toString());
      errorData += data.toString();
    });

    // Handle process completion
    return new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        console.log('Python process closed with code:', code);
        console.log('Final output:', outputData);
        console.log('Final error:', errorData);
        
        if (code !== 0) {
          console.error('Python script error:', errorData);
          return res.status(500).json({ 
            message: 'Failed to generate summary',
            error: errorData 
          });
        }
        
        try {
          const summary = outputData.trim();
          console.log('Sending summary response');
          res.json({ summary });
        } catch (error: unknown) {
          console.error('Error parsing Python output:', error);
          res.status(500).json({ 
            message: 'Failed to parse summary output',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    });

  } catch (error: unknown) {
    console.error('Error running summarization:', error);
    res.status(500).json({ 
      message: 'Failed to process summarization request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/prescriptions/:prescriptionId/process', async (req, res) => {
  const { prescriptionId } = req.params;
  
  try {
    console.log('Starting OCR processing for prescription:', prescriptionId);
    
    const prescription = await storage.getPrescription(parseInt(prescriptionId));
    
    if (!prescription || !prescription.image) {
      return res.status(404).json({ 
        message: 'Prescription not found or no image associated',
        error: `No image found for prescription ID: ${prescriptionId}`
      });
    }

    const filePath = path.join(process.cwd(), prescription.image);
    console.log('Looking for image at path:', filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        message: 'Image file not found',
        error: `File not found at path: ${filePath}`
      });
    }
    
    console.log('Image found, starting OCR process');
    
    // Dynamically resolve Python executable
    const pythonExecutable = process.env.PYTHON_EXECUTABLE || path.join(process.cwd(), 'venv', 'bin', 'python3');
    const scriptPath = path.join(process.cwd(), 'scripts', 'prescription_ocr.py');
    
    console.log('Python script path:', scriptPath);
    console.log('Using Python executable:', pythonExecutable);
    
    const pythonProcess = spawn(pythonExecutable, [scriptPath, filePath], {
      env: { 
        ...process.env, 
        PYTHONPATH: process.env.PYTHONPATH || process.cwd() 
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      res.status(500).json({ 
        message: 'Failed to start OCR process',
        error: err.message 
      });
    });

    console.log('Python process spawned');

    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      console.log('Received output from Python:', data.toString());
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Received error from Python:', data.toString());
      errorData += data.toString();
    });

    await new Promise((resolve, reject) => {
      pythonProcess.on('close', async (code) => {
        console.log('Python process closed with code:', code);
        console.log('Final output:', outputData);
        console.log('Final error:', errorData);
        
        if (code !== 0) {
          console.error('Python script error:', errorData);
          return res.status(500).json({ 
            message: 'Failed to process prescription',
            error: errorData 
          });
        }
        
        try {
          const result = JSON.parse(outputData);
          
          if (!result.success) {
            return res.status(500).json({ 
              message: 'Failed to process prescription',
              error: result.error 
            });
          }
          
          const updatedPrescription = await storage.updatePrescriptionExtractedText(
            parseInt(prescriptionId),
            result.extracted_text,
            []
          );
          
          res.json(updatedPrescription);
        } catch (error) {
          console.error('Error parsing Python output:', error);
          res.status(500).json({ 
            message: 'Failed to parse OCR output',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        
        // resolve();
      });
    });

  } catch (error) {
    console.error('Error running OCR:', error);
    res.status(500).json({ 
      message: 'Failed to process prescription',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/prescriptions/:prescriptionId/process', async (req, res) => {
  const { prescriptionId } = req.params;
  
  try {
    console.log('Starting OCR processing for prescription:', prescriptionId);
    
    // Get the prescription record
    const prescription = await storage.getPrescription(parseInt(prescriptionId));
    
    if (!prescription || !prescription.image) {
      return res.status(404).json({ 
        message: 'Prescription not found or no image associated',
        error: `No image found for prescription ID: ${prescriptionId}`
      });
    }

    // Convert the URL path to a filesystem path
    const filePath = path.join(process.cwd(), prescription.image);
    console.log('Looking for image at path:', filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        message: 'Image file not found',
        error: `File not found at path: ${filePath}`
      });
    }
    
    console.log('Image found, starting OCR process');
    
    // Spawn Python process
    const scriptPath = path.join(process.cwd(), 'scripts', 'prescription_ocr.py');
    console.log('Python script path:', scriptPath);
    
    const pythonProcess = spawn('python3', [scriptPath, filePath]);
    console.log('Python process spawned');

    let outputData = '';
    let errorData = '';

    // Collect data from script
    pythonProcess.stdout.on('data', (data) => {
      console.log('Received output from Python:', data.toString());
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Received error from Python:', data.toString());
      errorData += data.toString();
    });

    // Handle process completion
    return new Promise((resolve, reject) => {
      pythonProcess.on('close', async (code) => {
        console.log('Python process closed with code:', code);
        console.log('Final output:', outputData);
        console.log('Final error:', errorData);
        
        if (code !== 0) {
          console.error('Python script error:', errorData);
          return res.status(500).json({ 
            message: 'Failed to process prescription',
            error: errorData 
          });
        }
        
        try {
          const result = JSON.parse(outputData);
          
          if (!result.success) {
            return res.status(500).json({ 
              message: 'Failed to process prescription',
              error: result.error 
            });
          }
          
          // Update the prescription with extracted text
          const updatedPrescription = await storage.updatePrescriptionExtractedText(
            parseInt(prescriptionId),
            result.extracted_text,
            [] // Empty medications array for now
          );
          
          res.json(updatedPrescription);
        } catch (error: unknown) {
          console.error('Error parsing Python output:', error);
          res.status(500).json({ 
            message: 'Failed to parse OCR output',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    });

  } catch (error: unknown) {
    console.error('Error running OCR:', error);
    res.status(500).json({ 
      message: 'Failed to process prescription',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;


