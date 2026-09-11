/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { 
  MapPin, 
  Compass, 
  RefreshCw, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Radio,
  Navigation
} from "lucide-react";

interface InteractiveAttendanceMapProps {
  useRealGps: boolean;
  realLat: number | null;
  realLon: number | null;
  schoolLat: number;
  schoolLon: number;
  gpsOffsetLat: number;
  gpsOffsetLon: number;
  setGpsOffsetLat: (lat: number) => void;
  setGpsOffsetLon: (lon: number) => void;
  userLabel: string;
  schoolRadius: number;
  gpsAccuracy?: number | null;
  isGpsLoading?: boolean;
  onRefreshGps?: () => void;
  userRoleType?: "murid" | "guru" | "staf";
}

// Haversine formula to compute meters
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function InteractiveAttendanceMap({
  useRealGps,
  realLat,
  realLon,
  schoolLat,
  schoolLon,
  gpsOffsetLat,
  gpsOffsetLon,
  setGpsOffsetLat,
  setGpsOffsetLon,
  userLabel,
  schoolRadius,
  gpsAccuracy,
  isGpsLoading = false,
  onRefreshGps,
  userRoleType = "murid"
}: InteractiveAttendanceMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const schoolMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapType, setMapType] = useState<"street" | "satellite">("street");

  // Determine active coordinates
  const activeLat = useRealGps && realLat !== null ? realLat : schoolLat + gpsOffsetLat;
  const activeLon = useRealGps && realLon !== null ? realLon : schoolLon + gpsOffsetLon;
  const distance = calculateDistanceMeters(schoolLat, schoolLon, activeLat, activeLon);
  const isWithinRadius = distance <= schoolRadius;

  // Google Maps link
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${activeLat},${activeLon}`;

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [activeLat, activeLon],
      zoom: 16,
      zoomControl: true,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Tile Layer setup
    const tileUrl =
      mapType === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // School Radius Circle
    const circle = L.circle([schoolLat, schoolLon], {
      radius: schoolRadius,
      color: "#059669",
      fillColor: "#10b981",
      fillOpacity: 0.18,
      weight: 2,
      dashArray: "4, 4"
    }).addTo(map);
    radiusCircleRef.current = circle;

    // Custom icon for School
    const schoolIcon = L.divIcon({
      className: "custom-school-marker",
      html: `
        <div style="background-color: #059669; color: white; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; transform: translate(-50%, -50%);">
          🏫
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const schoolMarker = L.marker([schoolLat, schoolLon], { icon: schoolIcon }).addTo(map);
    schoolMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 11px; line-height: 1.4; color: #1e293b;">
        <strong style="color: #047857; font-size: 12px; display: block; margin-bottom: 2px;">SMK Negeri 2 Konawe</strong>
        Titik Pusat Radius Presensi: ${schoolRadius} meter<br/>
        <span style="color: #64748b; font-size: 10px;">${schoolLat.toFixed(6)}, ${schoolLon.toFixed(6)}</span>
      </div>
    `);
    schoolMarkerRef.current = schoolMarker;

    // Custom icon for User/Student
    const userRoleColor = userRoleType === "murid" ? "#2563eb" : "#4f46e5";
    const userRoleEmoji = userRoleType === "murid" ? "🎒" : "👨‍🏫";
    const userIcon = L.divIcon({
      className: "custom-user-marker",
      html: `
        <div style="position: relative; width: 36px; height: 36px; transform: translate(-50%, -50%);">
          <div style="position: absolute; inset: -4px; border-radius: 50%; background-color: ${userRoleColor}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; background-color: ${userRoleColor}; color: white; width: 36px; height: 36px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; font-size: 13px;">
            ${userRoleEmoji}
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const userMarker = L.marker([activeLat, activeLon], { 
      icon: userIcon,
      draggable: !useRealGps
    }).addTo(map);

    userMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 11px; line-height: 1.4; color: #1e293b;">
        <strong style="font-size: 12px; display: block; margin-bottom: 2px;">${userLabel}</strong>
        Jarak ke Sekolah: <b>${distance} meter</b><br/>
        Status: <b style="color: ${isWithinRadius ? '#059669' : '#dc2626'};">${isWithinRadius ? 'Dalam Radius Sekolah' : 'Di Luar Radius'}</b><br/>
        <span style="color: #64748b; font-size: 10px;">Lat: ${activeLat.toFixed(6)}, Lon: ${activeLon.toFixed(6)}</span>
      </div>
    `);
    userMarkerRef.current = userMarker;

    // Drag handler in simulation mode
    userMarker.on("dragend", (e: any) => {
      if (!useRealGps) {
        const marker = e.target;
        const position = marker.getLatLng();
        setGpsOffsetLat(position.lat - schoolLat);
        setGpsOffsetLon(position.lng - schoolLon);
      }
    });

    // Connecting polyline
    const line = L.polyline([[schoolLat, schoolLon], [activeLat, activeLon]], {
      color: isWithinRadius ? "#10b981" : "#ef4444",
      weight: 2.5,
      dashArray: "5, 8",
      opacity: 0.8
    }).addTo(map);
    polylineRef.current = line;

    // Click map to reposition in simulation mode
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (!useRealGps) {
        setGpsOffsetLat(e.latlng.lat - schoolLat);
        setGpsOffsetLon(e.latlng.lng - schoolLon);
      }
    });

    // Auto-fit bounds comfortably to show both school and user
    try {
      const bounds = L.latLngBounds([
        [schoolLat, schoolLon],
        [activeLat, activeLon]
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
    } catch (e) {
      map.setView([activeLat, activeLon], 16);
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [schoolLat, schoolLon, mapType]);

  // Update markers when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !userMarkerRef.current) return;

    userMarkerRef.current.setLatLng([activeLat, activeLon]);
    userMarkerRef.current.getPopup()?.setContent(`
      <div style="font-family: sans-serif; font-size: 11px; line-height: 1.4; color: #1e293b;">
        <strong style="font-size: 12px; display: block; margin-bottom: 2px;">${userLabel}</strong>
        Jarak ke Sekolah: <b>${distance} meter</b><br/>
        Status: <b style="color: ${isWithinRadius ? '#059669' : '#dc2626'};">${isWithinRadius ? 'Dalam Radius Sekolah' : 'Di Luar Radius'}</b><br/>
        <span style="color: #64748b; font-size: 10px;">Lat: ${activeLat.toFixed(6)}, Lon: ${activeLon.toFixed(6)}</span>
      </div>
    `);

    if (polylineRef.current) {
      polylineRef.current.setLatLngs([[schoolLat, schoolLon], [activeLat, activeLon]]);
      polylineRef.current.setStyle({
        color: isWithinRadius ? "#10b981" : "#ef4444"
      });
    }

    // Adjust view if needed
    try {
      const bounds = L.latLngBounds([
        [schoolLat, schoolLon],
        [activeLat, activeLon]
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [35, 35], maxZoom: 17 });
    } catch (e) {
      mapInstanceRef.current.panTo([activeLat, activeLon]);
    }
  }, [activeLat, activeLon, distance, isWithinRadius, userLabel, schoolLat, schoolLon]);

  return (
    <div className="w-full rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
      {/* Top Map Control Header */}
      <div className="bg-slate-900 text-white p-3.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
            <Compass className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Peta Lokasi GPS {userRoleType === "murid" ? "Murid" : "Guru & Staf"}
              </h4>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                useRealGps 
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              }`}>
                {useRealGps ? "GPS HP Riil" : "Simulasi"}
              </span>
            </div>
            <p className="text-[10px] text-slate-300 font-mono">
              Koordinat: {activeLat.toFixed(6)}, {activeLon.toFixed(6)}
              {gpsAccuracy ? ` (±${gpsAccuracy}m)` : ""}
            </p>
          </div>
        </div>

        {/* Map Layer Switcher & External Link */}
        <div className="flex items-center gap-1.5">
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setMapType("street")}
              className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                mapType === "street" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              Jalan
            </button>
            <button
              type="button"
              onClick={() => setMapType("satellite")}
              className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                mapType === "satellite" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              Satelit
            </button>
          </div>

          {onRefreshGps && (
            <button
              type="button"
              onClick={onRefreshGps}
              disabled={isGpsLoading}
              title="Perbarui titik GPS sekarang"
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center gap-1 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isGpsLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Segarkan GPS</span>
            </button>
          )}

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Buka langsung posisi ini di Google Maps HP"
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 transition-all shadow-xs"
          >
            <Navigation className="w-3 h-3" />
            <span>Google Maps</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* The Leaflet Map Canvas */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-60 sm:h-72 bg-slate-100 z-0 relative cursor-crosshair"
        style={{ minHeight: "240px" }}
      />

      {/* Bottom Status & Diagnostics Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg shrink-0 ${
            isWithinRadius 
              ? "bg-emerald-100 text-emerald-700" 
              : "bg-rose-100 text-rose-700"
          }`}>
            {isWithinRadius ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold">
              <span className={isWithinRadius ? "text-emerald-800" : "text-rose-800"}>
                Jarak ke SMK Negeri 2 Konawe: {distance} meter
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                (Batas Radius: {schoolRadius}m)
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              {isWithinRadius 
                ? "✅ Posisi Anda berada di lingkungan sekolah. Presensi kehadiran dinyatakan sah."
                : `⚠️ Di luar jangkauan radius sekolah (terpaut ${distance - schoolRadius}m dari gerbang sekolah).`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!useRealGps && (
            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
              Mode Simulasi: Klik atau geser marker di peta untuk memindahkan posisi
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
