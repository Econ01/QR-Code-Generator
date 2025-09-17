/* ===========================================
   BULK URL IMPROVEMENTS MODULE
   =========================================== */

class BulkURLManager {
    constructor() {
        this.initializeGuide();
        this.setupEventListeners();
    }

    initializeGuide() {
        this.createFormatGuide();
    }

    createFormatGuide() {
        const bulkInput = document.getElementById('qr-bulk-input');
        const inputGroup = bulkInput.closest('.input-group');
        
        // Create guide element
        const guide = document.createElement('div');
        guide.className = 'bulk-format-guide';
        guide.innerHTML = `
            <div class="guide-header">
                <i class="fas fa-info-circle"></i>
                <span>Supported formats:</span>
                <button class="guide-toggle" type="button">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            <div class="guide-content">
                <div class="format-examples">
                    <div class="format-item">
                        <strong>Plain URLs:</strong>
                        <code>https://example.com<br>www.google.com<br>github.com</code>
                    </div>
                    <div class="format-item">
                        <strong>Named URLs:</strong>
                        <code>[Google](https://google.com)<br>[My Site](https://mysite.com)</code>
                    </div>
                    <div class="format-item">
                        <strong>Mixed format:</strong>
                        <code>https://example.com<br>[Custom Name](https://site.com)<br>github.com/user</code>
                    </div>
                </div>
                <div class="guide-tips">
                    <i class="fas fa-lightbulb"></i>
                    <span>Enter one URL per line. URLs without http/https will be automatically prefixed.</span>
                </div>
            </div>
        `;

        // Insert guide after input group
        inputGroup.insertAdjacentElement('afterend', guide);

        // Setup guide toggle
        const toggleBtn = guide.querySelector('.guide-toggle');
        const content = guide.querySelector('.guide-content');
        
        toggleBtn.addEventListener('click', () => {
            const isExpanded = content.classList.contains('expanded');
            content.classList.toggle('expanded', !isExpanded);
            toggleBtn.querySelector('i').className = isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
        });

        // Add CSS for the guide
        this.addGuideStyles();
    }

    addGuideStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .bulk-format-guide {
                margin: 1rem 0;
                background: var(--background-elevated);
                border-radius: 15px;
                overflow: hidden;
                box-shadow: var(--shadow-soft);
                transition: all 0.3s ease;
            }

            .guide-header {
                padding: 0.8rem 1.2rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                color: var(--text);
                font-size: 14px;
                font-weight: 500;
            }

            .guide-header i.fa-info-circle {
                color: var(--primary);
            }

            .guide-toggle {
                margin-left: auto;
                background: none;
                border: none;
                color: var(--text);
                cursor: pointer;
                padding: 0.2rem;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .guide-toggle:hover {
                background: var(--background-raised);
            }

            .guide-content {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
            }

            .guide-content.expanded {
                max-height: 300px;
            }

            .format-examples {
                padding: 0 1.2rem;
                border-bottom: 1px solid var(--background-raised);
            }

            .format-item {
                margin-bottom: 1rem;
            }

            .format-item strong {
                display: block;
                color: var(--primary);
                font-size: 13px;
                margin-bottom: 0.3rem;
            }

            .format-item code {
                display: block;
                background: var(--background-raised);
                padding: 0.5rem;
                border-radius: 8px;
                font-size: 12px;
                color: var(--text);
                line-height: 1.4;
                font-family: 'Courier New', monospace;
            }

            .guide-tips {
                padding: 0.8rem 1.2rem;
                display: flex;
                align-items: flex-start;
                gap: 0.5rem;
                font-size: 12px;
                color: var(--text);
                opacity: 0.8;
            }

            .guide-tips i {
                color: var(--accent);
                margin-top: 0.1rem;
                flex-shrink: 0;
            }

            /* Mobile adjustments */
            @media screen and (max-width: 767px) {
                .bulk-format-guide {
                    margin: 0.8rem 0;
                    border-radius: 12px;
                }

                .guide-header {
                    padding: 0.7rem 1rem;
                    font-size: 13px;
                }

                .format-examples {
                    padding: 0 1rem;
                }

                .format-item code {
                    font-size: 11px;
                    padding: 0.4rem;
                }

                .guide-tips {
                    padding: 0.7rem 1rem;
                    font-size: 11px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        const bulkInput = document.getElementById('qr-bulk-input');
        
        // Real-time validation feedback
        bulkInput.addEventListener('input', (e) => {
            this.validateInput(e.target.value);
        });

        // Show/hide guide based on input focus
        bulkInput.addEventListener('focus', () => {
            this.showValidationHints();
        });
    }

    validateInput(text) {
        const guide = document.querySelector('.bulk-format-guide');
        if (!guide) return;

        const lines = text.split('\n').filter(line => line.trim());
        const parsed = this.parseImprovedBulkInput(text);
        
        // Update guide header with validation status
        const header = guide.querySelector('.guide-header span');
        if (lines.length === 0) {
            header.textContent = 'Supported formats:';
            guide.classList.remove('has-error', 'has-success');
        } else if (parsed.length === 0) {
            header.textContent = 'No valid URLs found - check format:';
            guide.classList.add('has-error');
            guide.classList.remove('has-success');
        } else if (parsed.length < lines.length) {
            header.textContent = `${parsed.length}/${lines.length} URLs valid - check format:`;
            guide.classList.add('has-error');
            guide.classList.remove('has-success');
        } else {
            header.textContent = `✓ ${parsed.length} URLs ready:`;
            guide.classList.add('has-success');
            guide.classList.remove('has-error');
        }

        // Add validation styles
        this.addValidationStyles();
    }

    addValidationStyles() {
        if (document.querySelector('#validation-styles')) return;

        const style = document.createElement('style');
        style.id = 'validation-styles';
        style.textContent = `
            .bulk-format-guide.has-error {
                border-left: 3px solid #e74c3c;
            }

            .bulk-format-guide.has-success {
                border-left: 3px solid #27ae60;
            }

            .bulk-format-guide.has-error .guide-header {
                color: #e74c3c;
            }

            .bulk-format-guide.has-success .guide-header {
                color: #27ae60;
            }
        `;
        document.head.appendChild(style);
    }

    showValidationHints() {
        const guide = document.querySelector('.bulk-format-guide');
        const content = guide?.querySelector('.guide-content');
        
        if (content && !content.classList.contains('expanded')) {
            const toggleBtn = guide.querySelector('.guide-toggle');
            content.classList.add('expanded');
            toggleBtn.querySelector('i').className = 'fas fa-chevron-up';
        }
    }

    // Improved parsing with better URL detection and domain extraction
    parseImprovedBulkInput(text) {
        const lines = text.split(/\n/);
        const parsed = [];
        
        // Enhanced regex patterns
        const namedUrlRegex = /\[(.*?)\]\s*\(\s*(.*?)\s*\)/;
        const urlRegex = /(https?:\/\/[^\s)]+|(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/;
        
        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            // Try named URL format first: [Name](URL)
            let match = namedUrlRegex.exec(line);
            if (match) {
                const name = match[1].trim();
                const url = this.normalizeUrl(match[2].trim());
                if (this.isValidUrl(url)) {
                    parsed.push({ name: name || this.extractDomain(url), url });
                }
                return;
            }

            // Try plain URL
            let urlMatch = urlRegex.exec(line);
            if (urlMatch) {
                const url = this.normalizeUrl(urlMatch[0]);
                if (this.isValidUrl(url)) {
                    const domain = this.extractDomain(url);
                    parsed.push({ name: domain, url });
                }
            }
        });
        
        return parsed;
    }

    normalizeUrl(url) {
        // Remove extra whitespace
        url = url.trim();
        
        // Add protocol if missing
        if (!url.match(/^https?:\/\//)) {
            // If it starts with www, add https
            if (url.startsWith('www.')) {
                url = 'https://' + url;
            } 
            // If it looks like a domain, add https
            else if (url.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/)) {
                url = 'https://' + url;
            }
            // If it has no protocol and no www, add https://www.
            else if (!url.includes('://')) {
                url = 'https://' + url;
            }
        }
        
        return url;
    }

    isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }

    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            let domain = urlObj.hostname;
            
