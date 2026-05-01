export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

// 1. Unified Lazy Loader for PDF.js
// This ensures the library is only loaded once, and ONLY in the browser.
let pdfjsLibInstance: any = null;

async function getPdfJs() {
  if (pdfjsLibInstance) return pdfjsLibInstance;
  
  try {
    const pdfjsLib = await import('pdfjs-dist');
    // Use the official CDN to guarantee the worker version perfectly matches the library version
    pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
    
    pdfjsLibInstance = pdfjsLib;
    return pdfjsLibInstance;
  } catch (error) {
    console.error("Failed to load pdfjs-dist:", error);
    throw error;
  }
}

// 2. The Image Converter
export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
  try {
    const lib = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    // Scale 4 is quite high (good quality, but large file). Scale 2 or 3 is usually plenty for web preview.
    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) throw new Error("Could not create canvas context");

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    await page.render({ canvasContext: context, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve({ imageUrl: "", file: null, error: "Failed to create image blob" });
          }

          const originalName = file.name.replace(/\.pdf$/i, "");
          const imageFile = new File([blob], `${originalName}.png`, { type: "image/png" });

          resolve({
            imageUrl: URL.createObjectURL(blob),
            file: imageFile,
          });
        },
        "image/png",
        1.0
      );
    });
  } catch (err) {
    console.error("PDF to Image Error:", err);
    return { imageUrl: "", file: null, error: String(err) };
  }
}

// 3. The Text Extractor
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const lib = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        // @ts-ignore - 'str' is a valid property on TextItem
        .map((item) => item.str)
        .join(" ");
        
      fullText += pageText + "\n\n";
    }

    return fullText.trim();
  } catch (err) {
    console.error("PDF Text Extraction Error:", err);
    throw err; // Re-throw so the upload handler can catch it and show an error UI
  }
};