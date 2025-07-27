export const generateFileHash = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        resolve(hashHex);
      } catch (error) {
        reject(new Error(`Failed to generate file hash: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file for hash generation"));
    };

    reader.readAsArrayBuffer(file);
  });
};