            // Remove www prefix
            domain = domain.replace(/^www\./, '');
            
            // Limit length for display
            if (domain.length > 20) {
                domain = domain.substring(0, 17) + '...';
            }
            
            return domain;
        } catch {
            // Fallback: extract domain manually
            const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
            let domain = match ? match[1] : 'Unknown';
            
            if (domain.length > 20) {
                domain = domain.substring(0, 17) + '...';
            }
            
            return domain;
        }
    }
}

// Enhanced grid layout for better responsiveness
class ResponsiveQRGrid {
    constructor() {
        this.setupGridObserver();
    }

    setupGridObserver() {
        // Watch for QR grid changes and optimize layout
        const qrWrapper = document.getElementById('qr-code');
        if (!qrWrapper) return;

        const observer = new MutationObserver(() => {
            this.optimizeGridLayout();
        });

        observer.observe(qrWrapper, {
            childList: true,
            subtree: true
        });
    }

    optimizeGridLayout() {
        const qrWrapper = document.getElementById('qr-code');
        if (!qrWrapper.classList.contains('qr-grid')) return;

        const items = qrWrapper.querySelectorAll('.qr-item-wrapper');
        const containerWidth = qrWrapper.offsetWidth;
        
        // Calculate optimal item size based on container width
        let itemSize = 120;
        let gap = 8;
        
        if (window.innerWidth <= 767) {
            itemSize = Math.min(100, Math.floor((containerWidth - 32) / 3) - gap);
        } else if (window.innerWidth <= 1023) {
            itemSize = Math.min(110, Math.floor((containerWidth - 64) / 4) - gap);
        }

        // Apply calculated sizes
        items.forEach(wrapper => {
            const qrItem = wrapper.querySelector('.qr-item');
            if (qrItem) {
                qrItem.style.width = `${itemSize}px`;
                qrItem.style.height = `${itemSize}px`;
            }
        });
    }
}

// Integration with existing code
function initializeBulkImprovements() {
    // Only initialize when bulk mode is available
    if (document.getElementById('qr-bulk-input')) {
        new BulkURLManager();
        new ResponsiveQRGrid();
        
        // Override the existing parseBulkInput function
        if (typeof window.parseBulkInput !== 'undefined') {
            const bulkManager = new BulkURLManager();
            window.parseBulkInput = (text) => bulkManager.parseImprovedBulkInput(text);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBulkImprovements);
} else {
    initializeBulkImprovements();
}

// Export for potential external use
window.BulkURLManager = BulkURLManager;
window.ResponsiveQRGrid = ResponsiveQRGrid;