import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileUp } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Progress } from "@components/ui/progress";
import { PDFDocument } from "@/features/notebook/types";
import { useNotebook } from "@/features/notebook/context/NotebookProvider";
import { cn } from "@/shared/utils/cn";
import { generateFileHash } from "@/shared/utils/file";
import { checkAndGetWorkingPdfCdn } from "@/shared/utils/pdf";
import * as pdfjsLib from "pdfjs-dist";
import { TextItem } from "react-pdf";
import { toast } from "@/shared/components/ui/toast";

async function chooseAndLoadCdn() {
  const cdn = await checkAndGetWorkingPdfCdn(pdfjsLib.version);

  if (cdn) pdfjsLib.GlobalWorkerOptions.workerSrc = cdn;
}

chooseAndLoadCdn();

interface PDFUploadProps {
  className?: string;
  onUpload?: (file: File) => Promise<PDFDocument>;
}

export async function extractPdfText(file: File): Promise<string[]> {
  if (!file) throw new Error("No file provided");

  const arrayBuffer = await file.arrayBuffer();
  const typedArray = new Uint8Array(arrayBuffer);

  try {
    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
    const pages: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .filter((item): item is TextItem => "str" in item)
        .map((item) => item.str || "")
        .join(" ");

      pages.push(pageText?.trim());
    }
    return pages;
  } catch (error) {
    console.error("Error extracting text:", error);
    throw new Error(
      `Failed to extract text: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function extractPdfMetadata(file: File) {
  if (!file) throw new Error("No file provided");

  const arrayBuffer = await file.arrayBuffer();
  const typedArray = new Uint8Array(arrayBuffer);

  try {
    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
    const metadata = await pdf.getMetadata();

    let pageSize;
    if (pdf.numPages > 0) {
      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1.0 });
      pageSize = { width: viewport.width, height: viewport.height };
    }

    return {
      metadata,
      pageCount: pdf.numPages,
      pageSize,
    };
  } catch (error) {
    console.error("Error extracting metadata:", error);
    throw new Error(
      `Failed to extract metadata: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export const PDFUpload: React.FC<PDFUploadProps> = ({
  className,
  onUpload,
}) => {
  const { handlePdfUpload } = useNotebook();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        const url = URL.createObjectURL(file);
        const fileHash = await generateFileHash(file);
        const pdfText = await extractPdfText(file);
        const pdfMetadata = await extractPdfMetadata(file);

        const document: PDFDocument = {
          id: Date.now().toString(),
          name: file.name,
          url,
          pages: pdfMetadata?.pageCount || 1,
          uploadedAt: new Date(),
          fileHash,
        };

        handlePdfUpload(document, pdfText);
        onUpload?.(file);
      } catch (error) {
        console.error("Error uploading PDF:", error);
        toast({
          title: "Error",
          description: (error as Error)?.message || "Error uploading PDF",
          variant: "destructive",
        });
      }
    },
    [onUpload, handlePdfUpload]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!file.type.includes("pdf")) {
        alert("Please upload a PDF file");
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        alert("File size must be less than 50MB");
        return;
      }

      setUploading(true);
      setProgress(0);

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        await new Promise((resolve) => setTimeout(resolve, 2000));
        setProgress(100);
        clearInterval(progressInterval);

        setTimeout(() => {
          setUploading(false);
          setProgress(0);
          handleUpload(file);
        }, 1000);
      } catch (error) {
        alert(error instanceof Error ? error.message : "Upload failed");
        setUploading(false);
        setProgress(0);
      }
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    disabled: uploading,
  });

  // const removeFile = () => {
  //   setUploadedFile(null);
  // };

  return (
    <Card
      className={cn(
        "w-full border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 hover:border-purple-400 transition-colors",
        className
      )}
    >
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={`
            rounded-xl p-8 text-center cursor-pointer transition-all duration-300
            ${
              isDragActive
                ? "bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-400 shadow-lg scale-105"
                : "bg-white/80 hover:bg-white hover:shadow-lg hover:scale-[1.02]"
            }
            ${uploading ? "pointer-events-none opacity-50" : ""}
          `}
        >
          <input {...getInputProps()} />

          {uploading ? (
            <div className="space-y-6">
              <div className="relative">
                <Upload className="h-16 w-16 text-purple-500 mx-auto animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Uploading PDF...
                </h3>
                <Progress value={progress} className="h-3 bg-purple-100" />
                <p className="text-sm text-gray-600 mt-3">
                  {progress}% complete
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <FileUp className="h-10 w-10 text-white" />
                </div>
                {isDragActive && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {isDragActive ? "Drop your PDF here!" : "Upload PDF Document"}
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your PDF file here, or click to browse
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Maximum file size: 10MB</span>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
              </div>

              <Button variant="gradient" className="mt-4">
                Choose File
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
