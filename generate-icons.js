const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, 'public', 'logo-final.jpg');
const outputDir = path.join(__dirname, 'public', 'icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
    console.log('Generating PWA icons from:', inputPath);

    // Standard Icons (Square with background)
    // Since input is JPG, we just resize it.
    // We'll add a small padding to ensure it looks good in a square.
    for (const size of sizes) {
        const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

        await sharp({
            create: {
                width: size,
                height: size,
                channels: 4,
                background: { r: 18, g: 18, b: 18, alpha: 1 } // #121212 background
            }
        })
            .composite([{
                input: await sharp(inputPath)
                    .resize(size, size, { fit: 'cover' }) // Use cover to fill the square if it's a full image
                    .toBuffer()
            }])
            .png()
            .toFile(outputPath);

        console.log(`Generated: icon-${size}x${size}.png`);
    }

    // Generate maskable icon (with 20% padding for safe area)
    // Maskable icons should be "safe" within the center 60% circle
    const maskableSize = 512;
    const padding = Math.floor(maskableSize * 0.2); // 20% padding
    const innerSize = maskableSize - (padding * 2);

    await sharp({
        create: {
            width: maskableSize,
            height: maskableSize,
            channels: 4,
            background: { r: 18, g: 18, b: 18, alpha: 1 } // #121212 background
        }
    })
        .composite([{
            input: await sharp(inputPath)
                .resize(innerSize, innerSize, { fit: 'contain', background: { r: 18, g: 18, b: 18, alpha: 1 } })
                .toBuffer()
        }])
        .png()
        .toFile(path.join(outputDir, 'maskable-icon-512x512.png'));
    console.log('Generated: maskable-icon-512x512.png');

    // Generate Apple touch icon (180x180) - No transparency allowed by Apple usually
    await sharp({
        create: {
            width: 180,
            height: 180,
            channels: 4,
            background: { r: 18, g: 18, b: 18, alpha: 1 }
        }
    })
        .composite([{
            input: await sharp(inputPath)
                .resize(180, 180, { fit: 'cover' })
                .toBuffer()
        }])
        .png()
        .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));
    console.log('Generated: apple-touch-icon.png');

    console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
