import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface Patient {
  id: number;
  patientId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
}

export default function PatientSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecentPatients, setShowRecentPatients] = useState(true);
  
  // Fetch recent patients
  const { data: recentPatients, isLoading } = useQuery({
    queryKey: ['/api/patients/recent'],
    staleTime: 30000, // 30 seconds
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this would search the API
      setShowRecentPatients(false);
    } else {
      setShowRecentPatients(true);
    }
  };
  
  return (
    <div className="mb-8">
      <div className="bg-white shadow rounded-lg p-5">
        <h3 className="text-lg font-medium text-neutral-800 mb-4">Patient Search</h3>
        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search patients by name, ID, or condition..." 
                  className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-icons text-neutral-400">search</span>
                </div>
              </div>
            </div>
            <div>
              <button 
                type="submit"
                className="w-full md:w-auto bg-primary-DEFAULT hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md shadow-sm"
              >
                Search
              </button>
            </div>
          </div>
        </form>
        
        {showRecentPatients && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-neutral-500 mb-3">Recent Patients</h4>
            
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentPatients && recentPatients.map((patient: Patient) => (
                  <Link key={patient.id} href={`/patients/${patient.id}`}>
                    <a className="flex items-center p-3 border border-neutral-200 rounded-md hover:bg-neutral-50">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {patient.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="ml-3 text-left">
                        <p className="text-sm font-medium text-neutral-800">{patient.name}</p>
                        <p className="text-xs text-neutral-500">ID: {patient.patientId}</p>
                      </div>
                    </a>
                  </Link>
                ))}
                
                {(!recentPatients || recentPatients.length === 0) && (
                  <div className="col-span-full text-center py-4 text-neutral-500">
                    No recent patients found.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
