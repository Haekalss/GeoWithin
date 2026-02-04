// Konstanta radius pencarian dalam meter
const SEARCH_RADIUS = 3000; // 3 km

let map;
let userLocation;
let areaPolygon;
let markers = [];

navigator.geolocation.getCurrentPosition(
  (pos) => {
    userLocation = [pos.coords.latitude, pos.coords.longitude];
    initMap();
  },
  (err) => {
    alert("Lokasi tidak bisa diakses");
  },
);

function initMap() {
  map = L.map("map").setView(userLocation, 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  // marker user
  L.circleMarker(userLocation, {
    radius: 8,
    color: "#000",
    fillColor: "#00f",
    fillOpacity: 1,
  })
    .addTo(map)
    .bindPopup("Posisi Anda");

  // polygon area (lingkaran nyaman)
  areaPolygon = turf.circle(
    [userLocation[1], userLocation[0]], // [longitude, latitude] untuk Turf.js
    SEARCH_RADIUS / 1000,
    { steps: 64, units: "kilometers" },
  );

  L.geoJSON(areaPolygon, {
    style: {
      color: "#aaa",
      fillColor: "#ccc",
      fillOpacity: 0.25,
      weight: 1,
    },
  }).addTo(map);
}

function clearMarkers() {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];
}

function detectKeyword(text) {
  text = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  return Object.keys(keywordMap).find((k) => text.includes(k));
}

function searchNearby(text) {
  const keyword = detectKeyword(text);
  if (!keyword) return;

  const tag = keywordMap[keyword];

  const query = `
  [out:json];
  node
    ["${tag.key}"="${tag.value}"]
    (around:${SEARCH_RADIUS},${userLocation[0]},${userLocation[1]});
  out;
  `;

  fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
  })
    .then((res) => res.json())
    .then((data) => {
      clearMarkers();

      data.elements.forEach((el) => {
        const point = turf.point([el.lon, el.lat]);

        if (turf.booleanPointInPolygon(point, areaPolygon)) {
          const style = categoryStyle[tag.value] || { color: "#000" };

          const marker = L.circleMarker([el.lat, el.lon], {
            radius: 7,
            color: style.color,
            fillColor: style.color,
            fillOpacity: 0.85,
          }).addTo(map)
          .bindTooltip(`${el.tags?.name || "Tanpa Nama"}`, {
            permanent: true,
            direction: 'top',
            className: 'custom-tooltip'
          })
          .bindPopup(`
  <div style="min-width: 200px;">
    <h4 style="margin: 0 0 8px 0; color: ${style.color};">${el.tags?.name || "Tanpa Nama"}</h4>
    <p style="margin: 4px 0; font-weight: bold;">📍 Kategori: ${tag.value}</p>
    <p style="margin: 4px 0;">🏠 <strong>Alamat:</strong> ${(el.tags?.['addr:street'] || el.tags?.['addr:full']) ? `${el.tags?.['addr:street'] || ''} ${el.tags?.['addr:housenumber'] || ''}<br/>${el.tags?.['addr:city'] || ''} ${el.tags?.['addr:postcode'] || ''}` : '-'}</p>
    <p style="margin: 4px 0;">📞 <strong>Telepon:</strong> ${el.tags?.phone || '-'}</p>
    <p style="margin: 4px 0;">🌐 <strong>Website:</strong> ${el.tags?.website || el.tags?.url ? `<a href="${el.tags.website || el.tags.url}" target="_blank">Kunjungi</a>` : '-'}</p>
    <p style="margin: 4px 0;">⏰ <strong>Jam Buka:</strong> ${el.tags?.opening_hours ? el.tags.opening_hours.replace(/;/g, '<br/>') : '-'}</p>
    <p style="margin: 4px 0;">📧 <strong>Email:</strong> ${el.tags?.email || '-'}</p>
    <p style="margin: 4px 0;">ℹ️ <strong>Deskripsi:</strong> ${el.tags?.description || el.tags?.note || '-'}</p>
    <p style="margin: 4px 0;">👥 <strong>Kapasitas:</strong> ${el.tags?.capacity ? el.tags.capacity + ' orang' : '-'}</p>
    <p style="margin: 4px 0;">⭐ <strong>Rating:</strong> ${el.tags?.stars || el.tags?.rating || '-'}</p>
  </div>
`)
          .on('popupopen', function() {
            this.closeTooltip();
          })
          .on('popupclose', function() {
            this.openTooltip();
          });

          markers.push(marker);
        }
      });
    });
}

document.getElementById("search").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchNearby(e.target.value);
  }
});
