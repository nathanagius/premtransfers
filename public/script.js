// Premier League Transfers Website JavaScript

class TransfersApp {
    constructor() {
        this.data = null;
        this.currentTab = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTransfers();
        
        // Auto-refresh every 5 minutes
        setInterval(() => {
            this.loadTransfers();
        }, 5 * 60 * 1000);
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadTransfers();
        });

        // Tab navigation
        document.querySelectorAll('[data-bs-toggle="pill"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (event) => {
                const target = event.target.getAttribute('data-bs-target');
                this.currentTab = target.replace('#', '').replace('-section', '').replace('-transfers', '');
                if (this.currentTab === 'all') this.currentTab = 'all';
                this.renderCurrentTab();
            });
        });
    }

    async loadTransfers() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/transfers');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.data = await response.json();
            this.updateLastUpdated();
            this.renderCurrentTab();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading transfers:', error);
            this.showError();
        }
    }

    renderCurrentTab() {
        if (!this.data) return;

        switch (this.currentTab) {
            case 'all':
                this.renderAllTransfers();
                break;
            case 'bbc':
                this.renderTransfers(this.data.bbc, 'bbc-transfers-content');
                break;
            case 'sky':
                this.renderTransfers(this.data.sky, 'sky-transfers-content');
                break;
            case 'twitter':
                this.renderTransfers(this.data.twitter, 'twitter-transfers-content');
                break;
        }
    }

    renderAllTransfers() {
        const container = document.getElementById('all-transfers-content');
        const allTransfers = [
            ...this.data.bbc.map(t => ({ ...t, sourceType: 'bbc' })),
            ...this.data.sky.map(t => ({ ...t, sourceType: 'sky' })),
            ...this.data.twitter.map(t => ({ ...t, sourceType: 'twitter' }))
        ].sort((a, b) => b.timestamp - a.timestamp);

        this.renderTransfers(allTransfers, 'all-transfers-content');
    }

    renderTransfers(transfers, containerId) {
        const container = document.getElementById(containerId);
        
        if (!transfers || transfers.length === 0) {
            container.innerHTML = this.getNoDataMessage();
            return;
        }

        const transfersHtml = transfers.map(transfer => this.createTransferCard(transfer)).join('');
        container.innerHTML = transfersHtml;
    }

    createTransferCard(transfer) {
        const sourceType = transfer.sourceType || this.getSourceType(transfer.source);
        const timeAgo = this.formatTimeAgo(transfer.publishedAt);
        const socialMetrics = transfer.metrics ? this.createSocialMetrics(transfer.metrics) : '';

        return `
            <div class="card transfer-card ${sourceType}-source">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="source-badge ${sourceType}">${transfer.source}</span>
                        <small class="text-muted">${timeAgo}</small>
                    </div>
                    
                    <h5 class="transfer-title">
                        <a href="${transfer.url}" target="_blank" rel="noopener noreferrer" class="text-decoration-none">
                            ${this.escapeHtml(transfer.title)}
                        </a>
                    </h5>
                    
                    ${transfer.description ? `
                        <p class="transfer-description mb-2">
                            ${this.escapeHtml(transfer.description)}
                        </p>
                    ` : ''}
                    
                    ${socialMetrics}
                    
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <small class="transfer-meta">
                            <i class="fas fa-external-link-alt me-1"></i>
                            <span class="transfer-source">${transfer.source}</span>
                        </small>
                        <small class="transfer-time text-muted">
                            <i class="fas fa-clock me-1"></i>
                            ${this.formatDate(transfer.publishedAt)}
                        </small>
                    </div>
                </div>
            </div>
        `;
    }

    createSocialMetrics(metrics) {
        if (!metrics) return '';

        return `
            <div class="social-metrics">
                ${metrics.retweet_count ? `
                    <div class="social-metric">
                        <i class="fas fa-retweet"></i>
                        <span>${this.formatNumber(metrics.retweet_count)}</span>
                    </div>
                ` : ''}
                ${metrics.like_count ? `
                    <div class="social-metric">
                        <i class="fas fa-heart"></i>
                        <span>${this.formatNumber(metrics.like_count)}</span>
                    </div>
                ` : ''}
                ${metrics.reply_count ? `
                    <div class="social-metric">
                        <i class="fas fa-reply"></i>
                        <span>${this.formatNumber(metrics.reply_count)}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    getSourceType(source) {
        if (source.toLowerCase().includes('bbc')) return 'bbc';
        if (source.toLowerCase().includes('sky')) return 'sky';
        if (source.toLowerCase().includes('twitter') || source.startsWith('@')) return 'twitter';
        return 'other';
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatNumber(num) {
        if (num >= 1000000) return Math.floor(num / 100000) / 10 + 'M';
        if (num >= 1000) return Math.floor(num / 100) / 10 + 'K';
        return num.toString();
    }

    updateLastUpdated() {
        const lastUpdatedElement = document.getElementById('last-updated');
        if (this.data && this.data.lastUpdated) {
            const date = new Date(this.data.lastUpdated);
            lastUpdatedElement.textContent = date.toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            lastUpdatedElement.textContent = 'Unknown';
        }
    }

    showLoading() {
        document.getElementById('loading-spinner').style.display = 'block';
        document.getElementById('no-data-message').style.display = 'none';
        
        // Disable refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Refreshing...';
    }

    hideLoading() {
        document.getElementById('loading-spinner').style.display = 'none';
        
        // Re-enable refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-1"></i> Refresh Data';
    }

    showError() {
        this.hideLoading();
        
        // Show error message in all content areas
        const errorMessage = `
            <div class="text-center py-5">
                <i class="fas fa-exclamation-triangle text-warning mb-3" style="font-size: 3rem;"></i>
                <h5 class="text-muted">Unable to load transfer news</h5>
                <p class="text-muted">Please check your connection and try again</p>
                <button class="btn btn-primary" onclick="app.loadTransfers()">
                    <i class="fas fa-retry me-1"></i> Try Again
                </button>
            </div>
        `;

        document.getElementById('all-transfers-content').innerHTML = errorMessage;
        document.getElementById('bbc-transfers-content').innerHTML = errorMessage;
        document.getElementById('sky-transfers-content').innerHTML = errorMessage;
        document.getElementById('twitter-transfers-content').innerHTML = errorMessage;
    }

    getNoDataMessage() {
        return `
            <div class="text-center py-5">
                <i class="fas fa-info-circle text-muted mb-3" style="font-size: 3rem;"></i>
                <h5 class="text-muted">No transfer news available</h5>
                <p class="text-muted">Check back later for updates</p>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TransfersApp();
});

// Add smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        if (window.app) {
            window.app.loadTransfers();
        }
    }
});