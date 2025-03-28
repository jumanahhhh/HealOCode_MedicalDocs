import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Download, FileText } from 'lucide-react';

interface FileViewerProps {
  fileName?: string;
  fileUrl: string;
  fileType: string;
  title: string;
  description?: string;
}

export function FileViewer({ 
  fileName = 'Document', 
  fileUrl, 
  fileType, 
  title, 
  description 
}: FileViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const isPdf = fileType.includes('pdf');
  const isImage = fileType.includes('image');
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex flex-col gap-2">
        <Card className="overflow-hidden">
          <CardContent className="p-3 flex justify-center items-center">
            {isImage ? (
              <div className="h-32 w-full flex items-center justify-center bg-muted rounded overflow-hidden">
                <img 
                  src={fileUrl} 
                  alt={fileName} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="h-32 w-full flex flex-col items-center justify-center bg-muted rounded">
                <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">{fileName}</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex gap-2">
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 gap-1">
              <Eye className="h-4 w-4" />
              View
            </Button>
          </DialogTrigger>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      
      <DialogContent className={isPdf ? "max-w-4xl" : "max-w-2xl"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className={`mt-2 ${isPdf ? "h-[80vh]" : ""}`}>
          {isImage ? (
            <img 
              src={fileUrl} 
              alt={fileName} 
              className="max-w-full mx-auto object-contain" 
            />
          ) : isPdf ? (
            <iframe 
              src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
              className="w-full h-full"
              title={fileName}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-muted rounded">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-center">
                This file type cannot be previewed. Please download the file to view it.
              </p>
              <Button 
                variant="default" 
                size="sm" 
                className="mt-4 gap-1"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}