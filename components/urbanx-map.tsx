'use client'

import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
// Load Leaflet's stylesheet at runtime so TypeScript does not need a CSS module declaration.
if (typeof document !== 'undefined') {
  const leafletStylesheet = document.querySelector<HTMLLinkElement>('link[data-leaflet-stylesheet]')
  if (!leafletStylesheet) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.dataset.leafletStylesheet = 'true'
    document.head.appendChild(link)
  }
}

type LeafletMap = {
  invalidateSize: (options?: { pan?: boolean }) => unknown
  remove: () => void
}

type UrbanMapProps = { compact?: boolean }

// Approximate Chandigarh city limits. The map is deliberately constrained to
// this area so users do not accidentally pan into neighbouring cities.
const CHANDIGARH_BOUNDS: [[number, number], [number, number]] = [
  [30.650, 76.700], // south-west
  [30.800, 76.850], // north-east
]

const CHANDIGARH_CENTER: [number, number] = [30.7333, 76.7794]

export function UrbanMap({ compact = false }: UrbanMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let resizeObserver: ResizeObserver | undefined

    async function initialiseMap() {
      try {
        const leafletModule = 'leaflet'
        const L = await import(leafletModule)
        if (cancelled || !mapElementRef.current || mapInstanceRef.current) return

        const bounds = L.latLngBounds(CHANDIGARH_BOUNDS)
        const map = L.map(mapElementRef.current, {
          zoomControl: false,
          attributionControl: true,
          minZoom: 11,
          maxZoom: 18,
          maxBounds: bounds,
          maxBoundsViscosity: 1,
          worldCopyJump: false,
        })

        map.fitBounds(bounds, { padding: [12, 12] })
        L.control.zoom({ position: 'bottomright' }).addTo(map)

        const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          minZoom: 11,
          maxZoom: 19,
          noWrap: true,
          bounds,
        })
        tiles.addTo(map)
        tiles.on('tileerror', () => {
          if (!cancelled) setMapError('Some map tiles could not be loaded. Check your internet connection and refresh.')
        })

        const demoMarkers = [
          { point: [30.742, 76.782] as [number, number], label: 'Sector 17 · demo signal', tone: '#2563eb' },
          { point: [30.704, 76.801] as [number, number], label: 'Sector 42 · data gap', tone: '#d97706' },
          { point: [30.759, 76.768] as [number, number], label: 'Sukhna edge · demo signal', tone: '#0f766e' },
        ]

        demoMarkers.forEach(({ point, label, tone }) => {
          L.circleMarker(point, {
            radius: 7,
            color: tone,
            fillColor: tone,
            fillOpacity: 0.75,
            weight: 2,
          })
            .addTo(map)
            .bindPopup(`<strong>${label}</strong><br/>Illustrative demo marker; not a live observation.`)
        })

        mapInstanceRef.current = map

        // Leaflet needs an explicit size refresh when its parent becomes visible
        // or changes dimensions (for example, when switching dashboard modules).
        const refreshSize = () => {
          if (!cancelled && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize({ pan: false })
          }
        }
        requestAnimationFrame(refreshSize)
        resizeObserver = new ResizeObserver(refreshSize)
        resizeObserver.observe(mapElementRef.current)
      } catch (error) {
        console.error('UrbanX map failed to initialise:', error)
        if (!cancelled) setMapError('The map could not be initialised. Please refresh the page.')
      }
    }

    initialiseMap()

    return () => {
      cancelled = true
      resizeObserver?.disconnect()
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [])

  return (
    <div
      className={`urbanx-map-shell relative isolate z-0 w-full overflow-hidden bg-slate-100 ${compact ? 'h-[310px]' : 'h-[min(68vh,720px)] min-h-[480px]'}`}
    >
      <div
        ref={mapElementRef}
        className="urbanx-leaflet-map absolute inset-0 h-full w-full"
        aria-label="Interactive OpenStreetMap limited to Chandigarh"
      />
      {mapError && (
        <div className="absolute bottom-3 left-3 right-3 z-[50] rounded-md border border-amber-200 bg-white/95 px-3 py-2 text-xs text-amber-800 shadow-sm" role="status">
          {mapError}
        </div>
      )}
      <div className="pointer-events-none absolute left-3 bottom-3 z-[40] rounded bg-white/90 px-2 py-1 text-[10px] text-slate-500 shadow-sm">
        Chandigarh city view · Demo markers
      </div>
    </div>
  )
}
