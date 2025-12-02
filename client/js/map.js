/**
 * Map Service
 * Handles Leaflet map initialization, markers, clustering, and animations.
 */

const MapService = {
    map: null,
    markers: null, // MarkerClusterGroup
    bufferLayer: null, // Layer for the 5km circle
    flowLinesLayer: null, // Layer for AntPath lines
    userMarker: null, // Marker for user click/search location
    currentTileLayer: null, // Current active tile layer

    // Tile layers for different themes
    tileLayers: {
        dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    },

    // Icons
    icons: {
        functional: L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #009900; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        }),
        broken: L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #ce1126; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        }),
        unknown: L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #ffaa00; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        }),
        user: L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #00aaff; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,170,255,0.8); animation: pulse 2s infinite;"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        })
    },

    /**
     * Initialize the map.
     */
    init() {
        // Center on Malawi
        this.map = L.map('map', {
            zoomControl: false, // We'll add it elsewhere or keep it clean
            attributionControl: false
        }).setView([-13.25, 34.0], 7);

        // Initialize with theme-appropriate tile layer
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        this.setTileLayer(currentTheme);

        // Add attribution manually to bottom right if needed, or leave clean
        L.control.attribution({ position: 'bottomright' }).addTo(this.map);

        // Initialize layers
        this.markers = L.markerClusterGroup({
            showCoverageOnHover: false,
            maxClusterRadius: 50,
            iconCreateFunction: function (cluster) {
                const childCount = cluster.getChildCount();
                let c = ' marker-cluster-';
                if (childCount < 10) {
                    c += 'small';
                } else if (childCount < 100) {
                    c += 'medium';
                } else {
                    c += 'large';
                }

                // Custom dark theme cluster icon
                return new L.DivIcon({
                    html: '<div><span>' + childCount + '</span></div>',
                    className: 'marker-cluster' + c,
                    iconSize: new L.Point(40, 40)
                });
            }
        });
        this.map.addLayer(this.markers);

        this.bufferLayer = L.layerGroup().addTo(this.map);
        this.flowLinesLayer = L.layerGroup().addTo(this.map);

        // Map click event
        this.map.on('click', (e) => {
            this.handleMapClick(e.latlng);
        });
    },

    /**
     * Load water points onto the map.
     * @param {Array} points - Array of water point objects.
     */
    loadPoints(points) {
        this.markers.clearLayers();

        points.forEach(point => {
            const lat = parseFloat(point.lat);
            const lon = parseFloat(point.lon);

            if (isNaN(lat) || isNaN(lon)) return;

            let icon = this.icons.unknown;
            if (point.status === 'functional') icon = this.icons.functional;
            else if (point.status === 'broken') icon = this.icons.broken;

            const marker = L.marker([lat, lon], { icon: icon });

            // Tooltip
            marker.bindTooltip(`
                <strong>${point.name}</strong><br>
                Status: ${point.status}
            `, { direction: 'top', offset: [0, -10] });

            // Click event for specific point
            marker.on('click', (e) => {
                L.DomEvent.stopPropagation(e); // Prevent map click
                this.handlePointClick(point, e.latlng);
            });

            this.markers.addLayer(marker);
        });
    },

    /**
     * Handle click on a specific water point.
     */
    async handlePointClick(point, latlng) {
        // 1. Draw 5km Buffer
        this.drawBuffer(latlng);

        // 2. Fly to location
        this.map.flyTo(latlng, 12, { duration: 1.5 });

        // 3. Trigger UI updates
        UiService.showBufferCard(true);
        UiService.updateBufferStats(point.lat, point.lon);
    },

    /**
     * Handle click on the map (empty space).
     */
    async handleMapClick(latlng) {
        // 1. Place user marker
        if (this.userMarker) this.map.removeLayer(this.userMarker);
        this.userMarker = L.marker(latlng, { icon: this.icons.user }).addTo(this.map);

        // 2. Clear previous analysis
        this.bufferLayer.clearLayers();
        this.flowLinesLayer.clearLayers();
        UiService.showBufferCard(false);

        // 3. Fly to location
        this.map.flyTo(latlng, 10, { duration: 1 });

        // 4. Fetch nearest points
        UiService.loadNearest(latlng.lat, latlng.lng);
    },

    /**
     * Draw a 5km buffer circle.
     */
    drawBuffer(latlng) {
        this.bufferLayer.clearLayers();
        L.circle(latlng, {
            radius: 5000,
            color: '#00aaff',
            fillColor: '#00aaff',
            fillOpacity: 0.2,
            weight: 1
        }).addTo(this.bufferLayer);
    },

    /**
     * Draw flow lines from origin to destinations.
     * @param {Object} origin - {lat, lon}
     * @param {Array} destinations - Array of points
     */
    drawFlowLines(origin, destinations) {
        this.flowLinesLayer.clearLayers();

        destinations.forEach(dest => {
            let path;

            // Check if route geometry exists (from pgRouting)
            if (dest.route && dest.route.coordinates && dest.route.coordinates.length > 0) {
                // Use route coordinates (GeoJSON format: [lon, lat])
                path = dest.route.coordinates.map(coord => [coord[1], coord[0]]);
            } else {
                // Fallback to straight line - use wp_lat/wp_lon from backend
                const destLat = parseFloat(dest.wp_lat || dest.lat);
                const destLon = parseFloat(dest.wp_lon || dest.lon);

                // Skip if coordinates are invalid
                if (isNaN(destLat) || isNaN(destLon)) {
                    console.warn('Invalid coordinates for destination:', dest);
                    return;
                }

                path = [
                    [origin.lat, origin.lng],
                    [destLat, destLon]
                ];
            }

            // Use Leaflet.antPath
            L.polyline.antPath(path, {
                "delay": 400,
                "dashArray": [10, 20],
                "weight": 3,
                "color": "#00aaff",
                "pulseColor": "#FFFFFF",
                "paused": false,
                "reverse": false,
                "hardwareAccelerated": true
            }).addTo(this.flowLinesLayer);
        });
    },

    /**
     * Switch map tile layer based on theme.
     * @param {string} theme - 'light' or 'dark'
     */
    setTileLayer(theme) {
        // Remove existing tile layer if present
        if (this.currentTileLayer) {
            this.map.removeLayer(this.currentTileLayer);
        }

        // Add new tile layer based on theme
        const tileUrl = this.tileLayers[theme] || this.tileLayers.dark;
        this.currentTileLayer = L.tileLayer(tileUrl, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(this.map);
    }
};

window.MapService = MapService;
