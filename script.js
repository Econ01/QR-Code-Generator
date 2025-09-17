let currentType = "url";
let exportSize = 512;
let bulkQRCodes = [];
let singleQR = null;
let bulkQRInstances = [];

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

// ------------------- Theme Handling -------------------
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

// ------------------- Helpers -------------------
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

function createQRCodeInstance(data, size = qrSettings.width) {
    return new QRCodeStyling({ ...qrSettings, data, width: size, height: size });
}

async function createQRCodeBlob(data, format = "png", size = 512) {
    const tempQR = new QRCodeStyling({ ...qrSettings, data, width: size, height: size });
    return await tempQR.getRawData(format);
}

function updateQRWrapperMode() {
    const count = qrWrapper.querySelectorAll('.qr-item').length;
    if (count > 1) {
        qrWrapper.classList.add('qr-grid');
    } else {
        qrWrapper.classList.remove('qr-grid');
    }
}

function animateUpdate(item, updateFn) {
    item.classList.add('updating');
    setTimeout(() => {
        updateFn();
        item.classList.remove('updating');
    }, 200);
}

// ------------------- Responsive QR Sizing (Module Integration) -------------------
function getResponsiveQRSize(isBulk = false) {
    const containerWidth = qrWrapper.offsetWidth;
    const screenWidth = window.innerWidth;
    
    if (isBulk) {
        if (screenWidth <= 767) {
            return Math.min(100, Math.floor((containerWidth - 32) / 3) - 8);
        } else if (screenWidth <= 1023) {
            return Math.min(110, Math.floor((containerWidth - 64) / 4) - 8);
        } else {
            return 120;
        }
    } else {
        if (screenWidth <= 767) {
            return Math.min(200, containerWidth - 32);
        } else if (screenWidth <= 1023) {
            return Math.min(220, containerWidth - 64);
        } else {
            return 250;
        }
    }
}

// ------------------- Parsing (Module Integration) -------------------
function parseBulkInput(text) {
    // Use enhanced parsing from bulk-url.js module if available
    if (window.BulkURLManager) {
        const manager = new window.BulkURLManager();
        return manager.parseImprovedBulkInput(text);
    }
    
    // Fallback parsing
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

// ------------------- Rendering -------------------
function renderSingleQRCode() {
    const text = formatData(input.value.trim());
    if (!text) return input.focus();

    const qrSize = getResponsiveQRSize(false);

    if (!singleQR) {
        qrWrapper.innerHTML = '';
        const container = document.createElement('div');
        container.classList.add('qr-item');
        singleQR = createQRCodeInstance(text, qrSize);
        singleQR.append(container);
        qrWrapper.appendChild(container);
    } else {
        animateUpdate(qrWrapper.querySelector('.qr-item'), () => {
            singleQR.update({ data: text, width: qrSize, height: qrSize, ...qrSettings });
        });
    }

    updateQRWrapperMode();
}

async function renderBulkQRCodes() {
    const entries = parseBulkInput(bulkInput.value.trim());
    if (!entries.length) return alert("No valid URLs found!");

    const qrSize = getResponsiveQRSize(true);
    const currentCount = bulkQRInstances.length;
    const newCount = entries.length;

    if (newCount !== currentCount) {
        qrWrapper.innerHTML = '';
        bulkQRInstances = [];

        for (let entry of entries) {
            const qr = createQRCodeInstance(entry.url, qrSize);
            const qrItem = document.createElement('div');
            qrItem.classList.add('qr-item');
            qrItem.style.width = `${qrSize}px`;
            qrItem.style.height = `${qrSize}px`;
            qr.append(qrItem);

            const nameLabel = document.createElement('p');
            nameLabel.textContent = entry.name;

            const wrapper = document.createElement('div');
            wrapper.classList.add('qr-item-wrapper');
            wrapper.appendChild(qrItem);
            wrapper.appendChild(nameLabel);

            qrWrapper.appendChild(wrapper);
            bulkQRInstances.push({ qr, url: entry.url, container: qrItem });
        }
    } else {
        requestAnimationFrame(() => {
            entries.forEach((entry, i) => {
                animateUpdate(qrWrapper.children[i], () => {
                    bulkQRInstances[i].qr.update({
                        data: entry.url,
                        width: qrSize,
                        height: qrSize,
                        ...qrSettings
                    });
                    bulkQRInstances[i].url = entry.url;
                    
                    const qrItem = bulkQRInstances[i].container;
                    qrItem.style.width = `${qrSize}px`;
                    qrItem.style.height = `${qrSize}px`;
                });
            });
        });
    }

    updateQRWrapperMode();
}

function updateAllQRCodes() {
    requestAnimationFrame(() => {
        if (currentType === 'bulk') {
            const qrSize = getResponsiveQRSize(true);
            bulkQRInstances.forEach(instance => {
                instance.qr.update({ width: qrSize, height: qrSize, ...qrSettings });
                instance.container.style.width = `${qrSize}px`;
                instance.container.style.height = `${qrSize}px`;
            });
        } else if (singleQR) {
            const qrSize = getResponsiveQRSize(false);
            singleQR.update({ width: qrSize, height: qrSize, ...qrSettings });
        }
    });
}

// ------------------- Responsive Window Handling -------------------
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateAllQRCodes();
    }, 250);
});

