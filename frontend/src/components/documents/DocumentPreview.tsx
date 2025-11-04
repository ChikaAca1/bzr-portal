import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { FileText, Download, ExternalLink, X } from 'lucide-react';

/**
 * DocumentPreview Modal Component (T105)
 *
 * Modal for previewing generated document metadata and downloading.
 * Shows document info, summary, and provides download/view options.
 *
 * Features:
 * - Document metadata display (filename, size, expiration)
 * - Summary of contents (position, company, risk count)
 * - Download button
 * - Optional external viewer link (Google Docs Viewer)
 * - Serbian Cyrillic UI
 *
 * Usage:
 *   <DocumentPreview
 *     open={showPreview}
 *     onClose={() => setShowPreview(false)}
 *     document={{
 *       url: 'https://...blob.vercel-storage.com/akt-1-5.docx',
 *       filename: 'akt-1-5-1698765432.docx',
 *       size: 54321,
 *       expiresIn: '24 hours',
 *       positionName: 'Варилац',
 *       companyName: 'АД "Технопласт"',
 *       riskCount: 12
 *     }}
 *   />
 */

interface DocumentPreviewProps {
  open: boolean;
  onClose: () => void;
  document: {
    url: string;
    filename: string;
    size: number;
    expiresIn?: string;
    message?: string;
    // Optional metadata for summary
    positionName?: string;
    companyName?: string;
    riskCount?: number;
  };
}

export function DocumentPreview({ open, onClose, document }: DocumentPreviewProps) {
  const [downloading, setDownloading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownload = () => {
    setDownloading(true);
    window.open(document.url, '_blank');
    setTimeout(() => setDownloading(false), 1000);
  };

  const handleViewExternal = () => {
    // Use Google Docs Viewer to preview DOCX in browser
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`;
    window.open(viewerUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Акт о процени ризика
          </DialogTitle>
          <DialogDescription>
            Документ је успешно генерисан и спреман за преузимање.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Success message */}
          {document.message && (
            <div className="rounded-md bg-green-50 border border-green-200 p-3">
              <p className="text-sm text-green-800">{document.message}</p>
            </div>
          )}

          {/* Document Metadata */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              Информације о документу
            </h4>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Назив фајла</p>
                <p className="font-mono text-xs break-all">{document.filename}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs mb-1">Величина</p>
                <p className="font-medium">{formatFileSize(document.size)}</p>
              </div>

              {document.expiresIn && (
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs mb-1">Истиче за</p>
                  <p className="font-medium">{document.expiresIn}</p>
                </div>
              )}
            </div>
          </div>

          {/* Document Summary (if metadata provided) */}
          {(document.positionName || document.companyName || document.riskCount !== undefined) && (
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Садржај документа
              </h4>

              <div className="space-y-2 text-sm">
                {document.companyName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Предузеће:</span>
                    <span className="font-medium">{document.companyName}</span>
                  </div>
                )}

                {document.positionName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Радно место:</span>
                    <span className="font-medium">{document.positionName}</span>
                  </div>
                )}

                {document.riskCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Процене ризика:</span>
                    <span className="font-medium">{document.riskCount}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preview Notice */}
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
            💡 <strong>Напомена:</strong> DOCX документи се не могу прегледати директно у
            прегледачу. Преузмите фајл и отворите га у Microsoft Word или другом програму за
            обраду текста.
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleViewExternal}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Прикажи у прегледачу
          </Button>

          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {downloading ? 'Преузимање...' : 'Преузми документ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * DocumentPreviewButton - Trigger button for preview modal
 *
 * Convenience component that wraps GenerateDocument + DocumentPreview.
 *
 * Usage:
 *   <DocumentPreviewButton
 *     positionId={5}
 *     positionName="Варилац"
 *     companyName="АД Технопласт"
 *   />
 */
interface DocumentPreviewButtonProps {
  positionId: number;
  positionName?: string;
  companyName?: string;
  riskCount?: number;
}

export function DocumentPreviewButton({
  positionId,
  positionName,
  companyName,
  riskCount,
}: DocumentPreviewButtonProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [documentData, setDocumentData] = useState<any>(null);

  const handleSuccess = (data: any) => {
    setDocumentData({
      ...data,
      positionName,
      companyName,
      riskCount,
    });
    setShowPreview(true);
  };

  return (
    <>
      <Button
        onClick={() => {
          // Trigger document generation
          // This would use the GenerateDocument component's logic
          // For now, just a placeholder
        }}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        Генериши и прегледај
      </Button>

      {documentData && (
        <DocumentPreview
          open={showPreview}
          onClose={() => setShowPreview(false)}
          document={documentData}
        />
      )}
    </>
  );
}
