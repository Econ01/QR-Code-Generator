let currentType = "url"; // Default input type
let exportSize = 512;    // Default export size

const qrCode = new QRCodeStyling({
    width: 200,  // Fixed preview size
    height: 200,
    data: "https://example.com",
    dotsOptions: {
        color: "#000",
        type: "rounded"
    },
    backgroundOptions: {
        color: "#ffffff"
    }
});

const qrWrapper = document.getElementById("qr-code");
const input = document.getElementById("qr-input");
const generateBtn = document.getElementById("generate-btn");
const downloadPngBtn = document.getElementById("download-png");
const downloadSvgBtn = document.getElementById("download-svg");

const foregroundInput = document.getElementById("color-foreground");
const backgroundInput = document.getElementById("color-background");
const cornerStyle = document.getElementById("corner-style");
const chipGroup = document.getElementById("input-type");

const exportSizeSelect = document.getElementById("export-size");
const customSizeLabel = document.getElementById("custom-size-label");
const customSizeInput = document.getElementById("custom-size");

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

// Generate QR
generateBtn.addEventListener("click", () => {
    const text = formatData(input.value.trim());
    qrCode.update({ data: text });
});

// Download buttons
downloadPngBtn.addEventListener("click", () => {
    const size = exportSizeSelect.value === "custom" ? customSizeInput.value : exportSize;
    qrCode.update({ width: parseInt(size), height: parseInt(size) });
    qrCode.download({ name: "qr-code", extension: "png" });
    qrCode.update({ width: 200, height: 200 }); // Reset preview size
});

downloadSvgBtn.addEventListener("click", () => {
    const size = exportSizeSelect.value === "custom" ? customSizeInput.value : exportSize;
    qrCode.update({ width: parseInt(size), height: parseInt(size) });
    qrCode.download({ name: "qr-code", extension: "svg" });
    qrCode.update({ width: 200, height: 200 }); // Reset preview size
});

// Update colors
foregroundInput.addEventListener("input", () => {
    qrCode.update({ dotsOptions: { color: foregroundInput.value } });
});

backgroundInput.addEventListener("input", () => {
    qrCode.update({ backgroundOptions: { color: backgroundInput.value } });
});

// Update corner style
cornerStyle.addEventListener("change", () => {
    qrCode.update({ dotsOptions: { type: cornerStyle.value } });
});

// Chip selection
chipGroup.addEventListener("click", (e) => {
    if (e.target.classList.contains("chip")) {
        document.querySelectorAll(".chip").forEach(chip => chip.classList.remove("active"));
        e.target.classList.add("active");
        currentType = e.target.dataset.type;

        const placeholder = {
            url: "Enter URL",
            text: "Enter Text",
            email: "Enter Email Address",
            phone: "Enter Phone Number"
        };
        input.placeholder = placeholder[currentType];
    }
});

// Export size selection
exportSizeSelect.addEventListener("change", () => {
    if (exportSizeSelect.value === "custom") {
        customSizeLabel.style.display = "flex";
    } else {
        customSizeLabel.style.display = "none";
        exportSize = parseInt(exportSizeSelect.value, 10);
    }
});
