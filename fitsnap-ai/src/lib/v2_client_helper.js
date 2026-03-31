/**
 * FitSnap AI v2: Frontend Logic Helper
 * 
 * Example usage in a component or custom hook.
 */

/**
 * 1. Upload file directly to S3 via Presigned URL
 */
export async function uploadToS3(file) {
  // Step A: Get the signed URL
  const response = await fetch("/api/upload/url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, fileType: file.type }),
  });
  
  const { uploadUrl, publicUrl, key } = await response.json();
  if (!uploadUrl) throw new Error("Failed to get S3 upload URL");

  // Step B: Direct PUT to S3
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type }
  });

  if (!uploadResponse.ok) throw new Error("S3 Upload Failed");

  return { publicUrl, key };
}

/**
 * 2. Start Async AI Generation
 */
export async function triggerGeneration(humanUrl, garmentUrl, category) {
  const response = await fetch("/api/generate", {
    method: "POST",
    body: JSON.stringify({ userImage: humanUrl, outfitImage: garmentUrl, category }),
  });
  
  const data = await response.json();
  if (data.error) throw new Error(data.error);

  return data.requestId; // Use this for polling
}

/**
 * 3. Poll for Status (Recursive)
 */
export async function pollStatus(requestId, onUpdate, delay = 3000) {
  const response = await fetch(`/api/status/${requestId}`);
  const data = await response.json();

  if (data.status === "COMPLETED") {
    onUpdate({ status: "COMPLETED", result: data.resultUrl });
    return data.resultUrl;
  }
  
  if (data.status === "FAILED") {
    throw new Error("Generation Failed. Credits Refunded.");
  }

  // Continue polling
  onUpdate({ status: "PROCESSING" });
  await new Promise(r => setTimeout(r, delay));
  return pollStatus(requestId, onUpdate, delay);
}
