import { useCallback, useEffect, useRef, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";

import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/cn";
import { useNotebook } from "@/features/notebook/context/NotebookProvider";
import { checkAndGetWorkingPdfCdn } from "@/shared/utils/pdf";

async function chooseAndLoadCdn() {
  const cdn = await checkAndGetWorkingPdfCdn(pdfjs.version);

  if (cdn) pdfjs.GlobalWorkerOptions.workerSrc = cdn;
}

chooseAndLoadCdn();

interface PDFPreviewProps {}

const SCALE_MULTIPLIER = 1.3333;
const DEFAULT_SCALE = 1;
const MIN_SCALE = 0.2;
const HORIZONTAL_PADDING = 32;
interface pdfDimensions {
  originalWidth: number;
  originalHeight: number;
  scale: number;
}

export function PDFPreview({}: PDFPreviewProps) {
  const {
    setCurrentDocument,
    currentDocument,
    currentPdfPage,
    setCurrentPdfPage,
  } = useNotebook();
  const [numPages, setNumPages] = useState<number>(0);
  const pdfDimensionsRef = useRef<pdfDimensions>({} as pdfDimensions);
  const [pdfDimensions, setPdfDimensions] = useState<pdfDimensions>({
    originalWidth: 0,
    originalHeight: 0,
    scale: DEFAULT_SCALE,
  });
  const [showControls, setShowControls] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const objectUrl = currentDocument?.url;

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentDocument((prev) => ({ ...prev, pages: numPages }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= numPages) {
      setCurrentPdfPage(newPage);
    }
  };

  const handleZoomIn = () => {
    const newScale = Math.min(pdfDimensions.scale + 0.1, 3);
    setPdfDimensions((prev) => ({ ...prev, scale: newScale }));
    pdfDimensionsRef.current = { ...pdfDimensions, scale: newScale };
  };

  const handleZoomOut = () => {
    const newScale = Math.max(pdfDimensions.scale - 0.1, MIN_SCALE);
    setPdfDimensions((prev) => ({ ...prev, scale: newScale }));
    pdfDimensionsRef.current = { ...pdfDimensions, scale: newScale };
  };

  const handleMouseMove = () => {
    if (!showControls) {
      setShowControls(true);
    }
  };

  const handleMouseLeave = () => {
    setShowControls(false);
  };

  const adjustScaleToFit = useCallback(() => {
    if (!pdfDimensionsRef.current?.originalWidth) return;

    const containerWidth = containerRef.current?.clientWidth ?? 0;
    if (!containerWidth) return;

    const availableWidth = containerWidth - HORIZONTAL_PADDING;
    let newScale = DEFAULT_SCALE;

    const fitScale =
      availableWidth /
      (pdfDimensionsRef.current.originalWidth * SCALE_MULTIPLIER);
    if (fitScale < 1) newScale = Math.max(fitScale, MIN_SCALE);

    setPdfDimensions((prev) => ({ ...prev, scale: newScale }));
    pdfDimensionsRef.current = { ...pdfDimensionsRef.current, scale: newScale };
  }, []);

  const handlePageLoadSuccess = useCallback(
    (page: { originalWidth: number; originalHeight: number }) => {
      if (pdfDimensionsRef.current?.originalWidth) return; // already done the parsing

      const data = {
        originalWidth: page.originalWidth,
        originalHeight: page.originalHeight,
        scale: DEFAULT_SCALE,
      } as pdfDimensions;
      pdfDimensionsRef.current = data;
      setPdfDimensions(data);

      adjustScaleToFit();
    },
    [adjustScaleToFit]
  );

  useEffect(() => {
    window.addEventListener("resize", adjustScaleToFit);
    return () => {
      window.removeEventListener("resize", adjustScaleToFit);
    };
  }, [adjustScaleToFit]);

  useEffect(() => {
    pdfDimensionsRef.current = { ...pdfDimensions };
  }, [pdfDimensions]);

  if (!objectUrl) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded">
        <div className="text-center text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p>No PDF to display</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-full w-full max-w-full border bg-accent p-3"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          "absolute left-1/2 top-4 z-20 -translate-x-1/2 transition-all duration-200",
          showControls
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        )}
      >
        <div className="flex items-center rounded-full border border-border bg-background px-3 py-2 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-1.5 border-border pr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(currentPdfPage - 1)}
              disabled={currentPdfPage === 1}
              className="h-7 w-7 rounded-full hover:bg-accent"
            >
              <ChevronLeft />
            </Button>

            <span className="min-w-[60px] select-none text-center text-sm text-secondary">
              {currentPdfPage} / {numPages}
            </span>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(currentPdfPage + 1)}
              disabled={currentPdfPage === numPages}
              className="h-7 w-7 rounded-full hover:bg-accent"
            >
              <ChevronRight />
            </Button>
          </div>

          <div className="flex items-center gap-1.5 border-x border-border px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              className="h-7 w-7 rounded-full hover:bg-accent"
              disabled={pdfDimensions.scale <= MIN_SCALE + 0.15}
            >
              <Minus />
            </Button>
            <span className="min-w-[40px] select-none text-center text-sm text-secondary">
              {Math.round(pdfDimensions.scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              className="h-7 w-7 rounded-full hover:bg-accent"
              disabled={pdfDimensions.scale >= 2.95}
            >
              <Plus />
            </Button>
          </div>
          <div className="flex items-center gap-1.5 pl-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(objectUrl, "_blank")}
              className="h-7 w-7 rounded-full hover:bg-accent"
              disabled={!objectUrl}
            >
              <ExternalLink />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (objectUrl) {
                  const link = document.createElement("a");
                  link.href = objectUrl;
                  link.download = currentDocument?.name;
                  link.click();
                }
              }}
              className="h-7 w-7 rounded-full hover:bg-accent"
              disabled={!objectUrl}
            >
              <Download />
            </Button>
          </div>
        </div>
      </div>

      <div
        className="pdf-container flex min-h-[60vh] w-full max-h-full overflow-auto"
        aria-label="PDF Viewer"
      >
        {objectUrl && (
          <Document
            externalLinkTarget="_blank"
            key={`doc-${currentPdfPage}-${objectUrl}`}
            file={objectUrl}
            onLoadSuccess={handleLoadSuccess}
            loading={
              <div className="flex h-[600px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-secondary" />
              </div>
            }
            error={
              <div className="flex h-[600px] items-center justify-center text-red-500">
                Failed to load PDF
              </div>
            }
            className="relative mx-auto flex justify-center p-4"
          >
            <Page
              key={`${currentPdfPage}@${pdfDimensions.scale}`}
              pageNumber={currentPdfPage}
              scale={pdfDimensions.scale * SCALE_MULTIPLIER}
              className="rounded-sm bg-white shadow-lg"
              onLoadSuccess={handlePageLoadSuccess}
              devicePixelRatio={window.devicePixelRatio}
            />
          </Document>
        )}
      </div>
    </div>
  );
}

export default PDFPreview;
