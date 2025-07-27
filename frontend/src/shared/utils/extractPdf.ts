import * as pdfjsLib from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export async function extractPdfText(file: File): Promise<string> {
    if (!file) throw new Error('No file provided');

    const arrayBuffer = await file.arrayBuffer();
    const typedArray = new Uint8Array(arrayBuffer);

    try {
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
                .filter((item): item is TextItem => 'str' in item)
                .map(item => item.str || '')
                .join(' ');

            fullText += `\n--- Page ${i} ---\n${pageText}`;
        }

        return fullText.trim();
    } catch (error) {
        console.error('Error extracting text:', error);
        throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function extractPdfMetadata(file: File) {
    if (!file) throw new Error('No file provided');

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
        console.error('Error extracting metadata:', error);
        throw new Error(`Failed to extract metadata: ${error instanceof Error ? error.message : String(error)}`);
    }
}
