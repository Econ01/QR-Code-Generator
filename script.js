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
            const cleanPhone = data.replace(/[^0-9+]/g, '');
            return `tel:${cleanPhone}`;
        case "text":
            return data;
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

// ------------------- Parsing -------------------
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

// ------------------- Rendering -------------------
function renderSingleQRCode() {
    const text = formatData(input.value.trim());
    if (!text) return input.focus();

    if (!singleQR) {
        qrWrapper.innerHTML = '';
        const container = document.createElement('div');
        container.classList.add('qr-item');
        singleQR = createQRCodeInstance(text, 250);
        singleQR.append(container);
        qrWrapper.appendChild(container);
    } else {
        animateUpdate(qrWrapper.querySelector('.qr-item'), () => {
            singleQR.update({ data: text, width: 250, height: 250, ...qrSettings });
        });
    }

    updateQRWrapperMode();
}

async function renderBulkQRCodes() {
    const entries = parseBulkInput(bulkInput.value.trim());
    if (!entries.length) return alert("No valid URLs found!");

    const currentCount = bulkQRInstances.length;
    const newCount = entries.length;

    if (newCount !== currentCount) {
        qrWrapper.innerHTML = '';
        bulkQRInstances = [];

        for (let entry of entries) {
            // Generate at slightly higher res for display
            const qr = createQRCodeInstance(entry.url, 200); 
            const qrItem = document.createElement('div');
            qrItem.classList.add('qr-item');
            qr.append(qrItem);

            const nameLabel = document.createElement('p');
            nameLabel.textContent = entry.name;
            nameLabel.title = entry.url; // Tooltip for full URL

            const wrapper = document.createElement('div');
            wrapper.classList.add('qr-item-wrapper');
            wrapper.appendChild(qrItem);
            wrapper.appendChild(nameLabel);

            qrWrapper.appendChild(wrapper);
            bulkQRInstances.push({ qr, url: entry.url, name: entry.name, container: qrItem });
        }
    } else {
        // Update existing QR codes
        requestAnimationFrame(() => {
            entries.forEach((entry, i) => {
                animateUpdate(qrWrapper.children[i], () => {
                    bulkQRInstances[i].qr.update({
                        data: entry.url,
                        width: 200,
                        height: 200,
                        ...qrSettings
                    });
                    bulkQRInstances[i].url = entry.url;
                    bulkQRInstances[i].name = entry.name;
                    // Update label text if needed
                    qrWrapper.children[i].querySelector('p').textContent = entry.name;
                });
            });
        });
    }

    updateQRWrapperMode();
}

function updateAllQRCodes() {
    requestAnimationFrame(() => {
        if (currentType === 'bulk') {
            bulkQRInstances.forEach(instance => {
                instance.qr.update({ width: 200, height: 200, ...qrSettings });
            });
        } else if (singleQR) {
            singleQR.update({ width: 250, height: 250, ...qrSettings });
        }
    });
}

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
    singleQR.update({ width: 250, height: 250 });
}

async function downloadBulk(format) {
    if (!bulkQRInstances.length) return alert("No QR codes generated for bulk download.");

    const zip = new JSZip();
    for (let i = 0; i < bulkQRInstances.length; i++) {
        const instance = bulkQRInstances[i];
        const blob = await createQRCodeBlob(instance.url, format, parseInt(exportSizeSelect.value, 10));
        
        // Use parsed name if available, fallback to domain, then generic
        let safeName = (instance.name || instance.url.replace(/https?:\/\//, '').split('/')[0] || 'qr-code')
            .replace(/[^a-z0-9\-_]/gi, '_'); // Sanitize filename
            
        const filename = `${safeName}-${i + 1}.${format}`;
        zip.file(filename, blob);
    }
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = "qr-codes.zip";
    a.click();
}

// ------------------- Customization -------------------
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedUpdate = debounce(() => updateAllQRCodes(), 200);

document.getElementById('color-foreground').addEventListener('input', (e) => {
    qrSettings.dotsOptions.color = e.target.value;
    debouncedUpdate();
});

document.getElementById('color-background').addEventListener('input', (e) => {
    qrSettings.backgroundOptions.color = e.target.value;
    debouncedUpdate();
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

        // Clear inputs on switch to prevent invalid format data
        input.value = "";
        bulkInput.value = "";

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

// ------------------- Init -------------------
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        document.body.classList.add("loaded");
    }, 300);
    renderSingleQRCode();
});
