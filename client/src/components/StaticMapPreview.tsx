import React from "react";

interface StaticMapPreviewProps {
  lat: number;
  lng: number;
  zoom?: number;
  onClick?: () => void;
}

export default function StaticMapPreview({
  lat,
  lng,
  zoom = 14,
  onClick,
}: StaticMapPreviewProps) {

  const src = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=800x450&markers=${lat},${lng},red`;

  return (
    <div
      className="pdp-map-container pdp-map-preview"
      onClick={onClick}
    >
      <img
        src={src}
        alt="Map preview"
        className="pdp-map-image"
      />

      <div className="pdp-map-overlay">
        Tap to interact with map
      </div>
    </div>
  );
}