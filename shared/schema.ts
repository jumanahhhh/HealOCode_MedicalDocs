import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("doctor"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().unique(),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  userId: integer("user_id"), // Optional: associate with a user account
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  recordType: text("record_type").notNull(),
  content: json("content").notNull(),
  summary: text("summary"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isVerified: boolean("is_verified").notNull().default(false),
  blockchainHash: text("blockchain_hash"),
});

export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  prescriptionId: text("prescription_id").notNull().unique(),
  image: text("image").notNull(),
  extractedText: text("extracted_text"),
  medications: json("medications"),
  scannedAt: timestamp("scanned_at").notNull().defaultNow(),
  createdBy: integer("created_by").notNull(),
  isProcessed: boolean("is_processed").notNull().default(false),
});

export const surgeryDocuments = pgTable("surgery_documents", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  procedureType: text("procedure_type").notNull(),
  surgeryDate: text("surgery_date").notNull(),
  findings: text("findings"),
  documentation: json("documentation").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const accessLogs = pgTable("access_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recordId: integer("record_id"),
  recordType: text("record_type").notNull(),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const accessPermissions = pgTable("access_permissions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  userId: integer("user_id").notNull(),
  recordType: text("record_type").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

export const insertPatientSchema = createInsertSchema(patients).pick({
  patientId: true,
  name: true,
  dateOfBirth: true,
  gender: true,
  userId: true,
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).pick({
  patientId: true,
  recordType: true,
  content: true,
  summary: true,
  createdBy: true,
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).pick({
  patientId: true,
  prescriptionId: true,
  image: true,
  extractedText: true,
  medications: true,
  createdBy: true,
});

export const insertSurgeryDocumentSchema = createInsertSchema(surgeryDocuments).pick({
  patientId: true,
  procedureType: true,
  surgeryDate: true,
  findings: true,
  documentation: true,
  createdBy: true,
});

export const insertAccessLogSchema = createInsertSchema(accessLogs).pick({
  userId: true,
  recordId: true,
  recordType: true,
  action: true,
});

export const insertAccessPermissionSchema = createInsertSchema(accessPermissions).pick({
  patientId: true,
  userId: true,
  recordType: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;

export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;

export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Prescription = typeof prescriptions.$inferSelect;

export type InsertSurgeryDocument = z.infer<typeof insertSurgeryDocumentSchema>;
export type SurgeryDocument = typeof surgeryDocuments.$inferSelect;

export type InsertAccessLog = z.infer<typeof insertAccessLogSchema>;
export type AccessLog = typeof accessLogs.$inferSelect;

export type InsertAccessPermission = z.infer<typeof insertAccessPermissionSchema>;
export type AccessPermission = typeof accessPermissions.$inferSelect;
