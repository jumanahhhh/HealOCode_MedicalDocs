import type { Express, Request, Response } from "express";
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

export async function registerRoutes(app: Express): Promise<Server> {
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
      return res.status(400).json({ message: 'Invalid record data', error });
    }
  });
  
  app.post('/api/medical-records/:id/summarize', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { summary } = req.body;
    
    if (!summary) {
      return res.status(400).json({ message: 'Summary is required' });
    }
    
    const updatedRecord = await storage.updateMedicalRecordSummary(id, summary);
    
    if (!updatedRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    return res.json(updatedRecord);
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

  const httpServer = createServer(app);
  return httpServer;
}
