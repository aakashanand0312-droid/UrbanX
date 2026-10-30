export type Domain = 'Traffic' | 'Weather' | 'Environment' | 'Infrastructure'
export type DataStatus = 'Demo' | 'Unavailable' | 'Connected'

export type Metric = {
  label: string
  value: string
  detail: string
  status: DataStatus
  trend?: string
  accent: string
}

export const navigation = [
  { label: 'City Overview', icon: 'LayoutDashboard' },
  { label: 'Urban Map Explorer', icon: 'Map' },
  { label: 'Traffic Intelligence', icon: 'Route' },
  { label: 'Weather & Climate', icon: 'CloudSun' },
  { label: 'Environment', icon: 'Wind' },
  { label: 'Infrastructure', icon: 'Building2' },
  { label: 'Cross-System Insights', icon: 'Network' },
  { label: 'Simulation Studio', icon: 'FlaskConical' },
  { label: 'Reports', icon: 'FileText' },
  { label: 'Data Sources', icon: 'Database' },
  { label: 'Settings', icon: 'Settings2' },
] as const

export const metrics: Metric[] = [
  { label: 'Traffic flow', value: '68%', detail: 'network operating normally', status: 'Demo', trend: '+4.2%', accent: 'blue' },
  { label: 'Air quality', value: 'AQI 82', detail: 'moderate · 14 stations', status: 'Demo', trend: '-6 pts', accent: 'teal' },
  { label: 'Rainfall', value: '—', detail: 'No live feed connected', status: 'Unavailable', accent: 'indigo' },
  { label: 'Infrastructure', value: '91%', detail: 'assets with current status', status: 'Demo', trend: '+1.8%', accent: 'amber' },
]

export const trafficTrend = [
  { time: '06:00', observed: 42, baseline: 51 }, { time: '08:00', observed: 71, baseline: 66 },
  { time: '10:00', observed: 58, baseline: 54 }, { time: '12:00', observed: 49, baseline: 47 },
  { time: '14:00', observed: 55, baseline: 52 }, { time: '16:00', observed: 63, baseline: 60 },
  { time: '18:00', observed: 78, baseline: 72 }, { time: '20:00', observed: 61, baseline: 58 },
]

export const airTrend = [
  { time: '06', value: 96 }, { time: '09', value: 88 }, { time: '12', value: 76 },
  { time: '15', value: 81 }, { time: '18', value: 79 }, { time: '21', value: 82 },
]

export const sources = [
  { name: 'OpenStreetMap / Geofabrik', domain: 'Base geography', status: 'Connected', updated: '2026-10-30 09:20 IST', coverage: 'Chandigarh boundary', type: 'Vector / OSM', license: 'ODbL 1.0' },
  { name: 'TomTom Traffic', domain: 'Traffic', status: 'Configuration required', updated: '—', coverage: 'Not connected', type: 'API', license: 'Provider terms' },
  { name: 'India Meteorological Department', domain: 'Weather & climate', status: 'Configuration required', updated: '—', coverage: 'Not connected', type: 'API / station', license: 'Check provider' },
  { name: 'data.gov.in', domain: 'Multiple domains', status: 'Configuration required', updated: '—', coverage: 'Catalog only', type: 'API / CSV', license: 'Government open data' },
  { name: 'Chandigarh Administration', domain: 'Infrastructure', status: 'Not connected', updated: '—', coverage: 'Not connected', type: 'Dataset', license: 'Check provider' },
  { name: 'ISRO Bhuvan', domain: 'Environment / geography', status: 'Not connected', updated: '—', coverage: 'Not connected', type: 'Raster / WMS', license: 'Check provider' },
]

export const insights = [
  { title: 'Weather–traffic co-occurrence', description: 'Rainfall observations and reduced speeds overlap in 3 monitored areas. This is a correlation signal, not a causal finding.', confidence: 'Medium', domains: ['Weather', 'Traffic'], updated: 'Demo observations · 09:15 IST', tone: 'blue' },
  { title: 'Air quality remains moderate', description: 'AQI is within the moderate band across available demo stations. Monitor afternoon temperature and wind relationships.', confidence: 'Demo', domains: ['Environment', 'Weather'], updated: 'Demo observations · 09:00 IST', tone: 'teal' },
  { title: 'Drainage inventory coverage gap', description: 'Current infrastructure coverage is insufficient to assess drainage exposure in the southern sectors.', confidence: 'Data gap', domains: ['Infrastructure'], updated: 'Registry review · 08:40 IST', tone: 'amber' },
]

export type ApiPath = '/api/city/overview' | '/api/traffic' | '/api/weather' | '/api/environment' | '/api/infrastructure' | '/api/insights' | '/api/simulations'
export async function urbanxFetch<T>(path: ApiPath, init?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!base) throw new Error('FastAPI backend is not configured')
  const response = await fetch(`${base}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })
  if (!response.ok) throw new Error(`UrbanX API error ${response.status}`)
  return response.json()
}
