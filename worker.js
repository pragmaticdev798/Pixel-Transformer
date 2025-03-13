onmessage = function (event) {
    const { filter, imageData } = event.data;
    let processedData = processImage(filter, imageData);
    postMessage(processedData);
};
function processImage(filter, imageData) {
    const data = imageData.data;
    switch (filter) {
        case "grayscale":
            for (let i = 0; i < data.length; i += 4) {
                let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = data[i + 1] = data[i + 2] = avg;
            }
            break;
        case "edge-detect":
            let width = imageData.width;
            let height = imageData.height;
            let newData = new Uint8ClampedArray(data.length);
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    let i = (y * width + x) * 4;

                    let sobelX = (-data[i - 4] + data[i + 4]) +
                                 (-2 * data[i - width * 4] + 2 * data[i + width * 4]) +
                                 (-data[i - width * 4 - 4] + data[i + width * 4 + 4]);

                    let sobelY = (-data[i - width * 4 - 4] + data[i - width * 4 + 4]) +
                                 (-2 * data[i - 4] + 2 * data[i + 4]) +
                                 (-data[i + width * 4 - 4] + data[i + width * 4 + 4]);

                    let magnitude = Math.sqrt(sobelX ** 2 + sobelY ** 2);
                    newData[i] = newData[i + 1] = newData[i + 2] = magnitude;
                    newData[i + 3] = 255; 
                }
            }
            imageData.data.set(newData);
            break;
        case "pixelate":
            let pixelSize = 10;
            for (let y = 0; y < imageData.height; y += pixelSize) {
                for (let x = 0; x < imageData.width; x += pixelSize) {
                    let i = (y * imageData.width + x) * 4;
                    let red = data[i], green = data[i + 1], blue = data[i + 2];

                    for (let dy = 0; dy < pixelSize && (y + dy) < imageData.height; dy++) {
                        for (let dx = 0; dx < pixelSize && (x + dx) < imageData.width; dx++) {
                            let pixelIndex = ((y + dy) * imageData.width + (x + dx)) * 4;
                            data[pixelIndex] = red;
                            data[pixelIndex + 1] = green;
                            data[pixelIndex + 2] = blue;
                            data[pixelIndex + 3] = 255;
                        }
                    }
                }
            }
            break;
        default:
            console.warn("Invalid filter:", filter);
    }
    return imageData;
}