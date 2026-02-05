const DEFAULT_RADIUS = 3000; // meter
const FETCH_TIMEOUT_MS = 15000;
const DEFAULT_LOCATION = [-6.175392, 106.827153]; // Monas, Jakarta

let map;
let userLocation; // [lat, lon]
let userMarker;
let areaPolygon;
let areaLayer;
let markers = [];
let activeFetchController;
let activeRouting = null; // Track active routing instance
let routingControl = null; // Track active routing control

const searchInput = document.getElementById("search");
const radiusSelect = document.getElementById("radius");
const radiusRange = document.getElementById("radiusRange");
const radiusValueEl = document.getElementById("radiusValue");
const btnLocate = document.getElementById("btnLocate");
const btnSearch = document.getElementById("btnSearch");
const btnClear = document.getElementById("btnClear");
const statusEl = document.getElementById("status");
const toastEl = document.getElementById("toast");

function getRadiusMeters() {
  const value = Number(radiusRange?.value ?? radiusSelect?.value);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_RADIUS;
}

function setRadiusUi(radiusMeters) {
  const value = String(radiusMeters);
  if (radiusSelect) radiusSelect.value = value;
  if (radiusRange) radiusRange.value = value;
  if (radiusValueEl) radiusValueEl.textContent = `${Math.round(radiusMeters / 1000)} km`;
}

function showLoader() {
  const loader = document.getElementById('mapLoader');
  if (loader) {
    loader.classList.remove('hide');
    loader.style.display = 'flex';
  }
}

function hideLoader() {
  const loader = document.getElementById('mapLoader');
  if (loader) {
    loader.classList.add('hide');
    setTimeout(() => {
      loader.style.display = 'none';
      // Show welcome message after loader hides
      showWelcomeMessage();
    }, 300);
  }
}

function showWelcomeMessage() {
  setTimeout(() => {
    toast("🗺️ Selamat datang di GeoWithin! Ketik pencarian untuk menemukan tempat terdekat.");
  }, 500);
}

function setStatus(message, { loading = false } = {}) {
  statusEl.textContent = message || "";
  statusEl.classList.toggle("loading", Boolean(loading));
}

let toastTimer;
function toast(message, duration = 3500) {
  if (!message) return;
  toastEl.textContent = message;
  toastEl.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), duration);
}

function setBusy(isBusy) {
  searchInput.disabled = isBusy;
  radiusSelect.disabled = isBusy;
  if (radiusRange) radiusRange.disabled = isBusy;
  btnLocate.disabled = isBusy;
  btnSearch.disabled = isBusy;
  btnClear.disabled = isBusy;
}

function abortActiveFetch() {
  if (activeFetchController) {
    activeFetchController.abort();
    activeFetchController = null;
  }
}

function clearMarkers() {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];
}

function detectKeyword(text) {
  const normalized = String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return Object.keys(keywordMap).find((k) => normalized.includes(k));
}

function getCategoryLabel(tagValue) {
  if (typeof categoryLabel !== "undefined" && categoryLabel?.[tagValue]) return categoryLabel[tagValue];
  return tagValue;
}

function formatDistanceKm(km) {
  if (!Number.isFinite(km)) return "-";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(2)} km`;
}

function buildDirectionsUrl(lat, lon) {
  const origin = `${userLocation[0]},${userLocation[1]}`;
  const destination = `${lat},${lon}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
}

function clearRouting() {
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
    activeRouting = null;
  }
}

function showRoute(destLat, destLon, destName) {
  clearRouting();
  
  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(userLocation[0], userLocation[1]),
      L.latLng(destLat, destLon)
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    draggableWaypoints: false,
    show: false, // Hide the default panel
    createMarker: function() {
      return null; // Don't create waypoint markers
    },
    lineOptions: {
      styles: [{color: '#4285f4', opacity: 0.8, weight: 5}],
      extendToWaypoints: true,
      missingRouteTolerance: 2
    }
  }).addTo(map);

  activeRouting = {lat: destLat, lon: destLon, name: destName};
  toast(`Rute ke ${destName} ditampilkan`);
}

