import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extractTextFromImage, extractMedications, mockOcrProcess } from '@/lib/tesseract';
import { apiRequest } from '@/lib/queryClient';
import { addNotification } from '@/lib/notification';

export default function PrescriptionOCR() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<{text: string, medications: any[]} | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadProgress(0);
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        setUploadError('Please upload a valid image file (JPG, PNG) or PDF');
        return;
      }
      
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (selectedFile.size > maxSize) {
        setUploadError('File is too large. Maximum size is 5MB');
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview with progress simulation
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          if (progress > 95) {
            clearInterval(interval);
          } else {
            setUploadProgress(progress);
          }
        }, 50);
      };
      
      simulateProgress();
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
        setUploadProgress(100);
        
        // Reset progress after a short delay
        setTimeout(() => {
          setUploadProgress(0);
        }, 500);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(droppedFile.type)) {
        setUploadError('Please upload a valid image file (JPG, PNG) or PDF');
        return;
      }
      
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (droppedFile.size > maxSize) {
        setUploadError('File is too large. Maximum size is 5MB');
        return;
      }
      
      setFile(droppedFile);
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        if (progress > 95) {
          clearInterval(interval);
        } else {
          setUploadProgress(progress);
        }
      }, 50);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
        setUploadProgress(100);
        
        // Reset progress after a short delay
        setTimeout(() => {
          setUploadProgress(0);
          clearInterval(interval);
        }, 500);
      };
      reader.readAsDataURL(droppedFile);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleProcessImage = async () => {
    if (!file || !preview) return;
    
    setIsProcessing(true);
    setOcrResult(null);
    
    try {
      // In a production app, this would call the real OCR API
      // For this demo, we'll use a mock function
      const result = await mockOcrProcess(preview);
      setOcrResult(result);
      
      // Auto-save the processed prescription
      if (result) {
        savePrescription.mutate({
          patientId: 1, // Default to first patient for demo
          prescriptionId: `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          doctorName: "Dr. Sarah Chen",
          scannedAt: new Date().toISOString(),
          imageUrl: preview.substring(0, 50) + "...", // Truncated for demo
          extractedText: result.text,
          medications: result.medications,
          isProcessed: true
        });
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setUploadError('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleViewScan = (scan: any) => {
    // In a real app, this would show the scan details
    addNotification('Prescription Viewed', `Viewing prescription ${scan.prescriptionId}`);
  };
  
  const handleSavePrescription = () => {
    if (!ocrResult) return;
    
    savePrescription.mutate({
      patientId: 1, // Default to first patient for demo
      prescriptionId: `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorName: "Dr. Sarah Chen",
      scannedAt: new Date().toISOString(),
      imageUrl: preview,
      extractedText: ocrResult.text,
      medications: ocrResult.medications,
      isProcessed: true
    });
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
        
        <div 
          className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center mb-6"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {preview ? (
            <div className="space-y-4">
              <div className="relative max-w-xs mx-auto">
                <img 
                  src={preview} 
                  alt="Prescription preview" 
                  className="mx-auto max-h-40 object-contain rounded"
                />
                <button 
                  onClick={() => {setFile(null); setPreview(null); setOcrResult(null);}}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  <span className="material-icons text-sm">close</span>
                </button>
              </div>
              
              <button
                className="bg-primary-DEFAULT hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md shadow-sm mx-auto"
                onClick={handleProcessImage}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></span>
                    Processing...
                  </span>
                ) : 'Process Prescription'}
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <span className="material-icons text-neutral-400 text-4xl">upload_file</span>
              </div>
              <p className="text-neutral-500 mb-2">Drag and drop prescription image or</p>
              <button 
                className="bg-primary-DEFAULT hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md shadow-sm"
                onClick={openFileDialog}
              >
                Browse Files
              </button>
              <p className="text-xs text-neutral-400 mt-2">Supports JPG, PNG, PDF formats</p>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,application/pdf"
              />
            </>
          )}
        </div>
        
        {ocrResult && (
          <div className="mb-6 border border-neutral-200 rounded-lg p-4">
            <h4 className="text-md font-medium text-neutral-700 mb-3">OCR Results</h4>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-neutral-50 rounded-md p-3">
                <div className="flex items-center mb-2">
                  <span className="material-icons text-green-500 mr-1 text-sm">check_circle</span>
                  <p className="text-xs font-medium text-neutral-700">Extracted Text</p>
                </div>
                <div className="font-mono text-xs text-neutral-700 whitespace-pre-line">
                  {ocrResult.text}
                </div>
              </div>
              <div className="flex-1 bg-neutral-50 rounded-md p-3">
                <div className="flex items-center mb-2">
                  <span className="material-icons text-primary mr-1 text-sm">medication</span>
                  <p className="text-xs font-medium text-neutral-700">Identified Medications</p>
                </div>
                <ul className="text-xs text-neutral-700">
                  {ocrResult.medications.map((med, index) => (
                    <li key={index} className="mb-1 pb-1 border-b border-gray-200 last:border-0">
                      <span className="font-medium">{med.name}</span> {med.dosage}, {med.frequency}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button className="text-primary-DEFAULT text-sm font-medium flex items-center">
                <span className="material-icons text-sm mr-1">save</span>
                Save to Patient Record
              </button>
            </div>
          </div>
        )}
        
        <h4 className="text-md font-medium text-neutral-700 mb-3">Recent Scans</h4>
        
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
        
        {/* OCR Demo */}
        <div className="mt-6 border border-neutral-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-neutral-700 mb-3">OCR Demonstration</h4>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="bg-gray-300 w-full h-40 rounded-md flex items-center justify-center">
                <span className="material-icons text-gray-500 text-4xl">image</span>
              </div>
            </div>
            <div className="flex-1 bg-neutral-50 rounded-md p-3">
              <div className="flex items-center mb-2">
                <span className="material-icons text-green-500 mr-1 text-sm">check_circle</span>
                <p className="text-xs font-medium text-neutral-700">OCR Results</p>
              </div>
              <div className="font-mono text-xs text-neutral-700">
                <p>Patient: Emma Wilson</p>
                <p>DOB: 05/12/1989</p>
                <p>Rx: Atorvastatin 20mg</p>
                <p>Sig: 1 tablet daily at bedtime</p>
                <p>Qty: 30</p>
                <p>Refills: 3</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
