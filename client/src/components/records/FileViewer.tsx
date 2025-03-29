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
import { Eye, Download, FileText, ScrollText, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import path from 'path';
import process from 'process';

interface FileViewerProps {
  fileName?: string;
  fileUrl: string;
  fileType: string;
  title: string;
  description?: string;
  summary?: string;
  recordId?: number;
  onSummaryUpdate?: (newSummary: string) => void;
}

interface SummaryResponse {
  summary: string;
  error?: string;
}

export function FileViewer({ 
  fileName = 'Document', 
  fileUrl, 
  fileType, 
  title, 
  description,
  summary,
  recordId,
  onSummaryUpdate
}: FileViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('document');
  
  const isPdf = fileType.includes('pdf');
  const isImage = fileType.includes('image');
  const hasSummary = isPdf && summary;
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSummarize = async () => {
    if (!recordId) {
      console.error('No recordId provided for summarization');
      toast({
        title: 'Error',
        description: 'Cannot generate summary without a record ID.',
        variant: 'destructive',
      });
      return;
    }

    setIsSummarizing(true);
    try {
      const response = await apiRequest('POST', `/api/medical-records/${recordId}/summarize`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Update the summary in the UI
      if (onSummaryUpdate) {
        onSummaryUpdate(data.summary);
      }

      // Switch to the summary tab
      setActiveTab('summary');

      toast({
        title: 'Success',
        description: 'Summary generated successfully.',
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate summary.',
        variant: 'destructive',
      });
    } finally {
      setIsSummarizing(false);
    }
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
        
        {isPdf && (
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="gap-2"
            >
              {isSummarizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <ScrollText className="h-4 w-4" />
                  Generate Summary
                </>
              )}
            </Button>
          </div>
        )}
        
        {hasSummary ? (
          <Tabs defaultValue="document" className="mt-4">
            <TabsList>
              <TabsTrigger value="document">Document</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="document" className="mt-4">
              <iframe 
                src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                className="w-full h-[70vh]"
                title={fileName}
              />
            </TabsContent>
            
            <TabsContent value="summary" className="mt-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ScrollText className="h-4 w-4" />
                  <h4 className="font-medium">AI-Generated Summary</h4>
                </div>
                <div className="prose prose-sm max-w-none">
                  {summary}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  );
}