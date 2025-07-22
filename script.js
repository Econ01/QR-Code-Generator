let currentType = "url";
let exportSize = 512;
let bulkQRCodes = [];
let qrSettings = {
    width: 250,
    height: 250,
    margin: 10,
    dotsOptions: { color: "#4361ee", type: "rounded" },
    backgroundOptions: { color: "#ffffff" },
    image: "",
    qrOptions: { errorCorrectionLevel: "M" },
    imageOptions: { crossOrigin: "anonymous", imageSize: 0.4, margin: 4 }
};

const qrWrapper = document.getElementById("qr-code");
const input = document.getElementById("qr-input");
const bulkInput = document.getElementById("qr-bulk-input");
const generateBtn = document.getElementById("generate-btn");
const downloadPngBtn = document.getElementById("download-png");
const downloadSvgBtn = document.getElementById("download-svg");
const clearInputBtn = document.getElementById("clear-input");
const chipGroup = document.getElementById("input-type");
const exportSizeSelect = document.getElementById("export-size");
const logoInput = document.getElementById("logo-input");
const removeLogoBtn = document.getElementById("remove-logo");
const errorCorrectionSelect = document.getElementById("error-correction");
const cornerStyleBtns = document.querySelectorAll(".btn-option");

// Theme handling
const htmlElement = document.documentElement;
const themeToggleBtn = document.getElementById('theme-toggle');

function applySystemTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    htmlElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    themeToggleBtn.innerHTML = prefersDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    themeToggleBtn.innerHTML = newTheme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySystemTheme);
applySystemTheme();

// Format data based on selected type
function formatData(data) {
    if (!data) return "https://example.com";
    switch (currentType) {
        case "url":
            return data.startsWith("http") ? data : `https://${data}`;
        case "email":
            return data.startsWith("mailto:") ? data : `mailto:${data}`;
        case "phone":
            return data.startsWith("tel:") ? data : `tel:${data}`;
        default:
            return data;
    }
}

// ---------- Bulk Mode Parsing ----------
function parseBulkInput(text) {
    const lines = text.split(/\n/);
    const urlRegex = /(https?:\/\/[^\s)]+)/;
    const nameUrlRegex = /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/;
    const parsed = [];

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        let match = nameUrlRegex.exec(line);
        if (match) {
            parsed.push({ name: match[1].trim(), url: match[2] });
        } else {
            let urlMatch = urlRegex.exec(line);
            if (urlMatch) {
                const url = urlMatch[0];
                const domain = new URL(url).hostname.replace('www.', '');
                parsed.push({ name: domain, url });
            }
        }
    });
    return parsed;
}

function createQRCodeInstance(data) {
    return new QRCodeStyling({ ...qrSettings, data });
}

async function createQRCodeBlob(data, format = "png", size = 512) {
    const tempQR = new QRCodeStyling({ ...qrSettings, data, width: size, height: size });
    return await tempQR.getRawData(format);
}

async function renderBulkQRCodes() {
    const inputText = bulkInput.value.trim();
    if (!inputText) return;

    const entries = parseBulkInput(inputText);
    if (!entries.length) {
        alert("No valid URLs found!");
        return;
    }

    qrWrapper.innerHTML = '';
    bulkQRCodes = [];

    for (let entry of entries) {
        const qr = createQRCodeInstance(entry.url);
        const qrItem = document.createElement('div');
        qrItem.className = 'qr-item';
        qr.append(qrItem);
        const nameLabel = document.createElement('p');
        nameLabel.textContent = entry.name;
        const wrapper = document.createElement('div');
        wrapper.appendChild(qrItem);
        wrapper.appendChild(nameLabel);
        qrWrapper.appendChild(wrapper);

        const blob = await createQRCodeBlob(entry.url);
        bulkQRCodes.push({ name: entry.name, url: entry.url, blob });
    }
}

function renderSingleQRCode() {
    const text = formatData(input.value.trim());
    if (!text) {
        input.focus();
        return;
    }
    qrWrapper.innerHTML = '';
    const qr = createQRCodeInstance(text);
    qr.append(qrWrapper);
}

// ---------- Generate Button ----------
generateBtn.addEventListener("click", () => {
    currentType === 'bulk' ? renderBulkQRCodes() : renderSingleQRCode();
});

// ---------- Download Buttons ----------
downloadPngBtn.addEventListener("click", async () => {
    currentType === 'bulk' ? await downloadBulk('png') : downloadSingle('png');
});

downloadSvgBtn.addEventListener("click", async () => {
    currentType === 'bulk' ? await downloadBulk('svg') : downloadSingle('svg');
});

function downloadSingle(extension) {
    const size = parseInt(exportSizeSelect.value, 10);
    createQRCodeInstance(formatData(input.value.trim())).download({ name: "qr-code", extension });
}

async function downloadBulk(format) {
    if (!bulkQRCodes.length) {
        alert("No QR codes generated for bulk download.");
        return;
    }
    const zip = new JSZip();
    for (let qr of bulkQRCodes) {
        const blob = await createQRCodeBlob(qr.url, format, parseInt(exportSizeSelect.value, 10));
        zip.file(`${qr.name}.${format}`, blob);
    }
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = "qr-codes.zip";
    a.click();
}

// ---------- Customization ----------
document.getElementById('color-foreground').addEventListener('input', (e) => {
    qrSettings.dotsOptions.color = e.target.value;
    if (currentType === 'bulk') renderBulkQRCodes();
    else renderSingleQRCode();
});

document.getElementById('color-background').addEventListener('input', (e) => {
    qrSettings.backgroundOptions.color = e.target.value;
    if (currentType === 'bulk') renderBulkQRCodes();
    else renderSingleQRCode();
});

cornerStyleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        cornerStyleBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        qrSettings.dotsOptions.type = btn.dataset.value;
        currentType === 'bulk' ? renderBulkQRCodes() : renderSingleQRCode();
    });
});

errorCorrectionSelect.addEventListener("change", () => {
    qrSettings.qrOptions.errorCorrectionLevel = errorCorrectionSelect.value;
    currentType === 'bulk' ? renderBulkQRCodes() : renderSingleQRCode();
});

// Logo Upload
logoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
        qrSettings.image = event.target.result;
        currentType === 'bulk' ? renderBulkQRCodes() : renderSingleQRCode();
    };
    reader.readAsDataURL(file);
});

// Remove Logo
removeLogoBtn.addEventListener("click", () => {
    qrSettings.image = "";
    logoInput.value = "";
    currentType === 'bulk' ? renderBulkQRCodes() : renderSingleQRCode();
});

// Clear input
clearInputBtn.addEventListener("click", () => {
    if (currentType === 'bulk') bulkInput.value = "";
    else input.value = "";
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
            phone: "+1234567890",
            bulk: "Enter multiple URLs, one per line"
        };

        if (currentType === "bulk") {
            input.style.display = "none";
            bulkInput.style.display = "block";
            bulkInput.placeholder = placeholder.bulk;
        } else {
            input.style.display = "block";
            bulkInput.style.display = "none";
            input.placeholder = placeholder[currentType];
        }
    }
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        document.body.classList.add("loaded");
    }, 300);
    renderSingleQRCode();
});
