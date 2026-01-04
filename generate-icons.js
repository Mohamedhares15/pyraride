const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, 'public', 'logo-new.jpg');
const outputDir = path.join(__dirname, 'public', 'icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
    console.log('Generating PWA icons from:', inputPath);

    for (const size of sizes) {
        const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
        await sharp(inputPath)
            .resize(size, size, { fit: 'cover' })
            .png()
            .toFile(outputPath);
        console.log(`Generated: icon-${size}x${size}.png`);
    }

    // Generate maskable icon (with 10% padding for safe area)
    const maskableSize = 512;
    const padding = Math.floor(maskableSize * 0.1);
    const innerSize = maskableSize - (padding * 2);

    await sharp(inputPath)
        .resize(innerSize, innerSize, { fit: 'cover' })
        .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 252, g: 251, b: 248, alpha: 1 } // Match background_color
        })
        .png()
        .toFile(path.join(outputDir, 'maskable-icon-512x512.png'));
    console.log('Generated: maskable-icon-512x512.png');

    // Generate Apple touch icon (180x180)
    await sharp(inputPath)
        .resize(180, 180, { fit: 'cover' })
        .png()
        .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));
    console.log('Generated: apple-touch-icon.png');

    // Generate favicon (32x32)
    await sharp(inputPath)
        .resize(32, 32, { fit: 'cover' })
        .png()
        .toFile(path.join(__dirname, 'public', 'favicon.png'));
    console.log('Generated: favicon.png');

    console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