// ------------------- Generate -------------------
generateBtn.addEventListener("click", () => {
    currentType === 'bulk' ? renderBulkQRCodes() : renderSingleQRCode();
});

// ------------------- Download -------------------
downloadPngBtn.addEventListener("click", async () => {
    currentType === 'bulk' ? await downloadBulk('png') : downloadSingle('png');
});

downloadSvgBtn.addEventListener("click", async () => {
    currentType === 'bulk' ? await downloadBulk('svg') : downloadSingle('svg');
});

function downloadSingle(extension) {
    const size = parseInt(exportSizeSelect.value, 10);
    singleQR.update({ width: size, height: size });
    singleQR.download({ name: "qr-code", extension });
    
    const currentSize = getResponsiveQRSize(false);
    singleQR.update({ width: currentSize, height: currentSize });
}

async function downloadBulk(format) {
    if (!bulkQRInstances.length) return alert("No QR codes generated for bulk download.");

    const zip = new JSZip();
    const size = parseInt(exportSizeSelect.value, 10);
    
    for (let instance of bulkQRInstances) {
        const blob = await createQRCodeBlob(instance.url, format, size);
        const filename = instance.url.replace(/https?:\/\//, '').split('/')[0];
        zip.file(`${filename}.${format}`, blob);
    }
    
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = "qr-codes.zip";
    a.click();
}

// ------------------- Customization -------------------
document.getElementById('color-foreground').addEventListener('input', (e) => {
    qrSettings.dotsOptions.color = e.target.value;
    updateAllQRCodes();
});

document.getElementById('color-background').addEventListener('input', (e) => {
    qrSettings.backgroundOptions.color = e.target.value;
    updateAllQRCodes();
});

cornerStyleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        cornerStyleBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        qrSettings.dotsOptions.type = btn.dataset.value;
        updateAllQRCodes();
    });
});

errorCorrectionSelect.addEventListener("change", () => {
    qrSettings.qrOptions.errorCorrectionLevel = errorCorrectionSelect.value;
    updateAllQRCodes();
});

// Logo Upload
logoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
        qrSettings.image = event.target.result;
        updateAllQRCodes();
    };
    reader.readAsDataURL(file);
});

// Remove Logo
removeLogoBtn.addEventListener("click", () => {
    qrSettings.image = "";
    logoInput.value = "";
    updateAllQRCodes();
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
            
            // Show bulk guide if available
            const guide = document.querySelector('.bulk-format-guide');
            if (guide) guide.style.display = 'block';
        } else {
            input.style.display = "block";
            bulkInput.style.display = "none";
            input.placeholder = placeholder[currentType];
            
            // Hide bulk guide
            const guide = document.querySelector('.bulk-format-guide');
            if (guide) guide.style.display = 'none';
        }
        
        // Clear existing QR codes when switching types
        qrWrapper.innerHTML = '<div class="placeholder"><i class="fas fa-qrcode"></i><p>Your QR code will appear here</p></div>';
        singleQR = null;
        bulkQRInstances = [];
        updateQRWrapperMode();
    }
});

// ------------------- Init -------------------
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        document.body.classList.add("loaded");
    }, 300);
    
    renderSingleQRCode();
    
    // Hide bulk guide initially
    setTimeout(() => {
        const guide = document.querySelector('.bulk-format-guide');
        if (guide && currentType !== 'bulk') {
            guide.style.display = 'none';
        }
    }, 100);
});