function buildRouteButton(destLat, destLon, destName) {
  return `<button class="route-btn" data-lat="${destLat}" data-lon="${destLon}" data-name="${destName}" onclick="window.showRouteHandler && window.showRouteHandler(${destLat}, ${destLon}, '${destName.replace(/'/g, "\\'")}')">🚗 Lihat Rute Ke Sini</button>`;
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function updateSearchArea() {
  const radiusMeters = getRadiusMeters();
  areaPolygon = turf.circle(
    [userLocation[1], userLocation[0]],
    radiusMeters / 1000,
    { steps: 64, units: "kilometers" },
  );

  if (areaLayer) map.removeLayer(areaLayer);
  areaLayer = L.geoJSON(areaPolygon, {
    style: {
      color: "#aaa",
      fillColor: "#ccc",
      fillOpacity: 0.25,
      weight: 1,
    },
  }).addTo(map);
}

function initMap() {
  showLoader();
  
  map = L.map("map", { zoomControl: false }).setView(userLocation, 14);

  const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  });
  
  tileLayer.on('load', function() {
    hideLoader();
  });
  
  tileLayer.addTo(map);

  userMarker = L.circleMarker(userLocation, {
    radius: 8,
    color: "#000",
    fillColor: "#00f",
    fillOpacity: 1,
  })
    .addTo(map)
    .bindPopup("Posisi Anda");

  updateSearchArea();
  
  // Fallback hide loader after 3 seconds
  setTimeout(hideLoader, 3000);
}

async function getLocationOnce() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ ok: false, message: "Browser tidak mendukung geolocation" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ ok: true, coords: [pos.coords.latitude, pos.coords.longitude] }),
      () => resolve({ ok: false, message: "Lokasi tidak bisa diakses" }),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

function buildOverpassQuery({ tagKey, tagValue, radiusMeters }) {
  return `
[out:json];
node
  ["${tagKey}"="${tagValue}"]
  (around:${radiusMeters},${userLocation[0]},${userLocation[1]});
out;
  `;
}

async function searchNearby(text) {
  const keyword = detectKeyword(text);
  if (!keyword) {
    toast("Kata kunci belum dikenali");
    setStatus("Kata kunci belum dikenali. Contoh: hotel, rumah sakit, cafe, atm.");
    return;
  }

  const tag = keywordMap[keyword];
  const radiusMeters = getRadiusMeters();

  abortActiveFetch();
  activeFetchController = new AbortController();
  const timeoutId = setTimeout(() => activeFetchController.abort(), FETCH_TIMEOUT_MS);

  setBusy(true);
  clearRouting();
  setStatus("Mencari tempat terdekat...", { loading: true });
  clearMarkers();

  try {
    const query = buildOverpassQuery({ tagKey: tag.key, tagValue: tag.value, radiusMeters });
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      signal: activeFetchController.signal,
    });

    const data = await res.json();
    const userPoint = turf.point([userLocation[1], userLocation[0]]);
    const style = categoryStyle[tag.value] || { color: "#000" };

    (data.elements || []).forEach((el) => {
      if (!el?.lat || !el?.lon) return;
      const point = turf.point([el.lon, el.lat]);
      if (!turf.booleanPointInPolygon(point, areaPolygon)) return;

      const distanceKm = turf.distance(userPoint, point, { units: "kilometers" });

      const street = el.tags?.["addr:street"] || "";
      const house = el.tags?.["addr:housenumber"] || "";
      const city = el.tags?.["addr:city"] || "";
      const post = el.tags?.["addr:postcode"] || "";
      const addressLine1 = `${street} ${house}`.trim();
      const addressLine2 = `${city} ${post}`.trim();
      const address = [addressLine1, addressLine2].filter(Boolean).join(", ") || el.tags?.["addr:full"] || "-";

      const marker = L.circleMarker([el.lat, el.lon], {
        radius: 7,
        color: style.color,
        fillColor: style.color,
        fillOpacity: 0.85,
      })
        .addTo(map)
        .bindTooltip(`${el.tags?.name || "Tanpa Nama"}`, {
          permanent: true,
          direction: "top",
          className: "custom-tooltip clickable-tooltip",
        })
        .bindPopup(`
          <div style="min-width: 200px; max-width: 280px;">
            <h4 style="margin: 0 0 6px 0; color: ${style.color}; font-size: 14px; line-height: 1.2;">${escapeHtml(el.tags?.name || "Tanpa Nama")}</h4>
            <p style="margin: 3px 0; font-weight: bold; font-size: 11px;">📍 Kategori: ${escapeHtml(getCategoryLabel(tag.value))}</p>
            <p style="margin: 3px 0; font-size: 11px;">📏 <strong>Jarak:</strong> ${formatDistanceKm(distanceKm)}</p>
            <p style="margin: 3px 0; font-size: 11px;">🏠 <strong>Alamat:</strong> ${escapeHtml(address)}</p>
            <div style="margin-top: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              ${buildRouteButton(el.lat, el.lon, el.tags?.name || "Tempat")}
              <a href="${buildDirectionsUrl(el.lat, el.lon)}" target="_blank" rel="noopener noreferrer" style="padding: 5px 6px; background: #34a853; color: white; border-radius: 4px; text-decoration: none; text-align: center; font-size: 10px; display: flex; align-items: center; justify-content: center;">🗺️ Maps</a>
            </div>
          </div>
        `)
        .on("popupopen", function () {
          this.closeTooltip();
        })
        .on("popupclose", function () {
          this.openTooltip();
        });

      // Event listener sederhana untuk tooltip
      marker.on('tooltipopen', function(e) {
        const tooltipElement = e.tooltip.getElement();
        if (tooltipElement) {
          tooltipElement.style.pointerEvents = 'auto';
          tooltipElement.style.cursor = 'pointer';
          
          tooltipElement.addEventListener('click', function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            marker.openPopup();
          });
          
          tooltipElement.addEventListener('touchstart', function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            marker.openPopup();
          });
        }
      });

      markers.push(marker);
    });

    setStatus(`Selesai. Menampilkan ${markers.length} hasil di peta.`);
  } catch (e) {
    if (e?.name === "AbortError") {
      setStatus("Permintaan dibatalkan/timeout. Coba lagi.");
      toast("Timeout. Coba lagi");
    } else {
      setStatus("Gagal mengambil data dari Overpass.");
      toast("Gagal memuat data");
    }
  } finally {
    clearTimeout(timeoutId);
    activeFetchController = null;
    setBusy(false);
    statusEl.classList.remove("loading");
  }
}

