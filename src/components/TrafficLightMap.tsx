import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FacilityWithMetrics, UserLocation } from '../types/triage';

function createTrafficIcon(facility: FacilityWithMetrics, isSelected: boolean): L.DivIcon {
  const colorMap = {
    GREEN: { fill: '#16a34a', stroke: '#14532d', label: 'Short' },
    YELLOW: { fill: '#d97706', stroke: '#78350f', label: 'Med' },
    RED: { fill: '#dc2626', stroke: '#7f1d1d', label: 'Long' },
    UNAVAILABLE: { fill: '#64748b', stroke: '#334155', label: 'N/A' },
  };
  const cfg = colorMap[facility.waitTier];
  const waitText =
    facility.effectiveWaitMinutes !== null ? `${facility.effectiveWaitMinutes}m` : 'N/A';

  // Color + Shape encoding for color-blind accessibility
  const shapeSvg =
    facility.waitTier === 'GREEN'
      ? `<circle cx="14" cy="14" r="10" fill="${cfg.fill}" stroke="#ffffff" stroke-width="2.5"/>`
      : facility.waitTier === 'YELLOW'
      ? `<polygon points="14,3 25,24 3,24" fill="${cfg.fill}" stroke="#ffffff" stroke-width="2.2"/>`
      : facility.waitTier === 'RED'
      ? `<polygon points="14,2 26,14 14,26 2,14" fill="${cfg.fill}" stroke="#ffffff" stroke-width="2.2"/>`
      : `<rect x="4" y="4" width="20" height="20" rx="3" fill="${cfg.fill}" stroke="#ffffff" stroke-width="2.2"/>`;

  const ring = isSelected
    ? `box-shadow: 0 0 0 3px #0369a1; border-radius: 8px;`
    : '';

  return L.divIcon({
    className: 'triagetrack-map-marker',
    html: `<div style="display:flex;align-items:center;gap:4px;background:#ffffff;border:1.5px solid ${cfg.stroke};padding:2px 6px 2px 3px;border-radius:8px;${ring}font-family:'Public Sans',sans-serif;white-space:nowrap;">
      <svg width="20" height="20" viewBox="0 0 28 28" aria-hidden="true">${shapeSvg}</svg>
      <span style="font-size:11px;font-weight:700;color:#0f172a;font-variant-numeric:tabular-nums;">${waitText}</span>
    </div>`,
    iconSize: [72, 28],
    iconAnchor: [36, 14],
  });
}

export function TrafficLightMap({
  facilities,
  userLocation,
  selectedId,
  onSelectFacility,
  heightClass = 'h-[480px]',
}: {
  facilities: FacilityWithMetrics[];
  userLocation: UserLocation;
  selectedId?: string | null;
  onSelectFacility?: (id: string) => void;
  heightClass?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 12,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = group;

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // User location pin
    const userIcon = L.divIcon({
      className: 'triagetrack-user-pin',
      html: `<div style="width:16px;height:16px;border-radius:9999px;background:#0369a1;border:3px solid #ffffff;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .bindPopup(`<strong>Your Location</strong><br/>${userLocation.label}`)
      .addTo(group);

    for (const fac of facilities) {
      const isSelected = fac.id === selectedId;
      const marker = L.marker([fac.lat, fac.lng], {
        icon: createTrafficIcon(fac, isSelected),
        zIndexOffset: isSelected ? 500 : 0,
      });

      const waitSummary =
        fac.effectiveWaitMinutes !== null
          ? `Est. Wait: <strong>${fac.effectiveWaitMinutes} min</strong>`
          : 'Live wait data unavailable';

      marker.bindPopup(
        `<div style="font-family:'Public Sans',sans-serif;min-width:190px;">
          <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:4px;">${fac.name}</div>
          <div style="font-size:12px;color:#334155;">${waitSummary} · ${fac.distanceKm} km</div>
          <div style="font-size:11px;color:#64748b;margin-top:2px;">${fac.operatingHours}</div>
        </div>`
      );

      marker.on('click', () => {
        if (onSelectFacility) onSelectFacility(fac.id);
      });

      marker.addTo(group);
      if (isSelected) {
        map.setView([fac.lat, fac.lng], 13, { animate: true });
        marker.openPopup();
      }
    }
  }, [facilities, userLocation, selectedId, onSelectFacility]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          Traffic Light Wait-Time Map (DEMO DATA)
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" aria-hidden="true" />
            Circle: Shorter (&le;30m)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-600 inline-block rotate-45" aria-hidden="true" />
            Triangle: Moderate (31–90m)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-600 inline-block rotate-45" aria-hidden="true" />
            Diamond: Longer (&gt;90m)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-slate-500 inline-block" aria-hidden="true" />
            Square: Unavailable
          </span>
        </div>
      </div>
      <div ref={containerRef} className={`w-full ${heightClass} bg-slate-100 dark:bg-slate-800`} />
    </div>
  );
}
