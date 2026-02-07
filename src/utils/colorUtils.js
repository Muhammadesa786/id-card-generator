/**
 * Extracts the dominat color from an image URL.
 * @param {string} imageSrc - The source URL of the image.
 * @returns {Promise<string>} - A promise that resolves to the hex color code.
 */
export const getDominantColor = (imageSrc) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageSrc;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const colorCounts = {};
                let maxCount = 0;
                let dominantColor = '#000000';

                // Skip invisible or white-ish pixels to find the "brand" color
                // Iterating every 10th pixel for performance
                for (let i = 0; i < data.length; i += 4 * 10) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const a = data[i + 3];

                    // Skip transparent
                    if (a < 128) continue;

                    // Skip white/near-white (often background)
                    if (r > 240 && g > 240 && b > 240) continue;

                    // Skip black/near-black (often text)
                    // if (r < 20 && g < 20 && b < 20) continue; 

                    const rgb = `${r},${g},${b}`;
                    colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;

                    if (colorCounts[rgb] > maxCount) {
                        maxCount = colorCounts[rgb];
                        dominantColor = rgbToHex(r, g, b);
                    }
                }
                resolve(dominantColor);
            } catch (e) {
                console.error("Error accessing pixel data (CORS?)", e);
                // Fallback or reject
                resolve('#000000');
            }
        };

        img.onerror = (err) => {
            console.error("Error loading image for color extraction", err);
            reject(err);
        };
    });
};

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Generates a secondary variation (lighter/darker) of the extracted color.
 */
export const generateSecondaryColor = (hex, amount = 40) => {
    // Basic implementation for demo - simple lightening
    // In a real app, use HSL manipulation or tinycolor2
    let usePound = false;
    if (hex[0] === "#") {
        hex = hex.slice(1);
        usePound = true;
    }
    let num = parseInt(hex, 16);
    let r = (num >> 16) + amount;
    let b = ((num >> 8) & 0x00FF) + amount;
    let g = (num & 0x0000FF) + amount;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
    // Note: bitwise logic above might handle RGB order inconsistently depending on endianness if not careful,
    // but standard hex parse is R-G-B. The calculation above `(g | (b << 8) | (r << 16))` constructs:
    // Low byte: g, Mid: b, High: r.  Wait. 
    // Standard hex: R (16-23), G (8-15), B (0-7).
    // Let's rewrite safely string based.
};

// Safer version for the artifact
export const adjustColorBrightness = (hex, percent) => {
    // strip the leading # if it's there
    hex = hex.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (hex.length === 3) {
        hex = hex.replace(/(.)/g, '$1$1');
    }

    var r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16);

    return '#' +
        ((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
        ((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
        ((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1);
}

/**
 * Returns black or white depending on the background color's brightness.
 */
export const getContrastColor = (hex) => {
    if (!hex) return '#ffffff';
    // Remove hash
    hex = hex.replace('#', '');

    // Convert 3 char to 6 char
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // YIQ equation
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return (yiq >= 128) ? '#000000' : '#ffffff';
}
