import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AlertCircle, 
  FileText, 
  Pill, 
  CheckCircle, 
  Calendar, 
  Download,
  Eye,
  Shield,
  LockKeyhole
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

type Patient = {
  id: number;
  patientId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
};

type MedicalRecord = {
  id: number;
  patientId: number;
  recordType: string;
  content: any;
  summary: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  blockchainHash: string | null;
};

type Prescription = {
  id: number;
  patientId: number;
  prescriptionId: string;
  image: string;
  extractedText: string | null;
  medications: any;
  scannedAt: string;
  createdBy: number;
  isProcessed: boolean;
};

export default function PatientDashboard() {
  // In a real implementation, you'd get this from authentication context
  const userId = 2; // Currently hardcoded to match our patient user (Emma Wilson)
  
  // Fetch the patient profile
  const { data: patientProfile, isLoading: isLoadingProfile } = useQuery<Patient>({
    queryKey: [`/api/my-patient-profile?userId=${userId}`],
  });

  // Fetch medical records
  const { data: medicalRecords, isLoading: isLoadingRecords } = useQuery<MedicalRecord[]>({
    queryKey: [`/api/my-medical-records?userId=${userId}`],
  });

  // Fetch prescriptions if patient profile is loaded
  const { data: prescriptions, isLoading: isLoadingPrescriptions } = useQuery<Prescription[]>({
    queryKey: [
      `/api/patients/${patientProfile?.id}/prescriptions`,
    ],
    enabled: !!patientProfile?.id,
  });

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Progress value={30} className="w-1/3 mb-4" />
        <p className="text-muted-foreground">Loading your health information...</p>
      </div>
    );
  }

  // If not found, show an error message
  if (!patientProfile) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            We couldn't find your patient profile. Please contact your healthcare provider.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <Card className="w-full md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Your personal health information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {patientProfile.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold">{patientProfile.name}</h3>
              <p className="text-muted-foreground">
                {patientProfile.gender}, {calculateAge(patientProfile.dateOfBirth)} years old
              </p>
              <Badge className="mt-2">{patientProfile.patientId}</Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Born: {new Date(patientProfile.dateOfBirth).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Secure blockchain records: {(medicalRecords || []).filter(r => r.isVerified).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle>Health Summary</CardTitle>
            <CardDescription>A quick overview of your health records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg flex flex-col items-center justify-center">
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold">{medicalRecords ? medicalRecords.length : 0}</span>
                  <span className="text-sm text-muted-foreground">Medical Records</span>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg flex flex-col items-center justify-center">
                  <Pill className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold">{prescriptions ? prescriptions.length : 0}</span>
                  <span className="text-sm text-muted-foreground">Prescriptions</span>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg flex flex-col items-center justify-center">
                  <LockKeyhole className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold">{(medicalRecords || []).filter(r => r.blockchainHash).length}</span>
                  <span className="text-sm text-muted-foreground">Secured Records</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="records" className="pt-4">
          <h2 className="text-2xl font-bold mb-4">My Medical Records</h2>
          
          {isLoadingRecords ? (
            <Progress value={60} className="w-full mb-4" />
          ) : medicalRecords && medicalRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicalRecords.map((record: MedicalRecord) => (
                <Card key={record.id} className="relative">
                  {record.isVerified && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Verified
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="capitalize">{record.recordType}</CardTitle>
                    <CardDescription>
                      {new Date(record.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {record.summary ? (
                      <div>
                        <h4 className="font-medium mb-2">Patient-Friendly Summary:</h4>
                        <p className="text-muted-foreground">{record.summary}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted-foreground">
                          This record has not been summarized yet. View the full record for details.
                        </p>
                      </div>
                    )}
                    
                    {record.blockchainHash && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-1">Blockchain Verification:</h4>
                        <p className="text-xs font-mono bg-muted p-2 rounded overflow-x-auto">
                          {record.blockchainHash}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Eye className="h-4 w-4" />
                      View Full Record
                    </Button>
                    <Button variant="secondary" size="sm" className="gap-1">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Records Found</AlertTitle>
              <AlertDescription>
                You don't have any medical records in our system yet.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="prescriptions" className="pt-4">
          <h2 className="text-2xl font-bold mb-4">My Prescriptions</h2>
          
          {isLoadingPrescriptions ? (
            <Progress value={60} className="w-full mb-4" />
          ) : prescriptions && prescriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((prescription: Prescription) => (
                <Card key={prescription.id}>
                  <CardHeader>
                    <CardTitle>Prescription #{prescription.prescriptionId}</CardTitle>
                    <CardDescription>
                      {new Date(prescription.scannedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video rounded-md overflow-hidden mb-4 bg-muted flex items-center justify-center">
                      {prescription.image ? (
                        <img src={prescription.image} alt="Prescription" className="w-full h-full object-contain" />
                      ) : (
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    
                    {prescription.isProcessed && prescription.medications && (
                      <div>
                        <h4 className="font-medium mb-2">Medications:</h4>
                        <div className="space-y-2">
                          {Array.isArray(prescription.medications) ? 
                            prescription.medications.map((med: any, i: number) => (
                              <div key={i} className="bg-muted p-2 rounded">
                                <p><strong>{med.name || 'Medication'}</strong></p>
                                {med.dosage && <p className="text-sm">Dosage: {med.dosage}</p>}
                                {med.frequency && <p className="text-sm">Frequency: {med.frequency}</p>}
                              </div>
                            )) : 
                            <p className="text-muted-foreground">Medication details not available</p>
                          }
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" size="sm" className="w-full gap-1">
                      <Download className="h-4 w-4" />
                      Download Prescription
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Prescriptions Found</AlertTitle>
              <AlertDescription>
                You don't have any prescriptions in our system yet.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}