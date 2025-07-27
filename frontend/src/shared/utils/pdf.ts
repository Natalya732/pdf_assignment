let workingPdfCdn: string | null = null;

export async function checkAndGetWorkingPdfCdn(version: string) {
  if (workingPdfCdn) return workingPdfCdn;

  const cdnUrls = [
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`,
    `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`,
    `https://raw.githack.com/mozilla/pdfjs-dist/${version}/build/pdf.worker.min.mjs`,
    `https://cdn.statically.io/gh/mozilla/pdfjs-dist/${version}/build/pdf.worker.min.mjs`,
    `https://cdn.skypack.dev/pdfjs-dist@${version}/build/pdf.worker.min.mjs`,
  ];

  function checkScriptLoad(src: string) {
    return new Promise((resolve, reject) => {
      try {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
          resolve(true);
          script.remove();
        };
        script.onerror = () => {
          reject(null);
          script.remove();
        };
        document.head.appendChild(script);
      } catch (err) {
        console.log("script load error", err);
        reject(null);
      }
    });
  }

  async function chooseAndLoadCdn() {
    let isLoaded = false;
    for (const url of cdnUrls) {
      if (isLoaded) break;
      try {
        const res = await checkScriptLoad(url);
        if (res) {
          isLoaded = true;
          workingPdfCdn = url;
        }
      } catch (err) {}
    }

    if (!isLoaded) workingPdfCdn = cdnUrls[0];
  }

  await chooseAndLoadCdn();
  return workingPdfCdn;
}
