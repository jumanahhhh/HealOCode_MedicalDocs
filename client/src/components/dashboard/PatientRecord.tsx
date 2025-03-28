import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { generateMockSummary } from '@/lib/nlp';

interface PatientRecordProps {
  patientId?: number;
}

export default function PatientRecord({ patientId = 1 }: PatientRecordProps) {
  const [activeTab, setActiveTab] = useState('medical-history');
  
  // For demo purposes
  const patient = {
    id: 1,
    name: "Emma Wilson",
    patientId: "P-2023-0456",
    age: "34 years",
    gender: "Female",
    photo: ""
  };
  
  const diagnoses = ["Type 2 Diabetes Mellitus (E11.9)", "Hypertension (I10)", "Hyperlipidemia (E78.5)"];
  const medications = ["Metformin 500mg bid", "Lisinopril 10mg qd", "Atorvastatin 20mg qd"];
  
  const notes = [
    {
      id: 1,
      doctor: "Dr. Sarah Chen",
      specialty: "Primary Care",
      date: "06/12/2023",
      content: "Patient presents for routine diabetes follow-up. Reports compliance with medication regimen. Blood glucose levels have improved since last visit (HbA1c 7.1%, down from 7.8%). BP controlled at 128/78. Patient reports mild occasional neuropathic symptoms in feet; advised to continue monitoring and report if worsening."
    },
    {
      id: 2,
      doctor: "Dr. Michael Park",
      specialty: "Endocrinology",
      date: "04/22/2023",
      content: "Endocrinology consult for diabetes management. Patient reports difficulty with diet adherence. Discussed lifestyle modifications and importance of regular exercise. Medication regimen maintained. Follow-up in 3 months."
    }
  ];
  
  // Generate AI summary
  const aiSummary = generateMockSummary(patient.name, diagnoses);
  
  const handleRegenerateSummary = () => {
    // In a real app, this would call the API to regenerate the summary
    alert("In a real app, this would regenerate the AI summary.");
  };
  
  const handleCopySummary = () => {
    navigator.clipboard.writeText(aiSummary);
    alert("Summary copied to clipboard!");
  };
  
  const handleShareWithPatient = () => {
    // In a real app, this would share the summary with the patient
    alert("In a real app, this would send the summary to the patient.");
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-neutral-800">Patient Record</h3>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <span className="material-icons text-green-500 text-xs mr-1">verified</span>
              Blockchain Verified
            </span>
            <button className="ml-4 text-neutral-400 hover:text-neutral-600">
              <span className="material-icons">more_vert</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-medium">
              {patient.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="ml-4">
              <h4 className="text-xl font-serif font-semibold text-neutral-800">{patient.name}</h4>
              <p className="text-neutral-500">{patient.age} • {patient.gender} • ID: {patient.patientId}</p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <button className="flex items-center bg-primary-DEFAULT hover:bg-primary-dark text-white px-4 py-2 rounded-md">
              <span className="material-icons text-sm mr-1">edit</span>
              Edit Record
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-neutral-200 mb-6">
          <div className="flex -mb-px">
            <button 
              className={`mr-6 py-2 border-b-2 ${activeTab === 'medical-history' ? 'border-primary-DEFAULT text-primary-DEFAULT' : 'border-transparent text-neutral-500 hover:text-neutral-700'} font-medium`}
              onClick={() => setActiveTab('medical-history')}
            >
              Medical History
            </button>
            <button 
              className={`mr-6 py-2 border-b-2 ${activeTab === 'prescriptions' ? 'border-primary-DEFAULT text-primary-DEFAULT' : 'border-transparent text-neutral-500 hover:text-neutral-700'} font-medium`}
              onClick={() => setActiveTab('prescriptions')}
            >
              Prescriptions
            </button>
            <button 
              className={`mr-6 py-2 border-b-2 ${activeTab === 'lab-results' ? 'border-primary-DEFAULT text-primary-DEFAULT' : 'border-transparent text-neutral-500 hover:text-neutral-700'} font-medium`}
              onClick={() => setActiveTab('lab-results')}
            >
              Lab Results
            </button>
            <button 
              className={`mr-6 py-2 border-b-2 ${activeTab === 'ai-summary' ? 'border-primary-DEFAULT text-primary-DEFAULT' : 'border-transparent text-neutral-500 hover:text-neutral-700'} font-medium`}
              onClick={() => setActiveTab('ai-summary')}
            >
              AI Summary
            </button>
          </div>
        </div>
        
        {/* Record Content */}
        {activeTab === 'medical-history' && (
          <div className="space-y-6">
            <div>
              <h5 className="text-md font-medium text-neutral-800 mb-2">Current Diagnosis</h5>
              <p className="text-neutral-600">{diagnoses.join(', ')}</p>
            </div>
            
            <div>
              <h5 className="text-md font-medium text-neutral-800 mb-2">Medication Summary</h5>
              <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                {medications.map((med, index) => (
                  <li key={index}>{med}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="text-md font-medium text-neutral-800 mb-2">Recent Visit Notes</h5>
              {notes.map(note => (
                <div key={note.id} className="bg-neutral-50 p-4 rounded-md text-neutral-600 mb-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-medium text-neutral-500">{note.doctor} • {note.specialty} • {note.date}</span>
                    <span className="text-xs text-primary-DEFAULT font-medium cursor-pointer">View Full Notes</span>
                  </div>
                  <p className="text-sm">{note.content}</p>
                </div>
              ))}
            </div>
            
            {/* AI-Generated Summary Card */}
            <div className="bg-primary-light/5 border border-primary-light/20 rounded-lg p-4">
              <div className="flex items-start">
                <div className="bg-primary-light/20 p-2 rounded-full">
                  <span className="material-icons text-primary-DEFAULT">auto_awesome</span>
                </div>
                <div className="ml-3">
                  <h5 className="text-md font-medium text-neutral-800">AI-Generated Patient-Friendly Summary</h5>
                  <p className="text-sm text-neutral-600 mt-2">
                    {aiSummary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button 
                      className="text-xs text-primary-DEFAULT flex items-center"
                      onClick={handleRegenerateSummary}
                    >
                      <span className="material-icons text-xs mr-1">refresh</span> 
                      Regenerate
                    </button>
                    <button 
                      className="text-xs text-primary-DEFAULT flex items-center"
                      onClick={handleCopySummary}
                    >
                      <span className="material-icons text-xs mr-1">content_copy</span> 
                      Copy
                    </button>
                    <button 
                      className="text-xs text-primary-DEFAULT flex items-center"
                      onClick={handleShareWithPatient}
                    >
                      <span className="material-icons text-xs mr-1">share</span> 
                      Share with Patient
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'prescriptions' && (
          <div className="text-center py-4 text-neutral-500">
            Switch to the Prescriptions tab to view prescription history.
          </div>
        )}
        
        {activeTab === 'lab-results' && (
          <div className="text-center py-4 text-neutral-500">
            No lab results available.
          </div>
        )}
        
        {activeTab === 'ai-summary' && (
          <div className="space-y-4">
            <h5 className="text-md font-medium text-neutral-800">Full AI-Generated Summary</h5>
            <div className="bg-neutral-50 p-4 rounded-md">
              <p className="text-neutral-600">{aiSummary}</p>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                className="flex items-center text-primary-DEFAULT border border-primary-DEFAULT px-3 py-1 rounded-md text-sm"
                onClick={handleRegenerateSummary}
              >
                <span className="material-icons text-sm mr-1">refresh</span> 
                Regenerate
              </button>
              <button 
                className="flex items-center bg-primary-DEFAULT text-white px-3 py-1 rounded-md text-sm"
                onClick={handleShareWithPatient}
              >
                <span className="material-icons text-sm mr-1">share</span> 
                Share with Patient
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
