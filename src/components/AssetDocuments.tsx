import { useState, useEffect, useRef } from 'react';
import { FileUp, Download, Trash2, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { assetDocumentAPI, AssetDocumentInfo } from '@/services/assetDocumentApi';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface AssetDocumentsProps {
  assetId: string;
  assetName: string;
}

const getFileIcon = (contentType: string) => {
  if (contentType?.startsWith('image/')) return Image;
  if (contentType?.includes('pdf')) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const AssetDocuments = ({ assetId, assetName }: AssetDocumentsProps) => {
  const [documents, setDocuments] = useState<AssetDocumentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const docs = await assetDocumentAPI.getAll(assetId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [assetId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await assetDocumentAPI.upload(assetId, file);
      }
      toast.success('Document(s) uploaded successfully!');
      fetchDocuments();
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (doc: AssetDocumentInfo) => {
    try {
      await assetDocumentAPI.download(assetId, doc.id, doc.fileName);
    } catch {
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async () => {
    if (!deleteDocId) return;
    try {
      await assetDocumentAPI.delete(assetId, deleteDocId);
      toast.success('Document deleted');
      fetchDocuments();
    } catch {
      toast.error('Failed to delete document');
    }
    setDeleteDocId(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">Documents — {assetName}</CardTitle>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleUpload}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <FileUp className="h-4 w-4 mr-1" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => {
              const Icon = getFileIcon(doc.contentType);
              return (
                <div key={doc.id} className="flex items-center justify-between p-2 rounded-md border border-border bg-muted/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(doc)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteDocId(doc.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!deleteDocId} onOpenChange={(open) => !open && setDeleteDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This file will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
