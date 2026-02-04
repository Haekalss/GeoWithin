const keywordMap = {
  // Penginapan
  hotel: { key: "tourism", value: "hotel" },
  penginapan: { key: "tourism", value: "hotel" },
  nginep: { key: "tourism", value: "hotel" },
  losmen: { key: "tourism", value: "hotel" },
  homestay: { key: "tourism", value: "hotel" },

  // Kesehatan
  rs: { key: "amenity", value: "hospital" },
  rumahsakit: { key: "amenity", value: "hospital" },
  hospital: { key: "amenity", value: "hospital" },
  klinik: { key: "amenity", value: "clinic" },
  puskesmas: { key: "amenity", value: "clinic" },

  // Makan & Minum
  restoran: { key: "amenity", value: "restaurant" },
  rumahmakan: { key: "amenity", value: "restaurant" },
  makan: { key: "amenity", value: "restaurant" },
  cafe: { key: "amenity", value: "cafe" },
  kafe: { key: "amenity", value: "cafe" },
  kopi: { key: "amenity", value: "cafe" },

  // Belanja
  minimarket: { key: "shop", value: "convenience" },
  indomaret: { key: "shop", value: "convenience" },
  alfamart: { key: "shop", value: "convenience" },
  supermarket: { key: "shop", value: "supermarket" },
  mall: { key: "shop", value: "mall" },

  // Fasilitas umum
  spbu: { key: "amenity", value: "fuel" },
  bensin: { key: "amenity", value: "fuel" },
  atm: { key: "amenity", value: "atm" },
  toilet: { key: "amenity", value: "toilets" },
  wc: { key: "amenity", value: "toilets" },

  // Ibadah
  masjid: { key: "amenity", value: "place_of_worship" },
  gereja: { key: "amenity", value: "place_of_worship" }
};

const categoryStyle = {
  hotel: { color: "#1e90ff" },        // biru
  hospital: { color: "#e63946" },     // merah
  clinic: { color: "#ff7f50" },       // oranye
  restaurant: { color: "#2a9d8f" },   // hijau
  cafe: { color: "#8d5524" },         // coklat
  supermarket: { color: "#f4a261" },  // kuning
  fuel: { color: "#6c757d" },          // abu
  atm: { color: "#6a4c93" },           // ungu
  place_of_worship: { color: "#457b9d" }, // biru gelap
  convenience: { color: "#28a745" },   // hijau muda
  mall: { color: "#ffc107" },          // kuning
  toilets: { color: "#17a2b8" }        // cyan
};
