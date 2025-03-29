import React, { useState, useRef } from 'react';
import { Button, Card, CardContent, Progress, Alert, AlertTitle, AlertDescription } from '@/components/ui';
import { Upload, FileType, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  acceptedFileTypes: string;
  maxSizeMB: number;
  onFileSelect: (file: File, base64: string) => void;
  buttonText: string;
  fileTypeDescription: string;
  isUploading?: boolean;
  error?: string;
  success?: boolean;
}

export function FileUpload({
  acceptedFileTypes,
  maxSizeMB,
  onFileSelect,
  buttonText, 
  fileTypeDescription,
  isUploading = false,
  error,
  success = false
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setFileError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    // Validate file type by mimetype
    const validTypes = acceptedFileTypes.split(',').map(type => type.trim());
    const isValidType = validTypes.some(type => {
      if (type.startsWith('.')) {
        // Handle file extensions
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      } else {
        // Handle MIME types
        return file.type === type;
      }
    });

    if (!isValidType) {
      setFileError(`Invalid file type. Please upload ${fileTypeDescription}.`);
      return;
    }

    setFileError(null);
    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        // Ensure the base64 data is properly formatted
        const base64Data = result.split(',')[1] || result;
        onFileSelect(file, base64Data);
      };
      reader.readAsDataURL(file);
    } else {
      // For non-image files (like PDFs)
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Ensure the base64 data is properly formatted
        const base64Data = result.split(',')[1] || result;
        onFileSelect(file, base64Data);
      };
      reader.readAsDataURL(file);
      setPreview(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPrimaryFileIcon = () => {
    if (success) return <CheckCircle className="h-12 w-12 text-green-500" />;
    if (selectedFile?.type.startsWith('image/')) return <FileType className="h-12 w-12 text-primary" />;
    return <Upload className="h-12 w-12 text-primary" />;
  };

  return (
    <Card className={`border-2 ${isDragging ? 'border-primary' : 'border-dashed border-gray-300'} ${success ? 'bg-green-50' : ''}`}>
      <CardContent className="p-4">
        <div
          className="flex flex-col items-center justify-center p-4 space-y-4"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={acceptedFileTypes}
            className="hidden"
          />

          {preview ? (
            <div className="relative">
              <img 
                src={preview} 
                alt="File preview" 
                className="max-h-40 max-w-full rounded object-contain"
              />
              <button 
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                className="absolute -top-3 -right-3 bg-red-100 rounded-full p-1 hover:bg-red-200"
              >
                <X className="h-4 w-4 text-red-500" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              {getPrimaryFileIcon()}
              
              {!selectedFile && !success && (
                <>
                  <p className="text-center text-sm mt-2">
                    {isDragging ? 'Drop file here' : `Drag and drop your ${fileTypeDescription} or click to browse`}
                  </p>
                  <p className="text-xs text-gray-500">Max file size: {maxSizeMB}MB</p>
                </>
              )}

              {selectedFile && !preview && !success && (
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                    className="mt-2 text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}

              {success && (
                <p className="text-sm font-medium text-green-700">File uploaded successfully!</p>
              )}
            </div>
          )}

          {isUploading && (
            <div className="w-full">
              <Progress value={65} className="h-2" />
              <p className="text-xs text-center mt-1">Uploading...</p>
            </div>
          )}

          {fileError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!selectedFile && !success && (
            <Button 
              type="button"
              onClick={handleClick}
              className="mt-2"
            >
              {buttonText}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}