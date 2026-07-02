// app/api/business/logo/route.ts
// POST /api/business/logo
// Uploads a business logo to Cloudinary and saves the URL to the Business document.
// Accepts multipart/form-data with a 'logo' field containing the image file.
// Max file size: 2MB. Accepted formats: PNG, JPG.

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { connectDB } from '@/lib/db';
import { getBusinessForUser } from '@/lib/get-business';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  console.log('[POST /api/business/logo] Request received');

  return withAuth(req, async (req, uid) => {
    try {
      await connectDB();

      // 1. Parse multipart form data
      const formData = await req.formData();
      const file = formData.get('logo') as File | null;

      if (!file) {
        console.log('[POST /api/business/logo] No logo file provided');
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'No logo file provided.', status: 422 } },
          { status: 422 }
        );
      }

      // 2. Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        console.log(`[POST /api/business/logo] Invalid file type: ${file.type}`);
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Only PNG and JPG files are allowed.', status: 422 } },
          { status: 422 }
        );
      }

      // 3. Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes
      if (file.size > maxSize) {
        console.log(`[POST /api/business/logo] File too large: ${file.size} bytes`);
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'File size must be under 2MB.', status: 422 } },
          { status: 422 }
        );
      }

      // 4. Convert file to base64 for Cloudinary upload
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUri = `data:${file.type};base64,${base64}`;

      // 5. Upload to Cloudinary
      console.log(`[POST /api/business/logo] Uploading to Cloudinary | uid: ${uid}`);
      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder:         'invoicepk/logos',
        transformation: [{ width: 400, height: 400, crop: 'limit' }],
      });

      const logoUrl = uploadResult.secure_url;
      console.log(`[POST /api/business/logo] Cloudinary upload success | url: ${logoUrl}`);

      // 6. Save URL to Business document
      const business = await getBusinessForUser(uid);

      if (!business) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Business profile not found.', status: 404 } },
          { status: 404 }
        );
      }

      business.logoUrl = logoUrl;
      await business.save();

      console.log(`[POST /api/business/logo] Logo saved | businessId: ${business._id} | status: 200`);

      return NextResponse.json({ data: { logoUrl } });

    } catch (err) {
      console.error('[POST /api/business/logo] ERROR:', err);
      return NextResponse.json(
        { error: { code: 'SERVER_ERROR', message: 'Something went wrong.', status: 500 } },
        { status: 500 }
      );
    }
  });
}





/* -------------------------------------------------------------------------- */
/*                               FUNCTIONALITY                                */
/* -------------------------------------------------------------------------- */

/**
 * Route: POST /api/business/logo
 *
 * Purpose:
 * - Allows an authenticated user to upload a business logo.
 *
 * Authentication:
 * - Protected via withAuth().
 * - Only authenticated users can access this endpoint.
 *
 * Workflow:
 * 1. Authenticate the request.
 * 2. Connect to MongoDB.
 * 3. Parse multipart/form-data.
 * 4. Retrieve the uploaded file from the "logo" field.
 * 5. Validate:
 *    - File exists.
 *    - File type is PNG/JPG.
 *    - File size does not exceed 2 MB.
 * 6. Convert the image into a Base64 Data URI.
 * 7. Upload the image to Cloudinary.
 * 8. Retrieve the authenticated user's Business profile.
 * 9. Save the Cloudinary secure URL as business.logoUrl.
 * 10. Return the uploaded logo URL.
 *
 * Success Response:
 * {
 *   data: {
 *     logoUrl: string
 *   }
 * }
 *
 * Possible Errors:
 * - 401 Unauthorized
 * - 404 Business profile not found
 * - 422 Invalid file / validation failure
 * - 500 Internal server error
 *
 * Storage:
 * - Image: Cloudinary
 * - URL: Business.logoUrl (MongoDB)
 */