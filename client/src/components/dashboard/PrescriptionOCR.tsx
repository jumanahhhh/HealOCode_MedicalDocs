import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extractTextFromImage, extractMedications, mockOcrProcess } from '@/lib/tesseract';
import { apiRequest } from '@/lib/queryClient';
import { addNotification } from '@/lib/notification';
import { UploadRecordDialog } from '@/components/records/UploadRecordDialog';

export default function PrescriptionOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<{text: string, medications: any[]} | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: recentScans = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/prescriptions/recent'],
    staleTime: 60000, // 1 minute
  });
  
  // Mutation for saving the prescription
  const savePrescription = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/prescriptions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prescriptions/recent'] });
      // Add notification
      addNotification('Prescription Saved', 'The processed prescription has been saved to patient records');
    }
  });

  const handleViewScan = (scan: any) => {
    // In a real app, this would show the scan details
    addNotification('Prescription Viewed', `Viewing prescription ${scan.prescriptionId}`);
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-medium text-neutral-800">Prescription Recognition</h3>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <p className="text-neutral-600 text-sm mb-4">
            Upload a handwritten prescription to extract and digitize the information using AI-powered OCR.
          </p>
        </div>
        
        <div className="mb-6">
          <UploadRecordDialog
            patientId={1} // Default to first patient for demo
            userId={1} // Default to first user for demo
            uploadType="prescription"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div>
            {recentScans && recentScans.length > 0 ? (
              recentScans.map((scan: any) => (
                <div key={scan.id} className="prescription-card mb-3 bg-neutral-50 rounded-lg overflow-hidden">
                  <div className="flex items-center p-3">
                    <div className="flex-shrink-0 relative">
                      <div className="h-14 w-14 bg-gray-300 rounded flex items-center justify-center">
                        <span className="material-icons text-gray-500">description</span>
                      </div>
                      <div className="prescription-overlay">
                        <button 
                          className="text-white bg-primary-DEFAULT/90 p-1 rounded-full"
                          onClick={() => handleViewScan(scan)}
                        >
                          <span className="material-icons">visibility</span>
                        </button>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-sm font-medium text-neutral-800">{scan.prescriptionId}</h5>
                          <p className="text-xs text-neutral-500">
                            Scanned on {new Date(scan.scannedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          {scan.isProcessed ? "Processed" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {scan.medications && (
                    <div className="bg-white p-3 border-t border-neutral-200">
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-neutral-500">
                          {Array.isArray(scan.medications) 
                            ? scan.medications.map((m: any) => m.name).join(', ')
                            : "No medications identified"}
                        </span>
                        <button 
                          className="text-xs text-primary-DEFAULT flex items-center"
                          onClick={() => handleViewScan(scan)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-neutral-500">
                No recent scans found. Upload a prescription to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