function wireUi() {
  setRadiusUi(getRadiusMeters());

  // Global handler for route button clicks
  window.showRouteHandler = function(lat, lon, name) {
    showRoute(lat, lon, name);
    // Tutup popup setelah menampilkan rute
    map.closePopup();
  };

  let rafId;
  const applyRadiusChange = (shouldToast) => {
    const radiusMeters = getRadiusMeters();
    setRadiusUi(radiusMeters);
    if (map && userLocation) {
      updateSearchArea();
    }
    if (shouldToast) toast(`Radius: ${Math.round(radiusMeters / 1000)} km`);
  };

  // Sync radius controls
  if (radiusSelect) {
    radiusSelect.addEventListener("change", () => {
      if (radiusRange) radiusRange.value = radiusSelect.value;
      applyRadiusChange(true);
    });
  }
  
  if (radiusRange) {
    radiusRange.addEventListener("input", () => {
      if (radiusSelect) radiusSelect.value = radiusRange.value;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => applyRadiusChange(false));
    });
    radiusRange.addEventListener("change", () => {
      applyRadiusChange(true);
    });
  }

  btnLocate.addEventListener("click", async () => {
    abortActiveFetch();
    setBusy(true);
    setStatus("Memperbarui lokasi...", { loading: true });

    const location = await getLocationOnce();
    if (location.ok) {
      userLocation = location.coords;
      userMarker.setLatLng(userLocation);
      map.setView(userLocation, Math.max(map.getZoom(), 14), { animate: true });
      updateSearchArea();
      setStatus("Lokasi diperbarui.");
      toast("Lokasi diperbarui");
    } else {
      setStatus(location.message);
      toast(location.message);
    }

    setBusy(false);
    statusEl.classList.remove("loading");
  });

  const doSearch = () => {
    updateSearchArea();
    searchNearby(searchInput.value);
  };

  btnSearch.addEventListener("click", doSearch);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    doSearch();
  });

  btnClear.addEventListener("click", () => {
    abortActiveFetch();
    clearRouting();
    clearMarkers();
    setStatus("Siap mencari.");
    toast("Hasil dibersihkan");
  });
}

async function startApp() {
  setStatus("Mendeteksi lokasi...", { loading: true });
  const location = await getLocationOnce();
  if (location.ok) {
    userLocation = location.coords;
    setStatus("Lokasi terdeteksi. Siap mencari.");
  } else {
    userLocation = DEFAULT_LOCATION;
    setStatus(`${location.message}. Menggunakan lokasi default (Jakarta).`);
    toast("Lokasi default dipakai (Jakarta)");
  }

  initMap();
  wireUi();
}

startApp();
