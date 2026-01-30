import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("Missing Supabase credentials");
}

export const supabase = createClient(supabaseUrl, supabaseSecretKey);

const BUCKET_NAME = "employee-documents";

// Upload file to Supabase Storage
export async function uploadFile(
  file: Buffer,
  fileName: string,
  folder: string,
) {
  try {
    const filePath = `${folder}/${Date.now()}-${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
}

// Delete file from Supabase Storage
export async function deleteFile(filePath: string) {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("File delete error:", error);
    throw error;
  }
}

// List files in a folder
export async function listFiles(folder: string) {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folder);

    if (error) {
      throw new Error(`List failed: ${error.message}`);
    }

    return { success: true, files: data };
  } catch (error) {
    console.error("File list error:", error);
    throw error;
  }
}
