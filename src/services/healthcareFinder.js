const centers = [
  { name: "BD Pandey District Hospital", type: "hospital", lat: 29.3919, lng: 79.4542, address: "Mallital, Nainital" },
  { name: "Ramnagar Civil Hospital", type: "hospital", lat: 29.3942, lng: 79.1283, address: "Ramnagar, Nainital" },
  { name: "Nainital Family Clinic", type: "clinic", lat: 29.3805, lng: 79.4607, address: "Tallital, Nainital" },
  { name: "Himalaya Care Clinic", type: "clinic", lat: 29.3852, lng: 79.4471, address: "Ayarpata, Nainital" },
  { name: "Sehat Pharmacy", type: "pharmacy", lat: 29.3881, lng: 79.4567, address: "Mall Road, Nainital" },
  { name: "Kumaon Medicos", type: "pharmacy", lat: 29.3935, lng: 79.4519, address: "Mallital, Nainital" }
];

function toRad(v) { return (v * Math.PI) / 180; }

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function findNearby({ lat, lng, radiusKm = 5, type = "all" }) {
  return centers
    .map((center) => ({ ...center, distanceKm: Number(haversineKm(lat, lng, center.lat, center.lng).toFixed(2)) }))
    .filter((center) => center.distanceKm <= radiusKm)
    .filter((center) => type === "all" || center.type === type)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

module.exports = { findNearby };
