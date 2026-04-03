import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import React from "react";

interface PropertyMapProps {
  lat: number;
  lng: number;
}

const customIcon = L.divIcon({
  html: `
    <div style="
      width:44px;
      height:44px;
      background:#222;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 4px 12px rgba(0,0,0,0.25);
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M12 3l9 8h-3v9h-12v-9h-3z"/>
      </svg>
    </div>
  `,
  className: "",
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

export default function PropertyMap({ lat, lng }: PropertyMapProps) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const center: [number, number] = [lat, lng];

  return (
    <div className="pdp-map-container">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        dragging={true}
        doubleClickZoom={false}
        touchZoom={true}
        zoomControl={true}
        zoomSnap={1}
        zoomDelta={1}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        />

        <Marker position={center} icon={customIcon} />
      </MapContainer>
    </div>
  );
}