"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { WishlistItem } from "@/lib/types";
import { parseTransportDetails, parsePlaceDetails, parseStayDetails } from "./WishlistPanel";

interface MapViewModalProps {
  scheduleId: string;
  participants: string[];
  tripStart: string;
  tripEnd: string;
  tripDates: string[];
  onClose: () => void;
  onItemClick: (item: WishlistItem) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  "식사": "#F97316",
  "카페&디저트": "#EC4899",
  "관광지": "#10B981",
  "숙박": "#8B5CF6",
};

const CATEGORY_ICONS: Record<string, string> = {
  "식사": "🍽️",
  "카페&디저트": "☕",
  "관광지": "📍",
  "숙박": "🏨",
};

interface PinItem {
  item: WishlistItem;
  lat: number;
  lng: number;
  color: string;
}

function loadMapsApi(): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Promise.reject("No API key");
  if (window.google?.maps?.Map) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existing) {
      const check = setInterval(() => {
        if (window.google?.maps?.Map) { clearInterval(check); resolve(); }
      }, 100);
      setTimeout(() => { clearInterval(check); reject("Timeout"); }, 8000);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      const check2 = setInterval(() => {
        if (window.google?.maps?.Map) { clearInterval(check2); resolve(); }
      }, 50);
      setTimeout(() => { clearInterval(check2); reject("Timeout"); }, 5000);
    };
    script.onerror = () => reject("Script load failed");
    document.head.appendChild(script);
  });
}

export default function MapViewModal({
  scheduleId,
  participants,
  tripStart,
  tripEnd,
  tripDates,
  onClose,
  onItemClick,
}: MapViewModalProps) {
  const [pins, setPins] = useState<PinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [selectedPin, setSelectedPin] = useState<WishlistItem | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const boundsSetRef = useRef(false);

  // Fetch wishlist items and extract locations
  const fetchPins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/wishlist`);
      if (!res.ok) return;
      const items: WishlistItem[] = await res.json();

      const result: PinItem[] = [];
      for (const item of items) {
        if (item.category === "교통") continue;

        const place = parsePlaceDetails(item);
        const stay = parseStayDetails(item);
        const details = place || stay;
        if (!details?.place?.lat || !details?.place?.lng) continue;

        result.push({
          item,
          lat: details.place.lat,
          lng: details.place.lng,
          color: CATEGORY_COLORS[item.category] || "#6366F1",
        });
      }
      setPins(result);
    } catch { /* silently fail */ }
    setLoading(false);
  }, [scheduleId]);

  useEffect(() => { fetchPins(); }, [fetchPins]);

  // Load Google Maps
  useEffect(() => {
    loadMapsApi()
      .then(() => setMapReady(true))
      .catch(() => {});
  }, []);

  // Initialize map when ready
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstanceRef.current) return;
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 35.68, lng: 139.76 },
      zoom: 10,
      disableDefaultUI: true,
      zoomControl: true,
      fullscreenControl: false,
      styles: document.documentElement.classList.contains("dark")
        ? [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
          ]
        : [],
    });
  }, [mapReady]);

  // Render markers
  useEffect(() => {
    if (!mapInstanceRef.current || !pins.length) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    for (const pin of pins) {
      const marker = new window.google.maps.Marker({
        position: { lat: pin.lat, lng: pin.lng },
        map: mapInstanceRef.current,
        title: pin.item.title,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
              <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z"
                fill="${pin.item.confirmed ? pin.color : "#9CA3AF"}" stroke="white" stroke-width="2"/>
              <text x="18" y="20" text-anchor="middle" font-size="14" fill="white">${CATEGORY_ICONS[pin.item.category] || "•"}</text>
            </svg>`
          )}`,
          scaledSize: new window.google.maps.Size(36, 44),
          anchor: new window.google.maps.Point(18, 44),
        },
      });

      marker.addListener("click", () => {
        setSelectedPin(pin.item);
      });

      bounds.extend({ lat: pin.lat, lng: pin.lng });
      markersRef.current.push(marker);
    }

    // fitBounds only on first render
    if (pins.length > 0 && !boundsSetRef.current) {
      mapInstanceRef.current.fitBounds(bounds, 50);
      boundsSetRef.current = true;
    }
  }, [pins]);

  // Legend items
  const categories = [...new Set(pins.map((p) => p.item.category))];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800 z-10">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-200">한눈에 보기</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {pins.length}개 장소 · 핀을 눌러 상세 정보 확인
          </p>
        </div>
        <button onClick={onClose}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-xl leading-none">
          &times;
        </button>
      </div>

      {/* Legend */}
      {categories.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 dark:border-gray-700
          bg-gray-50 dark:bg-gray-800/50 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center gap-1 flex-shrink-0">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {CATEGORY_ICONS[cat]} {cat}
                <span className="text-gray-300 dark:text-gray-600 ml-0.5">
                  ({pins.filter((p) => p.item.category === cat).length})
                </span>
              </span>
            </div>
          ))}
          <div className="flex items-center gap-1 flex-shrink-0 ml-2 pl-2 border-l border-gray-200 dark:border-gray-600">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-xs text-gray-400 dark:text-gray-500">미확정</span>
            <div className="w-3 h-3 rounded-full bg-blue-500 ml-1" />
            <span className="text-xs text-gray-400 dark:text-gray-500">확정(색상)</span>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-10">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm text-gray-500 dark:text-gray-400">장소를 불러오는 중...</span>
            </div>
          </div>
        )}

        {!loading && pins.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-10">
            <div className="text-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm">위치가 등록된 장소가 없어요</p>
              <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">위시리스트에서 장소를 검색해 등록해보세요</p>
            </div>
          </div>
        )}

        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Item detail modal triggered by pin click */}
      {selectedPin && (
        <ItemDetailOnMap
          item={selectedPin}
          participants={participants}
          onClose={() => setSelectedPin(null)}
          onOpenFull={() => {
            onItemClick(selectedPin);
            setSelectedPin(null);
          }}
        />
      )}
    </div>
  );
}

// Lightweight detail card on the map
function ItemDetailOnMap({
  item,
  participants,
  onClose,
  onOpenFull,
}: {
  item: WishlistItem;
  participants: string[];
  onClose: () => void;
  onOpenFull: () => void;
}) {
  const place = parsePlaceDetails(item);
  const stay = parseStayDetails(item);
  const details = place || stay;
  const cost = details?.cost || 0;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
        w-full max-w-sm p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">{CATEGORY_ICONS[item.category]}</span>
              <span className={`text-sm font-bold ${
                item.confirmed ? "text-green-700 dark:text-green-400" : "text-gray-800 dark:text-gray-200"
              }`}>
                {item.title}
              </span>
              {item.confirmed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40
                  text-green-700 dark:text-green-400 font-medium">확정</span>
              )}
            </div>
            {details && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{details.place.name}</p>
            )}
            {cost > 0 && (
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">
                인당 {Math.floor(cost / participants.length).toLocaleString()}원
              </p>
            )}
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{item.added_by}</p>
          </div>
          <button onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none flex-shrink-0">
            &times;
          </button>
        </div>
        <button onClick={onOpenFull}
          className="mt-2 w-full py-1.5 rounded-lg text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors">
          상세 보기
        </button>
      </div>
    </div>
  );
}
