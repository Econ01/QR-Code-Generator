let currentType = "url";
let exportSize = 512;

const qrCode = new QRCodeStyling({
    width: 250,
    height: 250,
    data: "https://example.com",
    margin: 10,
    dotsOptions: {
        color: "#4361ee",
        type: "rounded"
    },
    backgroundOptions: {
        color: "#ffffff"
    },
    imageOptions: {
        crossOrigin: "anonymous",
        imageSize: 0.4,
        margin: 4
    }
});

const qrWrapper = document.getElementById("qr-code");
const input = document.getElementById("qr-input");
const generateBtn = document.getElementById("generate-btn");
const downloadPngBtn = document.getElementById("download-png");
const downloadSvgBtn = document.getElementById("download-svg");
const clearInputBtn = document.getElementById("clear-input");
const foregroundInput = document.getElementById("color-foreground");
const backgroundInput = document.getElementById("color-background");
const chipGroup = document.getElementById("input-type");
const exportSizeSelect = document.getElementById("export-size");
const logoInput = document.getElementById("logo-input");
const removeLogoBtn = document.getElementById("remove-logo");
const errorCorrectionSelect = document.getElementById("error-correction");
const cornerStyleBtns = document.querySelectorAll(".btn-option");

qrCode.append(qrWrapper);

// Format data based on selected type
function formatData(data) {
    if (!data) return "https://example.com";

    switch (currentType) {
        case "url":
            if (!data.startsWith("http://") && !data.startsWith("https://")) {
                return `https://${data}`;
            }
            return data;
        case "email":
            return data.startsWith("mailto:") ? data : `mailto:${data}`;
        case "phone":
            return data.startsWith("tel:") ? data : `tel:${data}`;
        case "text":
        default:
            return data;
    }
}

// Upload Logo
logoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        qrCode.update({
            image: event.target.result
        });
    };
    reader.readAsDataURL(file);
});

// Remove Logo
removeLogoBtn.addEventListener("click", () => {
    qrCode.update({ image: "" });
    logoInput.value = "";
});

// Generate QR
generateBtn.addEventListener("click", () => {
    const text = formatData(input.value.trim());
    
    if (!text) {
        input.focus();
        return;
    }
    
    qrWrapper.classList.add("qr-pulse");
    
    setTimeout(() => {
        qrCode.update({ data: text });
        qrWrapper.classList.remove("qr-pulse");
        
        // Hide placeholder
        const placeholder = document.querySelector(".placeholder");
        if (placeholder) placeholder.style.display = "none";
    }, 300);
});

// Download buttons
downloadPngBtn.addEventListener("click", () => {
    const size = parseInt(exportSizeSelect.value, 10);
    qrCode.update({ width: size, height: size });
    qrCode.download({ name: "qr-code", extension: "png" });
    qrCode.update({ width: 250, height: 250 });
});

downloadSvgBtn.addEventListener("click", () => {
    const size = parseInt(exportSizeSelect.value, 10);
    qrCode.update({ width: size, height: size });
    qrCode.download({ name: "qr-code", extension: "svg" });
    qrCode.update({ width: 250, height: 250 });
});

// Update colors
foregroundInput.addEventListener("input", () => {
    qrCode.update({ dotsOptions: { color: foregroundInput.value } });
});

backgroundInput.addEventListener("input", () => {
    qrCode.update({ backgroundOptions: { color: backgroundInput.value } });
});

// Chip selection
chipGroup.addEventListener("click", (e) => {
    if (e.target.closest(".chip")) {
        const chip = e.target.closest(".chip");
        document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        currentType = chip.dataset.type;

        const placeholder = {
            url: "https://example.com",
            text: "Enter your text here",
            email: "user@example.com",
            phone: "+1234567890"
        };
        input.placeholder = placeholder[currentType];
    }
});

// Corner style selection
cornerStyleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        cornerStyleBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        qrCode.update({ dotsOptions: { type: btn.dataset.value } });
    });
});

// Clear input
clearInputBtn.addEventListener("click", () => {
    input.value = "";
    input.focus();
});

// Error correction
errorCorrectionSelect.addEventListener("change", () => {
    qrCode.update({
        qrOptions: {
            errorCorrectionLevel: errorCorrectionSelect.value
        }
    });
});

// Initialize with animation
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        document.body.classList.add("loaded");
    }, 300);
});