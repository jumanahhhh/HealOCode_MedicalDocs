import { useState, useEffect } from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Calendar, FileText, PlusCircle, User } from 'lucide-react';
import { FileViewer } from '@/components/records/FileViewer';
import { UploadRecordDialog } from '@/components/records/UploadRecordDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { generatePatientFriendlySummary } from '@/lib/nlp';
import { Button } from '@/components/ui/button';

interface PatientRecordProps {
  patientId?: number;
}

export default function PatientRecord({ patientId = 1 }: PatientRecordProps) {
  const [activeTab, setActiveTab] = useState<string>('medicalRecords');
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordType[]>([]);
  const userId = 1; // Mock user ID (normally from auth context)

  // Define types for data
  type PatientType = {
    id: number;
    patientId: string;
    name: string;
    dateOfBirth: string;
    gender: string;
    userId: number;
    createdAt: string;
  };
  
  type MedicalRecordType = {
    id: number;
    patientId: number;
    recordType: string;
    content: any;
    summary: string | null;
    file?: string;
    fileUrl?: string;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
    isVerified: boolean;
    blockchainHash: string | null;
  };
  
  type PrescriptionType = {
    id: number;
    patientId: number;
    image: string;
    extractedText: string | null;
    medications: any[];
    scannedAt: string | null;
    createdAt: string;
    createdBy: number;
    isProcessed: boolean;
  };

  // Fetch patient info
  const patientQuery = useQuery<PatientType>({
    queryKey: [`/api/patients/${patientId}`],
    enabled: !!patientId,
  });

  // Fetch medical records
  const medicalRecordsQuery = useQuery<MedicalRecordType[]>({
    queryKey: [`/api/patients/${patientId}/records`],
    enabled: !!patientId,
  });

  // Update medical records state when query data changes
  useEffect(() => {
    if (medicalRecordsQuery.data) {
      setMedicalRecords(medicalRecordsQuery.data);
    }
  }, [medicalRecordsQuery.data]);

  // Fetch prescriptions
  const prescriptionsQuery = useQuery<PrescriptionType[]>({
    queryKey: [`/api/patients/${patientId}/prescriptions`],
    enabled: !!patientId,
  });

  const isLoading = patientQuery.isLoading || medicalRecordsQuery.isLoading || prescriptionsQuery.isLoading;
  const isError = patientQuery.isError || medicalRecordsQuery.isError || prescriptionsQuery.isError;

  const patient = patientQuery.data;
  const prescriptions = prescriptionsQuery.data || [];

  if (isError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load patient records. Please refresh the page or try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Helper function to format date strings
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Patient Info Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {isLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <span>{patient?.name || 'Unknown Patient'}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Patient ID:</span>
                <div className="font-medium">{patient?.patientId || 'Unknown'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Date of Birth:</span>
                <div className="font-medium">
                  {patient?.dateOfBirth ? formatDate(patient.dateOfBirth) : 'Unknown'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Gender:</span>
                <div className="font-medium">{patient?.gender || 'Unknown'}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Records Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="medicalRecords" className="gap-1">
              <FileText className="h-4 w-4" />
              Medical Records
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="gap-1">
              <FileText className="h-4 w-4" />
              Prescriptions
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            {activeTab === 'medicalRecords' && (
              <UploadRecordDialog
                patientId={patientId}
                userId={userId}
                uploadType="medical-record"
              />
            )}
            
            {activeTab === 'prescriptions' && (
              <UploadRecordDialog
                patientId={patientId}
                userId={userId}
                uploadType="prescription"
              />
            )}
          </div>
        </div>

        {/* Medical Records Tab Content */}
        <TabsContent value="medicalRecords" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(3).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-64" />
              ))}
            </div>
          ) : medicalRecords.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-center text-muted-foreground mb-4">
                  No medical records found for this patient.
                </p>
                <UploadRecordDialog
                  patientId={patientId}
                  userId={userId}
                  uploadType="medical-record"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {medicalRecords.map((record: any) => (
                <Card key={record.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{record.recordType.replace('_', ' ')}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(record.createdAt)}
                          </div>
                        </CardDescription>
                      </div>
                      <Badge variant={record.isVerified ? "default" : "outline"} className={record.isVerified ? "bg-green-500 hover:bg-green-600" : ""}>
                        {record.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        {record.summary || generatePatientFriendlySummary(record.content) || 'No summary available.'}
                      </p>
                    </div>
                    
                    <FileViewer
                      fileName={`${record.recordType}_${record.id}.pdf`}
                      fileUrl={record.fileUrl || `data:application/pdf;base64,${record.file}`}
                      fileType="application/pdf"
                      title={`${record.recordType.replace('_', ' ')} - ${formatDate(record.createdAt)}`}
                      description={record.content?.notes}
                      recordId={record.id}
                      summary={record.summary}
                      onSummaryUpdate={(newSummary) => {
                        // Update the record's summary in the UI
                        const updatedRecords = medicalRecords.map((r: any) => 
                          r.id === record.id ? { ...r, summary: newSummary } : r
                        );
                        setMedicalRecords(updatedRecords);
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Prescriptions Tab Content */}
        <TabsContent value="prescriptions" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(3).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-64" />
              ))}
            </div>
          ) : prescriptions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-center text-muted-foreground mb-4">
                  No prescriptions found for this patient.
                </p>
                <UploadRecordDialog
                  patientId={patientId}
                  userId={userId}
                  uploadType="prescription"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prescriptions.map((prescription: any) => (
                <Card key={prescription.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Prescription</CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(prescription.scannedAt || prescription.createdAt)}
                          </div>
                        </CardDescription>
                      </div>
                      <Badge variant={prescription.isProcessed ? "default" : "outline"} className={prescription.isProcessed ? "bg-green-500 hover:bg-green-600" : ""}>
                        {prescription.isProcessed ? "Processed" : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {prescription.extractedText && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-1">Extracted Information</h4>
                        <p className="text-sm text-muted-foreground">
                          {prescription.extractedText}
                        </p>
                      </div>
                    )}
                    
                    <FileViewer
                      fileName={`prescription_${prescription.id}.jpg`}
                      fileUrl={prescription.image}
                      fileType="image/jpeg"
                      title={`Prescription - ${formatDate(prescription.scannedAt || prescription.createdAt)}`}
                    />
                  </CardContent>
                  
                  {prescription.medications && prescription.medications.length > 0 && (
                    <CardFooter className="pt-0">
                      <div className="w-full">
                        <h4 className="text-sm font-medium mb-2">Medications</h4>
                        <div className="space-y-2">
                          {prescription.medications.map((med: any, index: number) => (
                            <div key={index} className="text-sm p-2 bg-secondary rounded-md">
                              <div className="font-medium">{med.name || 'Unknown Medication'}</div>
                              {(med.dosage || med.frequency) && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {med.dosage && <span>{med.dosage}</span>}
                                  {med.dosage && med.frequency && <span> • </span>}
                                  {med.frequency && <span>{med.frequency}</span>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}