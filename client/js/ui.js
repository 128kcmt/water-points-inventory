/**
 * UI Service
 * Handles sidebar, stats, search, and general DOM manipulation.
 */

const UiService = {
    // State
    allPoints: [],

    init() {
        this.bindEvents();
        this.loadInitialData();
    },

    bindEvents() {
        // Sidebar toggle
        document.getElementById('close-sidebar').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
        });

        // Stats toggle
        document.getElementById('toggle-stats').addEventListener('click', () => {
            const content = document.getElementById('stats-content');
            const icon = document.querySelector('.toggle-icon');
            content.classList.toggle('collapsed');
            icon.style.transform = content.classList.contains('collapsed') ? 'rotate(-90deg)' : 'rotate(0deg)';
        });

        // Search
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        searchBtn.addEventListener('click', () => this.handleSearch(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch(searchInput.value);
        });

        // Buffer Card Close
        document.getElementById('close-buffer-card').addEventListener('click', () => {
            this.showBufferCard(false);
        });

        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // Filter map
                this.filterMap(e.target.dataset.filter);
            });
        });
    },

    async loadInitialData() {
        this.showSpinner(true);

        // Load Map Points
        this.allPoints = await ApiService.getWaterPoints();
        MapService.loadPoints(this.allPoints);

        // Calculate Stats Client-Side from loaded points
        const total = this.allPoints.length;
        const functional = this.allPoints.filter(p => p.status === 'Functional').length;
        const broken = this.allPoints.filter(p => p.status === 'Non-Functional' || p.status === 'Partially Functional').length;

        document.getElementById('stat-total').textContent = total.toLocaleString();
        document.getElementById('stat-functional').textContent = functional.toLocaleString();
        document.getElementById('stat-broken').textContent = broken.toLocaleString();

        this.showSpinner(false);
    },

    async handleSearch(query) {
        if (!query) return;

        const results = await ApiService.searchLocation(query);
        if (results && results.length > 0) {
            const first = results[0];
            const lat = parseFloat(first.lat);
            const lon = parseFloat(first.lon);

            // Simulate map click
            MapService.handleMapClick({ lat, lng: lon });

            // Clear search results UI if we had a dropdown (simple version just flies there)
            document.getElementById('search-input').value = first.display_name.split(',')[0];
        } else {
            alert('Location not found');
        }
    },

    async loadNearest(lat, lon) {
        // Open sidebar
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.add('open');

        const list = document.getElementById('nearest-list');
        list.innerHTML = '<li style="text-align:center; padding: 20px;">Loading nearest points...</li>';

        const nearest = await ApiService.getNearest(lat, lon);

        list.innerHTML = '';
        if (nearest.length === 0) {
            list.innerHTML = '<li>No points found nearby.</li>';
            return;
        }

        // Draw flow lines
        MapService.drawFlowLines({ lat, lng: lon }, nearest);

        nearest.forEach(point => {
            const li = document.createElement('li');
            li.className = `nearest-item ${point.status}`;
            li.innerHTML = `
                <span class="nearest-name">${point.wp_name || point.name || 'Unknown'}</span>
                <div class="nearest-meta">
                    <span>${point.wp_status || point.status || 'Unknown'}</span>
                    <span>${(parseFloat(point.distance) / 1000).toFixed(2)} km</span>
                </div>
            `;

            li.addEventListener('click', () => {
                MapService.handlePointClick(point, {
                    lat: parseFloat(point.wp_lat),
                    lng: parseFloat(point.wp_lon)
                });
            });

            list.appendChild(li);
        });
    },

    async updateBufferStats(lat, lon) {
        const countSpan = document.getElementById('pop-count');
        countSpan.textContent = '...';

        const data = await ApiService.getPopInBuffer(lat, lon);
        // Animate number
        this.animateValue(countSpan, 0, data.population, 1000);
    },

    showBufferCard(show) {
        const card = document.getElementById('buffer-card');
        if (show) card.classList.remove('hidden');
        else card.classList.add('hidden');
    },

    filterMap(filter) {
        if (filter === 'all') {
            MapService.loadPoints(this.allPoints);
        } else if (filter === 'functional') {
            // Filter for Functional status
            const filtered = this.allPoints.filter(p => p.status === 'Functional');
            MapService.loadPoints(filtered);
        } else if (filter === 'broken') {
            // Filter for Non-Functional and Partially Functional
            const filtered = this.allPoints.filter(p =>
                p.status === 'Non-Functional' || p.status === 'Partially Functional'
            );
            MapService.loadPoints(filtered);
        }
    },

    showSpinner(show) {
        const spinner = document.getElementById('loading-spinner');
        const text = document.getElementById('status-text');
        if (show) {
            spinner.classList.remove('hidden');
            text.textContent = 'Loading data...';
        } else {
            spinner.classList.add('hidden');
            text.textContent = 'Ready';
        }
    },

    animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    MapService.init();
    UiService.init();
});

window.UiService = UiService;
