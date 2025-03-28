import { 
  type User, type InsertUser, users,
  type Patient, type InsertPatient, patients,
  type MedicalRecord, type InsertMedicalRecord, medicalRecords,
  type Prescription, type InsertPrescription, prescriptions,
  type SurgeryDocument, type InsertSurgeryDocument, surgeryDocuments,
  type AccessLog, type InsertAccessLog, accessLogs,
  type AccessPermission, type InsertAccessPermission, accessPermissions
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Patients
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByPatientId(patientId: string): Promise<Patient | undefined>;
  getPatientByUserId(userId: number): Promise<Patient | undefined>;
  getPatients(): Promise<Patient[]>;
  getRecentPatients(limit: number): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  
  // Medical Records
  getMedicalRecord(id: number): Promise<MedicalRecord | undefined>;
  getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  updateMedicalRecordSummary(id: number, summary: string): Promise<MedicalRecord | undefined>;
  verifyMedicalRecord(id: number): Promise<MedicalRecord | undefined>;
  
  // Prescriptions
  getPrescription(id: number): Promise<Prescription | undefined>;
  getPrescriptionsByPatient(patientId: number): Promise<Prescription[]>;
  getRecentPrescriptions(limit: number): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescriptionExtractedText(id: number, extractedText: string, medications: any): Promise<Prescription | undefined>;
  
  // Surgery Documents
  getSurgeryDocument(id: number): Promise<SurgeryDocument | undefined>;
  getSurgeryDocumentsByPatient(patientId: number): Promise<SurgeryDocument[]>;
  getSurgeryTemplates(): Promise<string[]>;
  createSurgeryDocument(document: InsertSurgeryDocument): Promise<SurgeryDocument>;
  
  // Access Logs
  createAccessLog(log: InsertAccessLog): Promise<AccessLog>;
  getAccessLogs(limit: number): Promise<AccessLog[]>;
  getAccessLogsCount(): Promise<number>;
  
  // Access Permissions
  getAccessPermission(id: number): Promise<AccessPermission | undefined>;
  getAccessPermissionsByPatient(patientId: number): Promise<AccessPermission[]>;
  getAccessPermissionsWithUserDetails(): Promise<any[]>;
  createAccessPermission(permission: InsertAccessPermission): Promise<AccessPermission>;
  updateAccessPermissionStatus(id: number, isActive: boolean): Promise<AccessPermission | undefined>;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private patientsMap: Map<number, Patient>;
  private medicalRecordsMap: Map<number, MedicalRecord>;
  private prescriptionsMap: Map<number, Prescription>;
  private surgeryDocumentsMap: Map<number, SurgeryDocument>;
  private accessLogsMap: Map<number, AccessLog>;
  private accessPermissionsMap: Map<number, AccessPermission>;
  
  private userId: number;
  private patientId: number;
  private medicalRecordId: number;
  private prescriptionId: number;
  private surgeryDocumentId: number;
  private accessLogId: number;
  private accessPermissionId: number;
  
  private surgeryTemplates: string[];

  constructor() {
    this.usersMap = new Map();
    this.patientsMap = new Map();
    this.medicalRecordsMap = new Map();
    this.prescriptionsMap = new Map();
    this.surgeryDocumentsMap = new Map();
    this.accessLogsMap = new Map();
    this.accessPermissionsMap = new Map();
    
    this.userId = 1;
    this.patientId = 1;
    this.medicalRecordId = 1;
    this.prescriptionId = 1;
    this.surgeryDocumentId = 1;
    this.accessLogId = 1;
    this.accessPermissionId = 1;
    
    this.surgeryTemplates = ['Appendectomy', 'Cholecystectomy', 'Total Knee Replacement', 'Hernia Repair'];
    
    // Add default users
    this.createUser({
      username: 'doctor',
      password: 'password',
      name: 'Dr. Sarah Chen',
      role: 'doctor'
    });
    
    // Add a default patient user
    this.createUser({
      username: 'patient',
      password: 'password',
      name: 'Emma Wilson',
      role: 'patient'
    });
    
    // Add sample patients
    this.createPatient({
      patientId: 'P-2023-0456',
      name: 'Emma Wilson',
      dateOfBirth: '1989-05-12',
      gender: 'Female',
      userId: 2 // This connects to the patient user (Emma Wilson)
    });
    
    this.createPatient({
      patientId: 'P-2023-0421',
      name: 'James Rodriguez',
      dateOfBirth: '1978-09-23',
      gender: 'Male'
    });
    
    this.createPatient({
      patientId: 'P-2023-0389',
      name: 'Sophia Chen',
      dateOfBirth: '1995-02-15',
      gender: 'Female'
    });
  }

  /* Users */
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    // Ensure role is always defined
    const role = insertUser.role || 'doctor';
    const user: User = { ...insertUser, role, id, createdAt: now };
    this.usersMap.set(id, user);
    return user;
  }

  /* Patients */
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patientsMap.get(id);
  }

  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    return Array.from(this.patientsMap.values()).find(
      (patient) => patient.patientId === patientId,
    );
  }
  
  async getPatientByUserId(userId: number): Promise<Patient | undefined> {
    return Array.from(this.patientsMap.values()).find(
      (patient) => patient.userId === userId,
    );
  }

  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patientsMap.values());
  }
  
  async getRecentPatients(limit: number): Promise<Patient[]> {
    return Array.from(this.patientsMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.patientId++;
    const now = new Date();
    // Ensure userId is always defined as null if not provided
    const userId = insertPatient.userId === undefined ? null : insertPatient.userId;
    const patient: Patient = { ...insertPatient, userId, id, createdAt: now };
    this.patientsMap.set(id, patient);
    return patient;
  }

  /* Medical Records */
  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    return this.medicalRecordsMap.get(id);
  }

  async getMedicalRecordsByPatient(patientId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecordsMap.values()).filter(
      (record) => record.patientId === patientId,
    );
  }

  async createMedicalRecord(insertRecord: InsertMedicalRecord): Promise<MedicalRecord> {
    const id = this.medicalRecordId++;
    const now = new Date();
    const record: MedicalRecord = { 
      ...insertRecord,
      summary: insertRecord.summary ?? null,
      file: insertRecord.file ?? null,
      fileName: insertRecord.fileName ?? null,
      fileType: insertRecord.fileType ?? null,
      id,
      createdAt: now,
      updatedAt: now,
      isVerified: false,
      blockchainHash: null // Initialize as null instead of undefined
    };
    
    this.medicalRecordsMap.set(id, record);
    return record;
  }

  async updateMedicalRecordSummary(id: number, summary: string): Promise<MedicalRecord | undefined> {
    const record = this.medicalRecordsMap.get(id);
    if (!record) return undefined;
    
    const updatedRecord = { 
      ...record, 
      summary,
      updatedAt: new Date()
    };
    
    this.medicalRecordsMap.set(id, updatedRecord);
    return updatedRecord;
  }

  async verifyMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    const record = this.medicalRecordsMap.get(id);
    if (!record) return undefined;
    
    const blockchainHash = `0x${randomUUID().replace(/-/g, '')}`;
    const updatedRecord = { 
      ...record, 
      isVerified: true,
      blockchainHash,
      updatedAt: new Date()
    };
    
    this.medicalRecordsMap.set(id, updatedRecord);
    return updatedRecord;
  }

  /* Prescriptions */
  async getPrescription(id: number): Promise<Prescription | undefined> {
    return this.prescriptionsMap.get(id);
  }

  async getPrescriptionsByPatient(patientId: number): Promise<Prescription[]> {
    return Array.from(this.prescriptionsMap.values()).filter(
      (prescription) => prescription.patientId === patientId,
    );
  }
  
  async getRecentPrescriptions(limit: number): Promise<Prescription[]> {
    return Array.from(this.prescriptionsMap.values())
      .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
      .slice(0, limit);
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const id = this.prescriptionId++;
    const now = new Date();
    // Handle optional fields with default values
    const prescription: Prescription = { 
      ...insertPrescription,
      extractedText: insertPrescription.extractedText ?? null,
      medications: insertPrescription.medications ?? {},
      id,
      scannedAt: now,
      isProcessed: false
    };
    
    this.prescriptionsMap.set(id, prescription);
    return prescription;
  }

  async updatePrescriptionExtractedText(id: number, extractedText: string, medications: any): Promise<Prescription | undefined> {
    const prescription = this.prescriptionsMap.get(id);
    if (!prescription) return undefined;
    
    const updatedPrescription = { 
      ...prescription, 
      extractedText,
      medications,
      isProcessed: true
    };
    
    this.prescriptionsMap.set(id, updatedPrescription);
    return updatedPrescription;
  }

  /* Surgery Documents */
  async getSurgeryDocument(id: number): Promise<SurgeryDocument | undefined> {
    return this.surgeryDocumentsMap.get(id);
  }

  async getSurgeryDocumentsByPatient(patientId: number): Promise<SurgeryDocument[]> {
    return Array.from(this.surgeryDocumentsMap.values()).filter(
      (document) => document.patientId === patientId,
    );
  }
  
  async getSurgeryTemplates(): Promise<string[]> {
    return this.surgeryTemplates;
  }

  async createSurgeryDocument(insertDocument: InsertSurgeryDocument): Promise<SurgeryDocument> {
    const id = this.surgeryDocumentId++;
    const now = new Date();
    const document: SurgeryDocument = { 
      ...insertDocument,
      findings: insertDocument.findings ?? null,
      id,
      createdAt: now
    };
    
    this.surgeryDocumentsMap.set(id, document);
    return document;
  }

  /* Access Logs */
  async createAccessLog(insertLog: InsertAccessLog): Promise<AccessLog> {
    const id = this.accessLogId++;
    const now = new Date();
    // Ensure recordId is always defined as null if not provided
    const recordId = insertLog.recordId === undefined ? null : insertLog.recordId;
    const log: AccessLog = { 
      ...insertLog,
      recordId,
      id,
      timestamp: now
    };
    
    this.accessLogsMap.set(id, log);
    return log;
  }

  async getAccessLogs(limit: number): Promise<AccessLog[]> {
    return Array.from(this.accessLogsMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  async getAccessLogsCount(): Promise<number> {
    return this.accessLogsMap.size;
  }

  /* Access Permissions */
  async getAccessPermission(id: number): Promise<AccessPermission | undefined> {
    return this.accessPermissionsMap.get(id);
  }

  async getAccessPermissionsByPatient(patientId: number): Promise<AccessPermission[]> {
    return Array.from(this.accessPermissionsMap.values()).filter(
      (permission) => permission.patientId === patientId,
    );
  }
  
  async getAccessPermissionsWithUserDetails(): Promise<any[]> {
    return Array.from(this.accessPermissionsMap.values()).map(permission => {
      const patient = this.patientsMap.get(permission.patientId);
      const user = this.usersMap.get(permission.userId);
      
      return {
        ...permission,
        patientName: patient?.name || 'Unknown',
        patientIdNumber: patient?.patientId || 'Unknown',
        userName: user?.name || 'Unknown',
      };
    });
  }

  async createAccessPermission(insertPermission: InsertAccessPermission): Promise<AccessPermission> {
    const id = this.accessPermissionId++;
    const now = new Date();
    const permission: AccessPermission = { 
      ...insertPermission, 
      id,
      isActive: true,
      createdAt: now
    };
    
    this.accessPermissionsMap.set(id, permission);
    return permission;
  }

  async updateAccessPermissionStatus(id: number, isActive: boolean): Promise<AccessPermission | undefined> {
    const permission = this.accessPermissionsMap.get(id);
    if (!permission) return undefined;
    
    const updatedPermission = { ...permission, isActive };
    this.accessPermissionsMap.set(id, updatedPermission);
    return updatedPermission;
  }
}

export const storage = new MemStorage();
