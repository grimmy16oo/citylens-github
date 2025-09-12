(function () {
	// Configuration
	const CONFIG = {
		overpassUrl: 'https://overpass-api.de/api/interpreter',
		ndviPointApi: null, // optional: e.g., 'https://your-ndvi-api?lat={lat}&lng={lng}'
		maxOverpassElements: 3000,
		greenerySampleMax: 2000,
	};

	// Map setup
	const DHAKA_CENTER = { lat: 23.8103, lng: 90.4125 };
	const INITIAL_ZOOM = 7; // show divisions first

	const DIVISIONS = [
		{ name: 'Dhaka', center: [23.8103, 90.4125], zoom: 11 },
		{ name: 'Chattogram', center: [22.3569, 91.7832], zoom: 10 },
		{ name: 'Khulna', center: [22.8456, 89.5403], zoom: 10 },
		{ name: 'Rajshahi', center: [24.3636, 88.6241], zoom: 10 },
		{ name: 'Sylhet', center: [24.8949, 91.8687], zoom: 10 },
		{ name: 'Barishal', center: [22.7010, 90.3535], zoom: 10 },
		{ name: 'Rangpur', center: [25.7439, 89.2752], zoom: 10 },
		{ name: 'Mymensingh', center: [24.7471, 90.4203], zoom: 10 },
	];

	const DHAKA_REGIONS = [
		// Greater Dhaka
		{ name: 'Mirpur', lat: 23.8223, lng: 90.3654 },
		{ name: 'Gulshan', lat: 23.7925, lng: 90.4078 },
		{ name: 'Dhanmondi', lat: 23.7461, lng: 90.3742 },
		{ name: 'Motijheel', lat: 23.7339, lng: 90.4149 },
		{ name: 'Uttara', lat: 23.8740, lng: 90.3984 },
		{ name: 'Banani', lat: 23.7935, lng: 90.4043 },
		{ name: 'Tejgaon', lat: 23.7620, lng: 90.4003 },
		{ name: 'Badda', lat: 23.7805, lng: 90.4260 },
		{ name: 'Mohammadpur', lat: 23.7640, lng: 90.3589 },
		{ name: 'Farmgate', lat: 23.7515, lng: 90.3910 },
		{ name: 'Rampura', lat: 23.7635, lng: 90.4207 },
		{ name: 'Shyamoli', lat: 23.7702, lng: 90.3606 },
		{ name: 'Kallyanpur', lat: 23.7793, lng: 90.3604 },
		{ name: 'Malibagh', lat: 23.7527, lng: 90.4201 },
		{ name: 'Aftabnagar', lat: 23.7649, lng: 90.4409 },
		{ name: 'Banasree', lat: 23.7626, lng: 90.4515 },
		{ name: 'Baridhara', lat: 23.8107, lng: 90.4229 },
		{ name: 'Niketan', lat: 23.7835, lng: 90.4097 },
		{ name: 'Bashundhara', lat: 23.8197, lng: 90.4529 },
		{ name: 'Keraniganj', lat: 23.6889, lng: 90.3442 },
		// Old Dhaka focus
		{ name: 'Lalbagh', lat: 23.7189, lng: 90.3880 },
		{ name: 'Wari', lat: 23.7199, lng: 90.4215 },
		{ name: 'Paltan', lat: 23.7345, lng: 90.4101 },
		{ name: 'Kamalapur', lat: 23.7331, lng: 90.4255 },
		{ name: 'Chawkbazar', lat: 23.7208, lng: 90.3928 },
		{ name: 'Bangshal', lat: 23.7178, lng: 90.4080 },
		{ name: 'Kotwali', lat: 23.7118, lng: 90.4022 },
		{ name: 'Sutrapur', lat: 23.7104, lng: 90.4190 },
		{ name: 'Islampur', lat: 23.7095, lng: 90.4026 },
		{ name: 'Nababpur', lat: 23.7165, lng: 90.4126 },
		{ name: 'Armanitola', lat: 23.7109, lng: 90.4009 },
		{ name: 'Shakhari Bazar', lat: 23.7098, lng: 90.4064 },
		{ name: 'Sadarghat', lat: 23.7065, lng: 90.4112 },
		{ name: 'Gendaria', lat: 23.7014, lng: 90.4300 },
		{ name: 'Tikatuli', lat: 23.7237, lng: 90.4239 },
		{ name: 'Azimpur', lat: 23.7317, lng: 90.3836 },
		{ name: 'Nilkhet', lat: 23.7312, lng: 90.3878 },
		{ name: 'Nayabazar', lat: 23.7139, lng: 90.4038 },
	];

	const layerGroups = {
		divisionMarkers: L.layerGroup(),
		regionMarkers: L.layerGroup(),
	};

	const map = L.map('map', {
		center: [DHAKA_CENTER.lat, DHAKA_CENTER.lng],
		zoom: INITIAL_ZOOM,
		preferCanvas: true,
		zoomControl: true,
	});

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; OpenStreetMap contributors',
		maxZoom: 20,
	}).addTo(map);

	// Grab UI elements
	const elSearch = document.getElementById('search-input');
	const elZoomOut = document.getElementById('btn-zoom-out');

	// Utils
	function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
	function capElements(elements, max) { return Array.isArray(elements) ? elements.slice(0, max) : []; }

	async function safeFetchJson(url, options) {
		const res = await fetch(url, options);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return res.json();
	}

	async function overpassQuery(q) {
		const res = await fetch(CONFIG.overpassUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
			body: new URLSearchParams({ data: q }).toString(),
		});
		if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
		return res.json();
	}

	// Divisions and regions
	function renderDivisionMarkers() {
		layerGroups.divisionMarkers.clearLayers();
		DIVISIONS.forEach(div => {
			const m = L.marker(div.center, { title: div.name });
			m.bindTooltip(div.name, { direction: 'top', offset: [0, -10] });
			m.on('click', () => {
				map.flyTo(div.center, div.zoom, { animate: true, duration: 1.0, easeLinearity: 0.25 });
				if (div.name === 'Dhaka') sleep(600).then(() => renderDhakaRegions());
			});
			m.addTo(layerGroups.divisionMarkers);
		});
		layerGroups.divisionMarkers.addTo(map);
	}

	function renderDhakaRegions() {
		layerGroups.regionMarkers.clearLayers();
		DHAKA_REGIONS.forEach(r => {
			const marker = L.marker([r.lat, r.lng], { title: r.name });
			marker.bindTooltip(`${r.name}`, { direction: 'top', offset: [0, -8] });
			marker.on('click', async () => {
				map.flyTo([r.lat, r.lng], 14, { animate: true, duration: 0.8 });
				await openRegionPopup(r);
			});
			marker.addTo(layerGroups.regionMarkers);
		});
		layerGroups.regionMarkers.addTo(map);
	}

	async function openRegionPopup(region) {
		const { lat, lng, name } = region;
		const details = await fetchRegionDetails(lat, lng);
		const insights = await fetchRegionInsights(lat, lng);
		const content = [
			'<div class="min-w-[240px] max-w-[300px]">',
			`<div class="font-semibold text-gray-800 mb-1">${name}</div>`,
			'<div class="text-xs text-gray-500 mb-2">Dhaka, Bangladesh</div>',
			'<div class="grid grid-cols-2 gap-2 text-sm">',
			`<div class="p-2 rounded bg-emerald-50"><div class="text-gray-500 text-xs">Population density</div><div class="font-semibold">${details.population.toLocaleString()}</div></div>`,
			`<div class="p-2 rounded bg-green-50"><div class="text-gray-500 text-xs">Greenery</div><div class="font-semibold">${details.greenery}%</div></div>`,
			`<div class="p-2 rounded bg-sky-50"><div class="text-gray-500 text-xs">AQI</div><div class="font-semibold">${details.aqi}</div></div>`,
			`<div class="p-2 rounded bg-rose-50"><div class="text-gray-500 text-xs">Flood risk</div><div class="font-semibold">${insights.flood.label}</div></div>`,
			`<div class="p-2 rounded bg-amber-50"><div class="text-gray-500 text-xs">Heat index</div><div class="font-semibold">${insights.heat.label}</div></div>`,
			`<div class="p-2 rounded bg-lime-50"><div class="text-gray-500 text-xs">NDVI signal</div><div class="font-semibold">${insights.ndvi.label}</div></div>`,
			'</div>',
			`<div class="mt-2 text-[11px] text-gray-500">Updated: ${new Date().toLocaleString()}</div>`,
			'</div>'
		].join('');
		L.popup({ offset: [0, -6] }).setLatLng([lat, lng]).setContent(content).openOn(map);
	}

	// Data helpers
	async function fetchRegionInsights(lat, lng) {
		const radius = 1200; // meters
		// Overpass counts for water, buildings, greenery as proxies
		const q = `[
			out:json][timeout:25];
			(
			  way["building"](around:${radius},${lat},${lng});
			  node["waterway"](around:${radius},${lat},${lng});
			  way["waterway"](around:${radius},${lat},${lng});
			  way["natural"="water"](around:${radius},${lat},${lng});
			  way["leisure"="park"](around:${radius},${lat},${lng});
			  way["landuse"~"forest|grass"](around:${radius},${lat},${lng});
			  way["natural"~"wood"](around:${radius},${lat},${lng});
			);
			out tags center ${CONFIG.maxOverpassElements};`;
		let water = 0, buildings = 0, green = 0;
		try {
			const data = await overpassQuery(q);
			for (const el of capElements(data.elements || [], CONFIG.maxOverpassElements)) {
				if (el.type === 'way' && el.tags && el.tags.building) buildings++;
				if ((el.type === 'node' || el.type === 'way') && el.tags) {
					if (el.tags.waterway || el.tags.natural === 'water') water++;
					if (el.tags.leisure === 'park' || (el.tags.landuse && /forest|grass/i.test(el.tags.landuse)) || el.tags.natural === 'wood') green++;
				}
			}
		} catch {}

		// Densities (rough): counts per km^2
		const areaKm2 = Math.PI * (radius/1000) * (radius/1000);
		const bDensity = buildings / areaKm2; // buildings/km^2
		const gDensity = green / areaKm2; // green features/km^2
		const wDensity = water / areaKm2; // water features/km^2

		// Normalize with heuristic ranges
		function norm(v, min, max) { return Math.max(0, Math.min(1, (v - min) / (max - min))); }
		const bN = norm(bDensity, 50, 800); // sparse -> dense
		const gN = norm(gDensity, 2, 60);  // scarce -> lush
		const wN = norm(wDensity, 0.5, 20); // rare -> many

		// Flood risk: higher with nearby water and low greenery
		const floodScore = Math.min(1, 0.6 * wN + 0.4 * (1 - gN));
		// Heat: higher with building density and low greenery
		const heatScore = Math.min(1, 0.7 * bN + 0.3 * (1 - gN));

		// NDVI proxy: use greenery density; optional live NDVI API
		let ndviValue = gN; // 0..1 proxy
		if (CONFIG.ndviPointApi) {
			try {
				const url = CONFIG.ndviPointApi.replace('{lat}', String(lat)).replace('{lng}', String(lng));
				const ndviRes = await safeFetchJson(url);
				if (ndviRes && typeof ndviRes.ndvi === 'number') ndviValue = Math.max(0, Math.min(1, ndviRes.ndvi));
			} catch {}
		}

		function labelFromScore(score, labels) {
			if (score < 0.25) return labels[0];
			if (score < 0.5) return labels[1];
			if (score < 0.75) return labels[2];
			return labels[3];
		}

		const flood = { score: floodScore, label: labelFromScore(floodScore, ['Low', 'Moderate', 'High', 'Severe']) };
		const heat = { score: heatScore, label: labelFromScore(heatScore, ['Mild', 'Warm', 'Hot', 'Hottest']) };
		const ndvi = { score: ndviValue, label: ndviValue < 0.35 ? 'Low (tree loss risk)' : ndviValue < 0.6 ? 'Moderate' : 'High' };

		return { flood, heat, ndvi };
	}

	// Details
	async function fetchRegionDetails(lat, lng) {
		const mock = deriveMockFromLatLng(lat, lng);
		return { population: Math.round(mock.population / 10), greenery: mock.greenery, aqi: mock.aqi };
	}
	function deriveMockFromLatLng(lat, lng) {
		const seed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233)) * 43758.5453; const rand = seed - Math.floor(seed);
		return { population: Math.round(1000 + rand * 15000), greenery: Math.round(10 + rand * 60), aqi: Math.round(40 + rand * 200) };
	}

	// Search
	function searchAndZoom(query) {
		if (!query) return;
		const q = query.trim().toLowerCase();
		const div = DIVISIONS.find(d => d.name.toLowerCase() === q);
		if (div) { map.flyTo(div.center, div.zoom, { animate: true, duration: 0.9 }); if (div.name === 'Dhaka') sleep(600).then(() => renderDhakaRegions()); return; }
		const reg = DHAKA_REGIONS.find(r => r.name.toLowerCase() === q);
		if (reg) { map.flyTo([reg.lat, reg.lng], 14, { animate: true, duration: 0.9 }); openRegionPopup(reg); }
	}

	// Wire UI
	if (elZoomOut) elZoomOut.addEventListener('click', () => { map.flyTo([DHAKA_CENTER.lat, DHAKA_CENTER.lng], INITIAL_ZOOM, { animate: true, duration: 0.9 }); layerGroups.regionMarkers.clearLayers(); renderDivisionMarkers(); });
	if (elSearch) elSearch.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchAndZoom(e.target.value); });

	// Init
	renderDivisionMarkers();
})();
