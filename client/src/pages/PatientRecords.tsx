import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import PatientRecord from "@/components/dashboard/PatientRecord";
import PatientSearch from "@/components/dashboard/PatientSearch";

export default function PatientRecords() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  
  const { data: patients, isLoading } = useQuery({
    queryKey: ['/api/patients'],
    staleTime: 60000, // 1 minute
  });
  
  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-neutral-800">Patient Records</h2>
            <p className="text-neutral-500">View and manage patient medical records</p>
          </div>
          
          <PatientSearch />
          
          {selectedPatientId ? (
            <PatientRecord patientId={selectedPatientId} />
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-neutral-800 mb-4">Patient Records</h3>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    {patients && patients.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {patients.map((patient: any) => (
                          <button
                            key={patient.id}
                            className="border border-neutral-200 rounded-md p-4 hover:bg-neutral-50 text-left"
                            onClick={() => setSelectedPatientId(patient.id)}
                          >
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                {patient.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <p className="font-medium text-neutral-800">{patient.name}</p>
                                <p className="text-sm text-neutral-500">ID: {patient.patientId}</p>
                                <p className="text-xs text-neutral-400">
                                  {patient.gender}, DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-neutral-500">
                        No patients found. Add a new patient to get started.
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <button className="bg-primary-DEFAULT hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium flex items-center mx-auto">
                        <span className="material-icons text-sm mr-1">add</span>
                        Add New Patient
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
