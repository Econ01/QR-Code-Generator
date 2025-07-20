const qrCode = new QRCodeStyling({
    width: 200,
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

qrCode.append(qrWrapper);

generateBtn.addEventListener("click", () => {
    const text = input.value.trim();
    qrCode.update({
        data: text || "https://example.com"
    });
});

downloadPngBtn.addEventListener("click", () => {
    qrCode.download({ name: "qr-code", extension: "png" });
});

downloadSvgBtn.addEventListener("click", () => {
    qrCode.download({ name: "qr-code", extension: "svg" });
});
