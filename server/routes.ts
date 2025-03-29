import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertPatientSchema, 
  insertMedicalRecordSchema, 
  insertPrescriptionSchema, 
  insertSurgeryDocumentSchema, 
  insertAccessLogSchema, 
  insertAccessPermissionSchema 
} from "@shared/schema";
import { randomUUID } from "crypto";
import * as fs from 'fs';
import * as path from 'path';
import { promises as fsPromises } from 'fs';
import { exec } from "child_process";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadFolder = path.join(__dirname, "uploads");
const mkdirAsync = fsPromises.mkdir;
const writeFileAsync = fsPromises.writeFile;

export async function registerRoutes(app: Express): Promise<Server> {
  // Endpoint to process PDF and return summary
app.post("/api/process-pdf", async (req: Request, res: Response) => {
  try {
    const fileName = req.body.fileName; // Get the file name from frontend
    if (!fileName) {
      return res.status(400).json({ error: "File name is required" });
    }

    const filePath = path.join(uploadFolder, fileName);
    
    // Run Python script
    exec(`python3 process_pdf.py "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${stderr}`);
        return res.status(500).json({ error: "Failed to process PDF" });
      }
      res.json({ summary: stdout.trim() });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
  // Users
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Log the access
    await storage.createAccessLog({
      userId: user.id,
      recordId: null,
      recordType: 'authentication',
      action: 'login'
    });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  });
  
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid user data', error });
    }
  });

  // Patients
  app.get('/api/patients', async (_req: Request, res: Response) => {
    const patients = await storage.getPatients();
    return res.json(patients);
  });
  
  app.get('/api/patients/recent', async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 3;
    const recentPatients = await storage.getRecentPatients(limit);
    return res.json(recentPatients);
  });
  
  app.get('/api/patients/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const patient = await storage.getPatient(id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    return res.json(patient);
  });
  
  // Get patient data for the logged-in patient user
  app.get('/api/my-patient-profile', async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // First, get the user to check if they are a patient
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can access their profile' });
    }
    
    // Get the patient record associated with this user
    const patient = await storage.getPatientByUserId(userId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    return res.json(patient);
  });
  
  app.post('/api/patients', async (req: Request, res: Response) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      return res.status(201).json(patient);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid patient data', error });
    }
  });

  // Medical Records
  app.get('/api/patients/:patientId/records', async (req: Request, res: Response) => {
    const patientId = parseInt(req.params.patientId);
    const records = await storage.getMedicalRecordsByPatient(patientId);
    return res.json(records);
  });
  
  // Get medical records for a patient user
  app.get('/api/my-medical-records', async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check if the user is a patient
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can access their medical records this way' });
    }
    
    // Get the patient record associated with this user
    const patient = await storage.getPatientByUserId(userId);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    // Get the medical records for this patient
    const records = await storage.getMedicalRecordsByPatient(patient.id);
    
    // Log access
    await storage.createAccessLog({
      userId,
      recordId: null,
      recordType: 'medical_records',
      action: 'view_own_records'
    });
    
    return res.json(records);
  });
  
  app.post('/api/medical-records', async (req: Request, res: Response) => {
    try {
      // Handle file upload data along with other record data
      const recordData = insertMedicalRecordSchema.parse(req.body);
      
      // Save file to filesystem if provided
      let fileUrl = null;
      let summary = null;
      if (recordData.file && recordData.fileName) {
        // Create directory if it doesn't exist
        const patientDir = path.join(process.cwd(), 'uploads', 'medical_records', `patient_${recordData.patientId}`);
        try {
          await mkdirAsync(patientDir, { recursive: true });
        } catch (err) {
          if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
            throw err;
          }
        }
        
        // Generate unique filename
        const fileExt = path.extname(recordData.fileName);
        const safeFileName = `${recordData.recordType}_${Date.now()}${fileExt}`;
        const filePath = path.join(patientDir, safeFileName);
        
        console.log('Processing PDF file:', {
          fileName: recordData.fileName,
          filePath,
          fileExt
        });
        
        // Remove the base64 prefix if present
        let fileData = recordData.file;
        if (fileData.includes('base64,')) {
          fileData = fileData.split('base64,')[1];
        }
        
        // Write file to disk
        await writeFileAsync(filePath, Buffer.from(fileData, 'base64'));
        
        // Set the file URL to the public path
        fileUrl = `/uploads/medical_records/patient_${recordData.patientId}/${safeFileName}`;
        
        // If it's a PDF, generate summary
        if (fileExt.toLowerCase() === '.pdf') {
          try {
            console.log('Starting PDF summarization...');
            const { spawn } = require('child_process');
            const pythonProcess = spawn('python3', ['scripts/summarize_pdf.py', filePath]);
            
            let summaryData = '';
            
            pythonProcess.stdout.on('data', (data: Buffer) => {
              console.log('Received summary data:', data.toString());
              summaryData += data.toString();
            });
            
            pythonProcess.stderr.on('data', (data: Buffer) => {
              console.error('Python Error:', data.toString());
            });
            
            await new Promise((resolve, reject) => {
              pythonProcess.on('close', (code: number) => {
                console.log('Python process exited with code:', code);
                if (code === 0) {
                  resolve(summaryData);
                } else {
                  reject(new Error(`Python process exited with code ${code}`));
                }
              });
            });
            
            summary = summaryData;
            console.log('Final summary:', summary);
          } catch (error) {
            console.error('Error generating summary:', error);
            // Continue without summary if there's an error
          }
        }
        
        // Update record data with file URL and summary
        recordData.fileUrl = fileUrl;
        recordData.summary = summary;
      }
      
      // Create record in database
      const record = await storage.createMedicalRecord(recordData);
      
      // Log access
      await storage.createAccessLog({
        userId: recordData.createdBy,
        recordId: record.id,
        recordType: 'medical_record',
        action: 'create'
      });
      
      return res.status(201).json(record);
    } catch (error) {
      console.error('Error creating medical record:', error);
      return res.status(500).json({ error: 'Failed to create medical record' });
    }
  });
  
  app.post('/api/medical-records/:id/summarize', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const record = await storage.getMedicalRecord(id);
      
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }

      if (!record.fileUrl) {
        return res.status(400).json({ message: 'No PDF file found for this record' });
      }

      // Get the full file path from the URL
      const filePath = path.join(process.cwd(), 'uploads', record.fileUrl.replace(/^\//, ''));
      const scriptPath = path.join(process.cwd(), 'server', 'scripts', 'summarize_pdf.py');
      
      console.log('Processing PDF file for summarization:', {
        recordId: id,
        filePath,
        scriptPath,
        currentDir: process.cwd()
      });

      // Check if files exist
      try {
        await fsPromises.access(filePath);
        await fsPromises.access(scriptPath);
        console.log('Both PDF and script files exist');
      } catch (error) {
        console.error('File access error:', error);
        return res.status(500).json({ 
          message: 'Required files not found',
          error: error instanceof Error ? error.message : String(error)
        });
      }

      // Run the Python script
      const { spawn } = require('child_process');
      const pythonProcess = spawn('python3', [scriptPath, filePath]);
      
      let summaryData = '';
      
      pythonProcess.stdout.on('data', (data: Buffer) => {
        console.log('Received summary data:', data.toString());
        summaryData += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data: Buffer) => {
        console.error('Python Error:', data.toString());
      });
      
      await new Promise((resolve, reject) => {
        pythonProcess.on('close', (code: number) => {
          console.log('Python process exited with code:', code);
          if (code === 0) {
            resolve(summaryData);
          } else {
            reject(new Error(`Python process exited with code ${code}`));
          }
        });
      });

      // Update the record with the new summary
      const updatedRecord = await storage.updateMedicalRecordSummary(id, summaryData);
      
      return res.json(updatedRecord);
    } catch (error) {
      console.error('Error generating summary:', error);
      return res.status(500).json({ 
        message: 'Failed to generate summary',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post('/api/medical-records/:id/verify', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const record = await storage.verifyMedicalRecord(id);
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    return res.json(record);
  });

  // Prescriptions
  app.get('/api/prescriptions/recent', async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 2;
    const recentPrescriptions = await storage.getRecentPrescriptions(limit);
    return res.json(recentPrescriptions);
  });
  
  app.get('/api/patients/:patientId/prescriptions', async (req: Request, res: Response) => {
    const patientId = parseInt(req.params.patientId);
    const prescriptions = await storage.getPrescriptionsByPatient(patientId);
    return res.json(prescriptions);
  });
  
  app.post('/api/prescriptions', async (req: Request, res: Response) => {
    try {
      // Generate a prescription ID
      const prescriptionId = `Rx-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const prescriptionData = insertPrescriptionSchema.parse({
        ...req.body,
        prescriptionId
      });
      
      // Save file to filesystem if provided
      let imageUrl = null;
      if (prescriptionData.image) {
        // Create directory if it doesn't exist
        const patientDir = path.join(process.cwd(), 'uploads', 'prescriptions', `patient_${prescriptionData.patientId}`);
        try {
          await mkdirAsync(patientDir, { recursive: true });
        } catch (err) {
          if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
            throw err;
          }
        }
        
        // Generate unique filename
        const safeFileName = `prescription_${prescriptionId}_${Date.now()}.jpg`;
        const filePath = path.join(patientDir, safeFileName);
        
        // Remove the base64 prefix if present
        let imageData = prescriptionData.image;
        if (imageData.includes('base64,')) {
          imageData = imageData.split('base64,')[1];
        }
        
        // Write file to disk
        await writeFileAsync(filePath, Buffer.from(imageData, 'base64'));
        
        // Set the image URL to the public path
        imageUrl = `/uploads/prescriptions/patient_${prescriptionData.patientId}/${safeFileName}`;
        
        // Update prescription data with image URL instead of base64 data
        prescriptionData.image = imageUrl;
      }
      
      // Create prescription in database
      const prescription = await storage.createPrescription(prescriptionData);
      
      // Log access
      await storage.createAccessLog({
        userId: prescriptionData.createdBy,
        recordId: prescription.id,
        recordType: 'prescription',
        action: 'create'
      });
      
      return res.status(201).json(prescription);
    } catch (error) {
      console.error('Error saving prescription:', error);
      return res.status(400).json({ message: 'Invalid prescription data', error });
    }
  });
  
  app.post('/api/prescriptions/:id/process', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { extractedText, medications } = req.body;
    
    if (!extractedText) {
      return res.status(400).json({ message: 'Extracted text is required' });
    }
    
    const updatedPrescription = await storage.updatePrescriptionExtractedText(id, extractedText, medications);
    
    if (!updatedPrescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    return res.json(updatedPrescription);
  });

  // Surgery Documents
  app.get('/api/surgery-templates', async (_req: Request, res: Response) => {
    const templates = await storage.getSurgeryTemplates();
    return res.json(templates);
  });
  
  app.get('/api/patients/:patientId/surgery-documents', async (req: Request, res: Response) => {
    const patientId = parseInt(req.params.patientId);
    const documents = await storage.getSurgeryDocumentsByPatient(patientId);
    return res.json(documents);
  });
  
  app.post('/api/surgery-documents', async (req: Request, res: Response) => {
    try {
      const documentData = insertSurgeryDocumentSchema.parse(req.body);
      const document = await storage.createSurgeryDocument(documentData);
      
      // Log access
      await storage.createAccessLog({
        userId: documentData.createdBy,
        recordId: document.id,
        recordType: 'surgery_document',
        action: 'create'
      });
      
      return res.status(201).json(document);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid document data', error });
    }
  });

  // Access Logs
  app.get('/api/access-logs', async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const logs = await storage.getAccessLogs(limit);
    return res.json(logs);
  });
  
  app.get('/api/access-logs/count', async (_req: Request, res: Response) => {
    const count = await storage.getAccessLogsCount();
    return res.json({ count });
  });

  // Access Permissions
  app.get('/api/access-permissions', async (_req: Request, res: Response) => {
    const permissions = await storage.getAccessPermissionsWithUserDetails();
    return res.json(permissions);
  });
  
  app.get('/api/patients/:patientId/access-permissions', async (req: Request, res: Response) => {
    const patientId = parseInt(req.params.patientId);
    const permissions = await storage.getAccessPermissionsByPatient(patientId);
    return res.json(permissions);
  });
  
  app.post('/api/access-permissions', async (req: Request, res: Response) => {
    try {
      const permissionData = insertAccessPermissionSchema.parse(req.body);
      const permission = await storage.createAccessPermission(permissionData);
      return res.status(201).json(permission);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid permission data', error });
    }
  });
  
  app.patch('/api/access-permissions/:id/status', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { isActive } = req.body;
    
    if (isActive === undefined) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const updatedPermission = await storage.updateAccessPermissionStatus(id, isActive);
    
    if (!updatedPermission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    return res.json(updatedPermission);
  });

  // AI Model Integration
  app.post('/api/ai/process-file', async (req: Request, res: Response) => {
    try {
      const { fileType, fileData, patientId, operation } = req.body;
      
      if (!fileType || !fileData || !patientId || !operation) {
        return res.status(400).json({ 
          message: 'Missing required parameters (fileType, fileData, patientId, operation)' 
        });
      }
      
      // For now, return a successful response with placeholders
      // This is a stub for the future AI integration
      const response = {
        success: true,
        operation,
        fileType,
        patientId,
        result: {
          // This will be replaced with actual AI model response
          processedData: operation === 'prescription_ocr' 
            ? { 
                extractedText: "Placeholder for actual OCR extraction",
                medications: [
                  { name: "Placeholder medication", dosage: "Placeholder dosage", frequency: "Placeholder frequency" }
                ]
              }
            : {
                summary: "Placeholder for AI-generated summary of this medical document."
              },
          confidence: 0.95,
          processingTime: "1.2s"
        }
      };
      
      return res.json(response);
    } catch (error) {
      console.error('AI processing error:', error);
      return res.status(500).json({ 
        message: 'Error processing file with AI model',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}