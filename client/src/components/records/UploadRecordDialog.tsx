import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FileUpload } from '@/components/FileUpload';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Upload } from 'lucide-react';

interface UploadRecordDialogProps {
  patientId: number;
  userId: number;
  uploadType: 'medical-record' | 'prescription';
}

export function UploadRecordDialog({ patientId, userId, uploadType }: UploadRecordDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedFile, setUploadedFile] = useState<{ file: File; base64: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const isMedicalRecord = uploadType === 'medical-record';

  // Define separate schemas for different upload types
  const medicalRecordSchema = z.object({
    recordType: z.string().min(2, 'Please select a record type'),
    notes: z.string().optional(),
  });
  
  const prescriptionSchema = z.object({
    notes: z.string().optional(),
  });
  
  // Use the appropriate schema based on upload type
  const formSchema = isMedicalRecord ? medicalRecordSchema : prescriptionSchema;

  // Define types for form values
  type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>;
  type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;
  type FormValues = MedicalRecordFormValues | PrescriptionFormValues;

  const defaultValues = isMedicalRecord
    ? {
        recordType: '',
        notes: '',
      }
    : {
        notes: '',
      };

  // Using 'any' for form type to handle conditional schemas
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleFileSelect = (file: File, base64: string) => {
    setUploadedFile({ file, base64 });
    setUploadError(null);
  };

  const handleSubmit = async (values: FormValues) => {
    if (!uploadedFile) {
      setUploadError('Please upload a file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      if (isMedicalRecord) {
        const recordTypeValue = (values as { recordType: string }).recordType;
        
        // Upload medical record (PDF)
        await apiRequest('POST', '/api/medical-records', {
          patientId,
          recordType: recordTypeValue,
          content: { notes: values.notes },
          file: uploadedFile.base64,
          fileName: uploadedFile.file.name,
          fileType: uploadedFile.file.type,
          createdBy: userId,
        });

        // Invalidate medical records query cache
        queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/records`] });
      } else {
        // Upload prescription (Image)
        await apiRequest('POST', '/api/prescriptions', {
          patientId,
          image: uploadedFile.base64,
          createdBy: userId,
        });

        // Invalidate prescriptions query cache
        queryClient.invalidateQueries({ queryKey: [`/api/patients/${patientId}/prescriptions`] });
        queryClient.invalidateQueries({ queryKey: ['/api/prescriptions/recent'] });
      }

      toast({
        title: 'Upload successful',
        description: `The ${isMedicalRecord ? 'medical record' : 'prescription'} was uploaded successfully.`,
      });

      // Reset form and close dialog
      form.reset();
      setUploadedFile(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('An error occurred during upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          {isMedicalRecord ? 'Upload Medical Record (PDF)' : 'Upload Prescription (Image)'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isMedicalRecord ? 'Upload Medical Record' : 'Upload Prescription'}
          </DialogTitle>
          <DialogDescription>
            {isMedicalRecord
              ? 'Upload a PDF of the patient\'s medical record for AI-powered summarization.'
              : 'Upload an image of a handwritten prescription for OCR processing.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FileUpload
              acceptedFileTypes={isMedicalRecord ? ".pdf,application/pdf" : ".jpg,.jpeg,.png,image/jpeg,image/png"}
              maxSizeMB={10}
              onFileSelect={handleFileSelect}
              buttonText={`Select ${isMedicalRecord ? 'PDF' : 'Image'}`}
              fileTypeDescription={isMedicalRecord ? 'PDF file' : 'image (JPEG, PNG)'}
              isUploading={isUploading}
              error={uploadError || undefined}
            />

            {isMedicalRecord && (
              <FormField
                control={form.control}
                name="recordType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Record Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select record type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lab_results">Lab Results</SelectItem>
                        <SelectItem value="diagnosis">Diagnosis</SelectItem>
                        <SelectItem value="treatment_plan">Treatment Plan</SelectItem>
                        <SelectItem value="imaging">Imaging</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the type of medical record you are uploading.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Add any relevant notes" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional: Add any additional information about this document.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}