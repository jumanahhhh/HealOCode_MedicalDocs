import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

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
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Fetch all patients for searching locally
  const { data: allPatients = [] } = useQuery<Patient[]>({
    queryKey: ['/api/patients'],
    staleTime: 30000, // 30 seconds
  });
  
  // Fetch recent patients
  const { data: recentPatients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ['/api/patients/recent'],
    staleTime: 30000, // 30 seconds
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      // Search through patients locally
      const query = searchQuery.toLowerCase();
      const results = allPatients.filter((patient: Patient) => 
        patient.name.toLowerCase().includes(query) || 
        patient.patientId.toLowerCase().includes(query)
      );
      setSearchResults(results);
      setShowRecentPatients(false);
      setIsSearching(false);
    } else {
      setShowRecentPatients(true);
      setSearchResults([]);
    }
  };
  
  return (
    <div className="mb-8">
      <div className="bg-white shadow rounded-lg p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-neutral-800">Patient Search</h3>
          <Link href="/patients">
            <button className="flex items-center text-primary-DEFAULT hover:text-primary-dark text-sm font-medium">
              <span className="material-icons text-sm mr-1">add</span>
              New Patient
            </button>
          </Link>
        </div>
        
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
        
        {!showRecentPatients && searchResults.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-neutral-500 mb-3">Search Results</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((patient: Patient) => (
                <div key={patient.id} className="flex items-center p-3 border border-neutral-200 rounded-md hover:bg-neutral-50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {patient.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="ml-3 text-left">
                    <p className="text-sm font-medium text-neutral-800">{patient.name}</p>
                    <p className="text-xs text-neutral-500">ID: {patient.patientId}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!showRecentPatients && searchResults.length === 0 && !isSearching && (
          <div className="mt-6 text-center py-4 bg-neutral-50 rounded-md">
            <p className="text-neutral-500">No patients match your search criteria.</p>
          </div>
        )}
        
        {showRecentPatients && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-neutral-500 mb-3">Recent Patients</h4>
            
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentPatients.map((patient: Patient) => (
                  <Link key={patient.id} href={`/patients/${patient.id}`}>
                    <div className="flex items-center p-3 border border-neutral-200 rounded-md hover:bg-neutral-50 cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {patient.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="ml-3 text-left">
                        <p className="text-sm font-medium text-neutral-800">{patient.name}</p>
                        <p className="text-xs text-neutral-500">ID: {patient.patientId}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {recentPatients.length === 0 && (
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
