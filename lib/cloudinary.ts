// lib/cloudinary.ts
// Cloudinary configuration — used for logo uploads and PDF storage.
// Two upload folders:
//   invoicepk/logos/ — business logo images
//   invoicepk/pdfs/  — generated invoice PDFs

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;



/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Configures and exports the Cloudinary SDK for server-side file storage.
| - Provides a centralized Cloudinary configuration for the application.
|
| Responsibilities:
| - Initializes the Cloudinary SDK using environment variables.
| - Establishes the connection required for file upload and management.
| - Supports storage of business logos and generated invoice PDFs.
| - Exports a shared Cloudinary instance for reuse across backend modules
|   handling file operations.
|
*/