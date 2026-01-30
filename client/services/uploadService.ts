export interface UploadResponse {
  success: boolean;
  url: string;
  path: string;
  fileName: string;
}

/**
 * Upload a PDF file to Supabase via the backend API
 * @param file - The PDF file to upload
 * @param folder - The folder to store the file in (e.g., "aadhaar-cards", "pan-cards")
 * @returns The public URL and path of the uploaded file
 */
export async function uploadPDF(
  file: File,
  folder: string = "documents"
): Promise<UploadResponse> {
  // Validate file type
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File size must be less than 10MB");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload/pdf", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  return response.json();
}

/**
 * Delete a PDF file from Supabase
 * @param filePath - The path of the file to delete
 */
export async function deletePDF(filePath: string): Promise<void> {
  const encodedPath = encodeURIComponent(filePath);
  const response = await fetch(`/api/upload/${encodedPath}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Delete failed");
  }
}

/**
 * Handle file selection and upload
 * @param event - The file input change event
 * @param folder - The folder to store the file in
 * @returns The uploaded file URL
 */
export async function handleFileUpload(
  event: React.ChangeEvent<HTMLInputElement>,
  folder: string = "documents"
): Promise<string> {
  const file = event.target.files?.[0];

  if (!file) {
    throw new Error("No file selected");
  }

  const response = await uploadPDF(file, folder);
  return response.url;
}
