import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
const MAX_IMAGES = 5;

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const files = formData.getAll('images') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No images provided' }, { status: 400 });
        }

        if (files.length > MAX_IMAGES) {
            return NextResponse.json(
                { error: `Maximum ${MAX_IMAGES} images allowed` },
                { status: 400 }
            );
        }

        const uploadedUrls: string[] = [];

        for (const file of files) {
            // Validate file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WebP, HEIC` },
                    { status: 400 }
                );
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max 10MB)` },
                    { status: 400 }
                );
            }

            // Convert file to buffer
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

            // Upload to Cloudinary
            const uploadResult = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload(
                    base64Image,
                    {
                        folder: `pyraride/reviews/${session.user.id}`,
                        resource_type: 'image',
                        format: 'auto', // Auto-convert to best format (WebP for modern browsers)
                        quality: 'auto:good', // Auto-optimize quality
                        fetch_format: 'auto', // Auto-select best format
                        transformation: [
                            { width: 1200, height: 1200, crop: 'limit' }, // Limit max dimensions
                            { quality: 'auto:good' }, // Optimize quality
                            { fetch_format: 'auto' }, // Auto format
                        ],
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
            });

            uploadedUrls.push(uploadResult.secure_url);
        }

        return NextResponse.json(
            {
                success: true,
                urls: uploadedUrls,
                message: `${uploadedUrls.length} image(s) uploaded successfully`,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload images' },
            { status: 500 }
        );
    }
}
