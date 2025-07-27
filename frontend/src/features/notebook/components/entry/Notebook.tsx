import { NotebookProvider, useNotebook } from "@/features/notebook/context/NotebookProvider";
import { ChatSection } from "@/features/notebook/components/chat/ChatSection";
import PDFPreview from "@/features/notebook/components/pdf-viewer/PdfPreview";
import { PDFUpload } from "@/features/notebook/components/pdf-viewer/PDFUpload";

export default function Notebook() {
  return (
    <NotebookProvider>
      <NotebookMain />
    </NotebookProvider>
  );
}

function NotebookMain() {
  const { currentDocument } = useNotebook();

  if (!currentDocument?.id)
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <PDFUpload className="w-[600px] max-w-full" />
      </div>
    );

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="rounded-lg h-full border shadow-md flex overflow-hidden">
        {/* Chat Section - Left Side */}
        <div className="w-1/2 h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ChatSection />
          </div>
        </div>

        {/* PDF Viewer Section - Right Side */}
        <div className="w-1/2 h-full flex flex-col overflow-hidden">
          <PDFPreview />
        </div>
      </div>
    </div>
  );
}
