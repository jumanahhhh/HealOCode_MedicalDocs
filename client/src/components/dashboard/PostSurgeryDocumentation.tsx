import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function PostSurgeryDocumentation() {
  const [procedureType, setProcedureType] = useState('Appendectomy');
  const [patient, setPatient] = useState('');
  const [surgeryDate, setSurgeryDate] = useState('');
  const [findings, setFindings] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/surgery-templates'],
    staleTime: 3600000, // 1 hour
  });
  
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['/api/patients'],
    staleTime: 60000, // 1 minute
  });
  
  const handleGenerateDocumentation = () => {
    if (!procedureType || !patient || !surgeryDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsGenerating(true);
    
    // In a real app, this would call the API to generate the documentation
    setTimeout(() => {
      setGeneratedDoc(getMockSurgeryDocumentation(procedureType));
      setIsGenerating(false);
    }, 1500);
  };
  
  const getMockSurgeryDocumentation = (procedure: string): string => {
    const templates: Record<string, string> = {
      'Appendectomy': `POST-OPERATIVE NOTE: APPENDECTOMY

Patient: Emma Wilson
Date of Procedure: ${surgeryDate || '06/12/2023'}
Surgeon: Dr. Sarah Chen
Procedure: Laparoscopic Appendectomy

PREOPERATIVE DIAGNOSIS
Acute appendicitis

POSTOPERATIVE DIAGNOSIS
Acute appendicitis, confirmed

PROCEDURE DETAILS
Patient underwent uncomplicated laparoscopic appendectomy under general anesthesia. 
Three ports were placed: one 10mm umbilical port and two 5mm ports in the left lower quadrant and suprapubic region.
The appendix was identified, appearing inflamed but without perforation. 
The mesoappendix was divided using electrocautery. The appendiceal base was secured with two endoloops and divided.
The specimen was removed through the umbilical port. All ports were removed and incisions closed.

ESTIMATED BLOOD LOSS
Minimal (< 10ml)

POST-OPERATIVE PLAN
- Patient to be discharged when tolerating oral intake
- Oral antibiotics for 5 days
- Return to clinic in 2 weeks for follow-up
- Wound care instructions provided`,
      'Cholecystectomy': `POST-OPERATIVE NOTE: CHOLECYSTECTOMY

Patient: ${patient || 'Emma Wilson'}
Date of Procedure: ${surgeryDate || '06/12/2023'}
Surgeon: Dr. Sarah Chen
Procedure: Laparoscopic Cholecystectomy

PREOPERATIVE DIAGNOSIS
Cholelithiasis with chronic cholecystitis

POSTOPERATIVE DIAGNOSIS
Cholelithiasis with chronic cholecystitis, confirmed

PROCEDURE DETAILS
Patient underwent uncomplicated laparoscopic cholecystectomy under general anesthesia.
Four ports were placed in the standard configuration. The gallbladder was dissected free from the liver bed.
The cystic duct and artery were identified, clipped, and divided. The gallbladder was removed through the umbilical port.
All ports were removed and incisions closed.

ESTIMATED BLOOD LOSS
Minimal (< 25ml)

POST-OPERATIVE PLAN
- Patient to be discharged same day if tolerating oral intake
- Pain management with oral analgesics
- Return to clinic in 2 weeks for follow-up
- Dietary recommendations provided`,
      'Total Knee Replacement': `POST-OPERATIVE NOTE: TOTAL KNEE REPLACEMENT

Patient: ${patient || 'Emma Wilson'}
Date of Procedure: ${surgeryDate || '06/12/2023'}
Surgeon: Dr. Sarah Chen
Procedure: Total Knee Arthroplasty, Right Knee

PREOPERATIVE DIAGNOSIS
Severe osteoarthritis of the right knee

POSTOPERATIVE DIAGNOSIS
Severe osteoarthritis of the right knee, confirmed

PROCEDURE DETAILS
Patient underwent uncomplicated total knee arthroplasty under spinal anesthesia.
Midline incision with medial parapatellar approach. Femoral and tibial cuts were made according to preoperative planning.
Trial components were placed with good range of motion and stability. Final components were cemented in place.
Wound was closed in layers over a drain.

IMPLANTS
- Femoral component: Size 5
- Tibial component: Size 4
- Polyethylene insert: 10mm
- Patellar button: 35mm

ESTIMATED BLOOD LOSS
150ml

POST-OPERATIVE PLAN
- Physical therapy to begin day of surgery
- DVT prophylaxis with enoxaparin for 2 weeks
- Weight bearing as tolerated with walker
- Follow-up in clinic in 2 weeks for staple removal
- Comprehensive rehabilitation protocol provided`
    };
    
    return templates[procedure] || `No template available for ${procedure}`;
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-neutral-800">Post-Surgery Documentation</h3>
        <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
          <span className="material-icons text-sm mr-1">add</span>
          New Documentation
        </button>
      </div>
      
      <div className="p-6">
        <p className="text-neutral-600 text-sm mb-6">
          Create and manage post-surgery documentation with AI-powered templates tailored to procedure types.
        </p>
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-neutral-700">Recent Templates</h4>
            <span className="text-sm text-primary-DEFAULT cursor-pointer">View All</span>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates && templates.map((template: string, index: number) => (
                <div key={index} className="border border-neutral-200 rounded-lg hover:border-primary-light cursor-pointer">
                  <div className="p-4">
                    <div className="flex items-start">
                      <div className="bg-teal-100 p-2 rounded-full">
                        <span className="material-icons text-teal-500">description</span>
                      </div>
                      <div className="ml-3">
                        <h5 className="text-sm font-medium text-neutral-800">{template}</h5>
                        <p className="text-xs text-neutral-500 mt-1">Post-op standard template</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-neutral-200 px-4 py-2 bg-neutral-50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-500">Last used: {index + 1} day{index !== 0 ? 's' : ''} ago</span>
                      <button className="text-primary-DEFAULT">
                        <span className="material-icons text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {(!templates || templates.length === 0) && (
                <div className="col-span-full text-center py-4 text-neutral-500">
                  No surgery templates found.
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* AI-Powered Documentation Example */}
        <div className="border border-neutral-200 rounded-lg">
          <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-medium text-neutral-700">AI-Powered Documentation Example</h4>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light/10 text-primary-DEFAULT">
                Demo
              </span>
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2">
                <form>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Procedure Type*</label>
                    <select 
                      className="block w-full p-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light"
                      value={procedureType}
                      onChange={(e) => setProcedureType(e.target.value)}
                    >
                      {templates && templates.map((template: string, index: number) => (
                        <option key={index} value={template}>{template}</option>
                      ))}
                      {(!templates || templates.length === 0) && (
                        <>
                          <option value="Appendectomy">Appendectomy</option>
                          <option value="Cholecystectomy">Cholecystectomy</option>
                          <option value="Total Knee Replacement">Total Knee Replacement</option>
                          <option value="Hernia Repair">Hernia Repair</option>
                        </>
                      )}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Patient*</label>
                    <select 
                      className="block w-full p-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light"
                      value={patient}
                      onChange={(e) => setPatient(e.target.value)}
                    >
                      <option value="">Select a patient</option>
                      {patients && patients.map((p: any) => (
                        <option key={p.id} value={p.name}>{p.name} ({p.patientId})</option>
                      ))}
                      {(!patients || patients.length === 0) && (
                        <>
                          <option value="Emma Wilson">Emma Wilson (P-2023-0456)</option>
                          <option value="James Rodriguez">James Rodriguez (P-2023-0421)</option>
                          <option value="Sophia Chen">Sophia Chen (P-2023-0389)</option>
                        </>
                      )}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Surgery Date*</label>
                    <input 
                      type="date" 
                      className="block w-full p-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light"
                      value={surgeryDate}
                      onChange={(e) => setSurgeryDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Key Findings</label>
                    <textarea 
                      rows={3} 
                      className="block w-full p-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light" 
                      placeholder="Enter key surgical findings..."
                      value={findings}
                      onChange={(e) => setFindings(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <button 
                      type="button" 
                      className="w-full bg-primary-DEFAULT hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md shadow-sm"
                      onClick={handleGenerateDocumentation}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <span className="flex items-center justify-center">
                          <span className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></span>
                          Generating...
                        </span>
                      ) : 'Generate Documentation'}
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="lg:col-span-3 border border-neutral-200 rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-md font-medium text-neutral-700">Generated Documentation</h5>
                  <div className="flex space-x-2">
                    <button className="text-neutral-500 hover:text-neutral-700">
                      <span className="material-icons text-sm">content_copy</span>
                    </button>
                    <button className="text-neutral-500 hover:text-neutral-700">
                      <span className="material-icons text-sm">print</span>
                    </button>
                    <button className="text-neutral-500 hover:text-neutral-700">
                      <span className="material-icons text-sm">download</span>
                    </button>
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none overflow-auto max-h-[500px]">
                  {generatedDoc ? (
                    <pre className="whitespace-pre-wrap font-sans text-sm text-neutral-700">{generatedDoc}</pre>
                  ) : (
                    <div className="text-center py-12 text-neutral-500">
                      {isGenerating ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                          <p>Generating documentation...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="material-icons text-neutral-400 text-4xl mb-2">description</span>
                          <p>Fill out the form and click "Generate Documentation" to create a post-operative note</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {generatedDoc && (
                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-neutral-200">
                    <div className="flex items-center">
                      <span className="material-icons text-green-500 text-sm mr-1">auto_awesome</span>
                      <span className="text-xs text-neutral-500">AI-generated based on procedure type and clinical input</span>
                    </div>
                    <button className="text-xs text-primary-DEFAULT flex items-center">
                      <span className="material-icons text-xs mr-1">edit</span> 
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
