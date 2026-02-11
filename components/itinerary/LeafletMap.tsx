'use client';

/**
 * LeafletMap Component
 * Interactive map using react-leaflet (OpenStreetMap)
 * Shows markers for activities with click interaction
 */

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression, Map as LeafletMap, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  const L = require('leaflet');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });
}

export interface MapMarker {
  id: string;
  position: [number, number]; // [lat, lon]
  label: string;
  number?: number; // Activity number in timeline
  onClick?: () => void;
}

interface LeafletMapProps {
  center: [number, number]; // [lat, lon]
  zoom?: number;
  markers?: MapMarker[];
  height?: string;
  onMarkerClick?: (markerId: string) => void;
}

/**
 * Component to fit bounds when markers change
 */
function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;

    // Fit map to show all markers
    if (markers.length === 1) {
      // Single marker: center on it
      map.setView(markers[0].position, 14);
    } else {
      // Multiple markers: fit bounds
      // Create bounds array in the correct format for fitBounds
      const bounds = markers.map(m => m.position) as [number, number][];
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
      });
    }
  }, [markers, map]);

  return null;
}

export default function LeafletMapComponent({
  center,
  zoom = 13,
  markers = [],
  height = '500px',
  onMarkerClick,
}: LeafletMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);

  // Custom numbered marker icon
  const createNumberedIcon = (number: number) => {
    if (typeof window === 'undefined') return undefined;

    const L = require('leaflet');

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: #3b82f6;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transform: rotate(-45deg);
        ">
          <span style="transform: rotate(45deg);">${number}</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        ref={mapRef}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Markers */}
        {markers.map((marker, index) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={createNumberedIcon(marker.number || index + 1)}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(marker.id);
                }
                if (marker.onClick) {
                  marker.onClick();
                }
              },
            }}
          >
            <Popup>
              <div>
                <strong>{marker.number ? `${marker.number}. ` : ''}{marker.label}</strong>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Auto-fit bounds */}
        {markers.length > 0 && <FitBounds markers={markers} />}
      </MapContainer>
    </div>
  );
}
