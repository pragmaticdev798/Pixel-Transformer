const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imageInput = document.getElementById("imageInput");
const processingIndicator = document.getElementById("processingIndicator");
let worker;
let originalImageData = null;
let activeFilter = null;

if (typeof(worker) === "undefined") {
    worker = new Worker("worker.js");
}
imageInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            let width, height;
            const maxDimension = 600;
            
            if (img.width > img.height) {
                width = Math.min(img.width, maxDimension);
                height = (img.height / img.width) * width;
            } else {
                height = Math.min(img.height, maxDimension);
                width = (img.width / img.height) * height;
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            resetActiveButton();
            activeFilter = null;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

function applyFilter(filterType) {
    if (!originalImageData) return;
    updateActiveButton(filterType);
    activeFilter = filterType;
    processingIndicator.style.display = 'block';
    
    if (filterType === 'original') {
        ctx.putImageData(originalImageData, 0, 0);
        processingIndicator.style.display = 'none';
        return;
    }
    const imageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data), 
        originalImageData.width, 
        originalImageData.height
    );
    
    worker.postMessage({ filter: filterType, imageData: imageData });
}

function updateActiveButton(filterType) {
    resetActiveButton();
    document.getElementById(filterType + "Btn")?.classList.add("active");
}

function resetActiveButton() {
    document.querySelectorAll(".button-container button").forEach(btn => {
        btn.classList.remove("active");
    });
}

worker.onmessage = function (event) {
    ctx.putImageData(event.data, 0, 0);
    processingIndicator.style.display = 'none';
};