import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Inisialisasi Cloudinary dari Environment Variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a file buffer to Cloudinary and returns the secure public URL.
 * @param buffer - The file buffer to upload
 * @param folderName - The destination folder in Cloudinary (e.g., 'avatars' or 'banners')
 * @returns The secure URL of the uploaded file
 */
export async function uploadToCloudinary(buffer: Buffer, folderName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `geomining/${folderName}`,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (result && result.secure_url) {
          return resolve(result.secure_url);
        }
        return reject(new Error(")Cloudinary did not return a secure URL"));
      }
    );

    // Convert buffer ke stream dan kirim ke Cloudinary
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    
    stream.pipe(uploadStream);
  });
}
