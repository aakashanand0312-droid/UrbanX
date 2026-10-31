'use client'

import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, ArrowUpRight, Bell, Building2, CheckCircle2, ChevronDown, CloudRain, CloudSun, Database, Download, ExternalLink, FileText, FlaskConical, Gauge, Info, LayoutDashboard, Leaf, Map, Menu, Network, RefreshCw, Route, Search, Settings2, ShieldAlert, SlidersHorizontal, Sparkles, Wind, X } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { airTrend, insights, metrics, navigation, sources, trafficTrend, urbanxFetch } from '@/lib/urbanx-data'
import { UrbanMap } from '@/components/urbanx-map'

const icons = { LayoutDashboard, Map, Route, CloudSun, Wind, Building2, Network, FlaskConical, FileText, Database, Settings2 }

function StatusBadge({ status }: { status: string }) {
  const styles = status === 'Demo' ? 'bg-blue-50 text-blue-700 border-blue-100' : status === 'Connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
  return <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>
}

function Sidebar({ active, setActive, open, setOpen }: { active: string; setActive: (label: string) => void; open: boolean; setOpen: (open: boolean) => void }) {
  return <>
    {open && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/20 lg:hidden" onClick={() => setOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-[76px] items-center border-b border-slate-200 px-6"><div><div className="text-[22px] font-bold tracking-tight text-slate-900">Urban<span className="text-blue-600">X</span></div><div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-slate-400">Urban intelligence platform</div></div><button className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="size-5" /></button></div>
      <div className="flex-1 overflow-y-auto px-3 py-5"><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p><nav className="flex flex-col gap-0.5">{navigation.map((item) => { const Icon = icons[item.icon as keyof typeof icons]; const isActive = active === item.label; return <button key={item.label} onClick={() => { setActive(item.label); setOpen(false) }} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-[12px] font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="size-[17px]" />{item.label}{item.label === 'Cross-System Insights' && <span className="ml-auto rounded bg-blue-100 px-1.5 py-0.5 text-[9px] text-blue-700">AI</span>}</button> })}</nav></div>
      <div className="border-t border-slate-200 p-4"><div className="rounded-lg bg-slate-50 p-3"><div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700"><Database className="size-3.5 text-blue-600" />Data coverage</div><div className="mt-2 h-1.5 rounded-full bg-slate-200"><div className="h-full w-[34%] rounded-full bg-blue-600" /></div><div className="mt-2 flex justify-between text-[10px] text-slate-500"><span>3 of 9 sources</span><span>DEMO</span></div></div></div>
    </aside>
  </>
}

function Topbar({ setOpen }: { setOpen: (open: boolean) => void }) { return <header className="flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7"><div className="flex items-center gap-3"><button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="size-5" /></button><div className="hidden items-center gap-2 text-[12px] text-slate-500 sm:flex"><span className="font-medium text-slate-800">Chandigarh, India</span><ChevronDown className="size-3.5" /></div><div className="hidden h-5 w-px bg-slate-200 sm:block" /><div className="flex items-center gap-2 text-[11px] text-slate-500"><span className="size-2 rounded-full bg-emerald-500" />Data refreshed 09:20 IST</div></div><div className="flex items-center gap-2 sm:gap-4"><button className="hidden items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-600 sm:flex"><span>Last 24 hours</span><ChevronDown className="size-3.5" /></button><button className="relative rounded-md p-2 text-slate-500 hover:bg-slate-50" aria-label="Notifications"><Bell className="size-[18px]" /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-blue-600" /></button><div className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">UX</div></div></header> }

function MetricCard({ metric }: { metric: (typeof metrics)[number] }) { return <div className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex items-start justify-between"><div className="text-[11px] font-medium text-slate-500">{metric.label}</div><StatusBadge status={metric.status} /></div><div className="mt-3 flex items-end justify-between"><div className="text-[24px] font-semibold tracking-tight text-slate-900">{metric.value}</div>{metric.trend && <span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600"><ArrowUpRight className="size-3" />{metric.trend}</span>}</div><div className="mt-1 text-[11px] text-slate-500">{metric.detail}</div></div> }

function ChartCard() { return <div className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-start justify-between"><div><div className="text-[13px] font-semibold text-slate-900">Network movement</div><div className="mt-1 text-[11px] text-slate-500">Average speed across monitored corridors · km/h</div></div><div className="flex items-center gap-3 text-[10px] text-slate-500"><span className="flex items-center gap-1"><i className="size-2 rounded-full bg-blue-600" />Observed <StatusBadge status="Demo" /></span><span className="hidden items-center gap-1 sm:flex"><i className="size-2 rounded-full bg-slate-300" />Baseline</span></div></div><div className="mt-5 h-[210px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={trafficTrend} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}><CartesianGrid vertical={false} stroke="#eef1f5" /><XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11 }} /><Line type="monotone" dataKey="observed" stroke="#2563eb" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="baseline" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 4" dot={false} /></LineChart></ResponsiveContainer></div></div> }

function AirCard() { return <div className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-start justify-between"><div><div className="text-[13px] font-semibold text-slate-900">Air quality trend</div><div className="mt-1 text-[11px] text-slate-500">Available station median · AQI</div></div><Wind className="size-4 text-teal-600" /></div><div className="mt-5 flex items-center gap-5"><div><div className="text-[28px] font-semibold tracking-tight text-slate-900">82</div><div className="text-[11px] text-amber-600">Moderate</div></div><div className="h-[110px] min-w-0 flex-1"><ResponsiveContainer width="100%" height="100%"><AreaChart data={airTrend}><defs><linearGradient id="airFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#0f766e" stopOpacity={0.18} /><stop offset="100%" stopColor="#0f766e" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="time" hide /><YAxis hide domain={[60, 110]} /><Area type="monotone" dataKey="value" stroke="#0f766e" fill="url(#airFill)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></div><div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-500"><span>6 available stations</span><span className="text-blue-600">View environment →</span></div></div> }

function MapPanel({ setActive }: { setActive: (label: string) => void }) { return <div className="overflow-hidden rounded-lg border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><div className="text-[13px] font-semibold text-slate-900">City situation map</div><div className="mt-1 text-[11px] text-slate-500">Multi-domain signals across Chandigarh</div></div><button onClick={() => setActive('Urban Map Explorer')} className="flex items-center gap-1 text-[11px] font-semibold text-blue-600">Open explorer <ExternalLink className="size-3" /></button></div><div className="relative isolate z-0 h-[310px]"><UrbanMap compact /><div className="absolute left-4 top-4 z-[500] rounded-md border border-slate-200 bg-white/95 p-3 shadow-sm"><div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Visible layers</div><div className="flex flex-col gap-2 text-[11px] text-slate-700"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-blue-600" />Signals</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-teal-600" />Environment</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-amber-500" />Data gap</span></div></div><div className="absolute bottom-4 right-4 z-[500] rounded-md border border-slate-200 bg-white/95 px-3 py-2 text-[10px] text-slate-500 shadow-sm">Illustrative demo markers</div></div></div> }

function InsightsPanel({ setActive }: { setActive: (label: string) => void }) { return <div className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2 text-[13px] font-semibold text-slate-900"><Sparkles className="size-4 text-blue-600" />Cross-system intelligence</div><div className="mt-1 text-[11px] text-slate-500">Explainable signals from multiple urban domains</div></div><button onClick={() => setActive('Cross-System Insights')} className="text-[11px] font-semibold text-blue-600">View all</button></div><div className="mt-4 flex flex-col gap-3">{insights.slice(0, 2).map((insight) => <div key={insight.title} className="rounded-md border border-slate-100 bg-slate-50/70 p-3"><div className="flex items-start justify-between gap-3"><div className="text-[12px] font-semibold text-slate-800">{insight.title}</div><span className="shrink-0 rounded bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">{insight.confidence}</span></div><p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{insight.description}</p><div className="mt-2 flex items-center gap-2 text-[9px] text-slate-400"><span>{insight.domains.join(' + ')}</span><span>·</span><span>{insight.updated}</span></div></div>)}</div></div> }

type SnapshotObservation = {
  id: string
  metric: string
  value: number
  unit: string
  observed_at: string
  source_id?: string
  data_type?: string
  freshness?: {
    status: string
    age_minutes: number
    max_age_minutes: number
  }
}

type UrbanSnapshot = {
  city: string
  generated_at: string
  data_summary: {
    weather_observations: number
    environment_observations: number
    nearby_road_segments: number
    latest_observation_timestamp: string | null
    freshness_summary: {
      fresh: number
      stale: number
      expired: number
    }
  }
  domains: {
    weather: SnapshotObservation[]
    environment: SnapshotObservation[]
    infrastructure: {
      nearby_road_segments: number
      road_type_breakdown: Array<{
        road_type: string
        segment_count: number
        total_length_meters: number
      }>
    }
  }
  data_quality: {
    traffic_data_available: boolean
    traffic_data_note: string
    spatial_analysis_note: string
    timestamp_note: string
  }
}


function Overview({ setActive }: { setActive: (label: string) => void }) {
  const [snapshot, setSnapshot] = useState<UrbanSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  async function loadSnapshot() {
    try {
      const data = await urbanxFetch<UrbanSnapshot>(
        '/api/analytics/urban-snapshot'
      )
      setSnapshot(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load urban data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSnapshot()
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    setError('')

    try {
      await urbanxFetch('/api/analytics/refresh', { method: 'POST' })
      await loadSnapshot()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Data refresh failed')
    } finally {
      setRefreshing(false)
    }
  }

  const getMetric = (
    observations: SnapshotObservation[] | undefined,
    metric: string
  ) => observations?.find((item) => item.metric === metric)

  const temperature = getMetric(snapshot?.domains.weather, 'temperature')
  const rainfall = getMetric(snapshot?.domains.weather, 'rainfall')
  const humidity = getMetric(snapshot?.domains.weather, 'relative_humidity')
  const wind = getMetric(snapshot?.domains.weather, 'wind_speed_10m')
  const pm25 = getMetric(snapshot?.domains.environment, 'pm2_5')
  const aqi = getMetric(snapshot?.domains.environment, 'us_aqi')

  const cards = [
    {
      label: 'Temperature',
      value: temperature ? `${temperature.value} ${temperature.unit}` : 'Unavailable',
      detail: 'Open-Meteo weather model',
      icon: CloudSun,
    },
    {
      label: 'Rainfall',
      value: rainfall ? `${rainfall.value} ${rainfall.unit}` : 'Unavailable',
      detail: 'Open-Meteo weather model',
      icon: CloudRain,
    },
    {
      label: 'PM2.5',
      value: pm25 ? `${pm25.value} ${pm25.unit}` : 'Unavailable',
      detail: 'Open-Meteo air-quality model',
      icon: Leaf,
    },
    {
      label: 'Nearby road segments',
      value: snapshot
        ? snapshot.data_summary.nearby_road_segments.toLocaleString()
        : 'Unavailable',
      detail: 'OpenStreetMap infrastructure',
      icon: Route,
    },
  ]

  const freshness = snapshot?.data_summary.freshness_summary

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Chandigarh Situation Room</h1>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600">
              {snapshot ? 'Backend Connected' : loading ? 'Connecting' : 'Offline'}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Unified urban intelligence across weather, environment and infrastructure.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh data'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div key={card.label} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 text-2xl font-semibold">
                {loading ? '...' : card.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{card.detail}</p>
            </div>
          )
        })}
      </div>

      {snapshot && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold">Environmental conditions</h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">US AQI</p>
                  <p className="mt-1 text-xl font-semibold">
                    {aqi ? aqi.value : 'Unavailable'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="mt-1 text-xl font-semibold">
                    {humidity ? `${humidity.value} ${humidity.unit}` : 'Unavailable'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Wind speed</p>
                  <p className="mt-1 text-xl font-semibold">
                    {wind ? `${wind.value} ${wind.unit}` : 'Unavailable'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">PM2.5</p>
                  <p className="mt-1 text-xl font-semibold">
                    {pm25 ? `${pm25.value} ${pm25.unit}` : 'Unavailable'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h2 className="font-semibold">Urban infrastructure</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Mapped road network within the analysis area.
              </p>
              <div className="mt-4 text-3xl font-semibold">
                {snapshot.data_summary.nearby_road_segments.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Nearby road segments</p>
              <button
                onClick={() => setActive('Urban Map Explorer')}
                className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
              >
                Explore road network →
              </button>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Data quality and coverage</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {snapshot.data_summary.weather_observations} weather observations ·{' '}
                  {snapshot.data_summary.environment_observations} environmental observations
                </p>
              </div>
              <div className="text-sm">
                <span className="text-emerald-600">{freshness?.fresh ?? 0} fresh</span>
                {' · '}
                <span className="text-amber-600">{freshness?.stale ?? 0} stale</span>
                {' · '}
                <span className="text-red-600">{freshness?.expired ?? 0} expired</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                Weather connected
              </span>
              <span className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                Environment connected
              </span>
              <span className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                Infrastructure connected
              </span>
              <span className="rounded-md bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                Traffic flow unavailable
              </span>
            </div>

            <div className="mt-4 border-t pt-3 text-xs text-muted-foreground">
              Latest observation: {snapshot.data_summary.latest_observation_timestamp ?? 'Unavailable'}
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
            Weather and air-quality values are model-based estimates, not direct local sensor readings.
            Road data represents mapped infrastructure, not traffic congestion.
            Spatial proximity does not establish causation.
          </div>
        </>
      )}

      {!loading && !snapshot && (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          No urban snapshot is currently available. Check the backend connection and try refreshing.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setActive('Urban Map Explorer')}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Open Urban Map Explorer
        </button>
        <button
          onClick={() => setActive('Cross-System Insights')}
          className="rounded-lg border px-4 py-2.5 text-sm font-semibold"
        >
          Explore Cross-System Insights
        </button>
      </div>
    </div>
  )
}


function ModulePage({ active, setActive }: { active: string; setActive: (label: string) => void }) { if (active === 'City Overview') return <Overview setActive={setActive} />; if (active === 'Urban Map Explorer') return <div className="flex flex-col gap-5"><PageHeading title="Urban Map Explorer" eyebrow="Spatial intelligence" description="Explore city geography and multi-domain layers. Live geospatial observations are not connected." /><div className="relative isolate z-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-3"><div className="mb-3 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3"><span className="text-[11px] font-semibold text-slate-700">Layers</span>{['Road network', 'Traffic signals', 'Weather', 'Environment', 'Infrastructure', 'Risk zones'].map((layer, i) => <button key={layer} className={`rounded-md border px-2.5 py-1.5 text-[10px] font-medium ${i < 2 ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}><span className={`mr-1.5 inline-block size-1.5 rounded-full ${i < 2 ? 'bg-blue-600' : 'bg-slate-300'}`} />{layer}</button>)}</div><UrbanMap /></div></div>; if (active === 'Data Sources') return <SourcesPage />; if (active === 'Cross-System Insights') return <InsightsPage />; if (active === 'Simulation Studio') return <SimulationPage />; return <GenericPage active={active} setActive={setActive} /> }

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <div><div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-600">{eyebrow}</div><h1 className="mt-1 text-[23px] font-semibold tracking-tight text-slate-900">{title}</h1><p className="mt-1 text-[12px] text-slate-500">{description}</p></div> }
function GenericPage({ active, setActive }: { active: string; setActive: (label: string) => void }) { return <div className="flex flex-col gap-5"><PageHeading eyebrow="UrbanX workspace" title={active} description="This module is ready for a connected FastAPI data service." /><div className="grid gap-4 md:grid-cols-3"><div className="rounded-lg border border-amber-200 bg-amber-50 p-5 md:col-span-2"><div className="flex gap-3"><ShieldAlert className="size-5 text-amber-600" /><div><div className="text-[13px] font-semibold text-slate-800">Connection required</div><p className="mt-1 max-w-xl text-[11px] leading-relaxed text-slate-600">No live provider or backend is connected for this domain. UrbanX will not substitute unverified sample data for live observations. Configure a FastAPI service to activate this workspace.</p><button onClick={() => setActive('Data Sources')} className="mt-4 rounded-md bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white">Review data sources</button></div></div></div><div className="rounded-lg border border-slate-200 bg-white p-5"><Database className="size-5 text-slate-400" /><div className="mt-4 text-[12px] font-semibold text-slate-800">API contract</div><code className="mt-2 block text-[10px] leading-relaxed text-slate-500">GET /api/{active.toLowerCase().replaceAll(' ', '-').replace('&', 'and')}</code><div className="mt-4 text-[10px] text-slate-400">Server URL: not configured</div></div></div></div> }
function SourcesPage() { return <div className="flex flex-col gap-5"><PageHeading eyebrow="Governance" title="Data sources" description="Registry of candidate providers, coverage, provenance and connection state." /><div className="rounded-lg border border-slate-200 bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4"><div className="flex items-center gap-2 text-[12px] font-semibold text-slate-800"><Database className="size-4 text-blue-600" />Source registry <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{sources.length} candidates</span></div><button className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600"><Download className="size-3.5" />Export registry</button></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Provider</th><th className="px-4 py-3">Domain</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Coverage</th><th className="px-4 py-3">Last updated</th><th className="px-4 py-3">License</th></tr></thead><tbody className="divide-y divide-slate-100 text-[11px]">{sources.map((source) => <tr key={source.name} className="text-slate-600"><td className="px-4 py-3 font-semibold text-slate-800">{source.name}</td><td className="px-4 py-3">{source.domain}</td><td className="px-4 py-3"><StatusBadge status={source.status === 'Connected' ? 'Connected' : 'Unavailable'} /></td><td className="px-4 py-3">{source.coverage}</td><td className="px-4 py-3">{source.updated}</td><td className="px-4 py-3">{source.license}</td></tr>)}</tbody></table></div></div></div> }
function InsightsPage() {
  const [snapshot, setSnapshot] = useState<UrbanSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadInsights() {
      try {
        const data = await urbanxFetch<UrbanSnapshot>(
          '/api/analytics/urban-snapshot'
        )

        if (active) {
          setSnapshot(data)
          setError('')
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Unable to load urban data'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadInsights()

    return () => {
      active = false
    }
  }, [])

  const getMetric = (
    observations: SnapshotObservation[] | undefined,
    metric: string
  ) => observations?.find((item) => item.metric === metric)

  const temperature = getMetric(snapshot?.domains.weather, 'temperature')
  const rainfall = getMetric(snapshot?.domains.weather, 'rainfall')
  const humidity = getMetric(snapshot?.domains.weather, 'relative_humidity')
  const pm25 = getMetric(snapshot?.domains.environment, 'pm2_5')
  const aqi = getMetric(snapshot?.domains.environment, 'us_aqi')
  const no2 = getMetric(snapshot?.domains.environment, 'nitrogen_dioxide')

  const roadBreakdown = snapshot?.domains.infrastructure.road_type_breakdown ?? []

  const dominantRoadType = [...roadBreakdown].sort(
    (a, b) => b.segment_count - a.segment_count
  )[0]

  const findings: Array<{
    title: string
    description: string
    domains: string
  }> = []

  if (temperature && humidity) {
    findings.push({
      title: 'Weather conditions observed',
      description: `The weather model reports ${temperature.value} ${temperature.unit} temperature and ${humidity.value}${humidity.unit} relative humidity. These observations provide atmospheric context for urban analysis.`,
      domains: 'Weather',
    })
  }

  if (rainfall) {
    findings.push({
      title: 'Precipitation context',
      description: `Reported precipitation is ${rainfall.value} ${rainfall.unit}. This is a weather observation, not a measurement of road flooding or disruption.`,
      domains: 'Weather + Infrastructure context',
    })
  }

  if (pm25 && aqi) {
    findings.push({
      title: 'Air quality conditions',
      description: `The air-quality model reports PM2.5 at ${pm25.value} ${pm25.unit} and US AQI at ${aqi.value}. These are model-based estimates, not direct local monitoring-station readings.`,
      domains: 'Environment',
    })
  }

  if (no2) {
    findings.push({
      title: 'Nitrogen dioxide observation',
      description: `The reported nitrogen dioxide estimate is ${no2.value} ${no2.unit}. This adds another environmental indicator to the city snapshot.`,
      domains: 'Environment',
    })
  }

  if (dominantRoadType) {
    findings.push({
      title: 'Road network composition',
      description: `${dominantRoadType.road_type} roads form the largest mapped road category in the analysis area, with ${dominantRoadType.segment_count.toLocaleString()} segments out of ${snapshot?.data_summary.nearby_road_segments.toLocaleString()} nearby segments.`,
      domains: 'Infrastructure',
    })
  }

  const freshness = snapshot?.data_summary.freshness_summary

  return (
    <div className="flex flex-col gap-5">
      <PageHeading
        eyebrow="Urban intelligence"
        title="Cross-System Insights"
        description="Evidence-based context from connected urban domains, with source and data-quality limitations."
      />

      {loading && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">
          Loading urban observations...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Could not load the urban snapshot: {error}
        </div>
      )}

      {snapshot && (
        <>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[13px] font-semibold text-slate-800">
                  Chandigarh urban snapshot
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Shared analysis area · {snapshot.data_summary.nearby_road_segments.toLocaleString()} nearby road segments
                </p>
              </div>
              <StatusBadge status="Connected" />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: 'Temperature',
                  value: temperature
                    ? `${temperature.value} ${temperature.unit}`
                    : 'Unavailable',
                  source: 'Weather model',
                  icon: CloudSun,
                },
                {
                  label: 'PM2.5',
                  value: pm25
                    ? `${pm25.value} ${pm25.unit}`
                    : 'Unavailable',
                  source: 'Air quality model',
                  icon: Wind,
                },
                {
                  label: 'US AQI',
                  value: aqi ? `${aqi.value}` : 'Unavailable',
                  source: 'Estimated index',
                  icon: Activity,
                },
                {
                  label: 'Road segments',
                  value: snapshot.data_summary.nearby_road_segments.toLocaleString(),
                  source: 'OpenStreetMap',
                  icon: Route,
                },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.label}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-500">
                        {item.label}
                      </span>
                      <Icon className="size-4 text-slate-400" />
                    </div>
                    <div className="mt-3 text-xl font-semibold text-slate-900">
                      {item.value}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">
                      {item.source}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-semibold text-slate-800">
                  Generated analytical findings
                </div>
                <StatusBadge status="Connected" />
              </div>

              <p className="mt-1 text-[11px] text-slate-500">
                Rule-based findings generated from the retrieved snapshot.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                {findings.length > 0 ? (
                  findings.map((finding) => (
                    <div
                      key={finding.title}
                      className="rounded-md border border-slate-200 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-md bg-blue-50 p-2">
                          <Sparkles className="size-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12px] font-semibold text-slate-800">
                            {finding.title}
                          </div>
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                            {finding.description}
                          </p>
                          <div className="mt-2 text-[10px] text-slate-400">
                            Domains: {finding.domains}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Not enough observations are available to generate findings.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-800">
                  <Network className="size-4 text-blue-600" />
                  Infrastructure composition
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  {roadBreakdown.slice(0, 6).map((road) => {
                    const percentage =
                      snapshot.data_summary.nearby_road_segments > 0
                        ? (road.segment_count /
                            snapshot.data_summary.nearby_road_segments) *
                          100
                        : 0

                    return (
                      <div key={road.road_type}>
                        <div className="mb-1 flex justify-between text-[10px]">
                          <span className="font-medium text-slate-700">
                            {road.road_type.replaceAll('_', ' ')}
                          </span>
                          <span className="text-slate-500">
                            {road.segment_count.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-800">
                  <Database className="size-4 text-blue-600" />
                  Data freshness
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-emerald-50 p-3">
                    <div className="text-xl font-semibold text-emerald-700">
                      {freshness?.fresh ?? 0}
                    </div>
                    <div className="text-[10px] text-emerald-700">Fresh</div>
                  </div>
                  <div className="rounded-md bg-amber-50 p-3">
                    <div className="text-xl font-semibold text-amber-700">
                      {freshness?.stale ?? 0}
                    </div>
                    <div className="text-[10px] text-amber-700">Stale</div>
                  </div>
                  <div className="rounded-md bg-red-50 p-3">
                    <div className="text-xl font-semibold text-red-700">
                      {freshness?.expired ?? 0}
                    </div>
                    <div className="text-[10px] text-red-700">Expired</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-amber-900">
              <Info className="size-4" />
              Analytical limitations and data provenance
            </div>

            <ul className="mt-3 flex flex-col gap-2 text-[11px] leading-relaxed text-amber-900/80">
              <li>• Weather and air-quality observations are model-based estimates from Open-Meteo, not direct local sensor readings.</li>
              <li>• Road geography comes from OpenStreetMap. Road segment counts do not measure traffic speed or congestion.</li>
              <li>• Live traffic observations are not currently integrated.</li>
              <li>• Spatial proximity and simultaneous observations do not establish causation.</li>
              <li>• Individual observations retain their own timestamps and freshness status.</li>
            </ul>

            <div className="mt-3 border-t border-amber-200 pt-3 text-[10px] text-amber-800">
              Latest observation timestamp:{' '}
              {snapshot.data_summary.latest_observation_timestamp ?? 'Unavailable'}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
function SimulationPage() { const [rain, setRain] = useState(25); return <div className="flex flex-col gap-5"><PageHeading eyebrow="Scenario planning" title="Simulation Studio" description="Explore hypothetical scenarios without presenting them as forecasts." /><div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]"><div className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><div className="text-[13px] font-semibold text-slate-800">Scenario parameters</div><StatusBadge status="Demo" /></div><label className="mt-6 block text-[11px] font-medium text-slate-700" htmlFor="rain">Rainfall intensity <span className="float-right font-semibold text-blue-600">+{rain}%</span></label><input id="rain" type="range" min="0" max="100" value={rain} onChange={(e) => setRain(Number(e.target.value))} className="mt-3 w-full accent-blue-600" /><div className="mt-6 rounded-md bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">Hypothetical estimate based on configured assumptions. No validated hydrological or traffic model is connected.</div><button className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 py-2.5 text-[11px] font-semibold text-white"><FlaskConical className="size-3.5" />Run scenario comparison</button></div><div className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-start justify-between"><div><div className="text-[13px] font-semibold text-slate-800">Baseline vs alternative</div><div className="mt-1 text-[11px] text-slate-500">Illustrative impact index · not a forecast</div></div><span className="rounded bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700">HYPOTHETICAL</span></div><div className="mt-5 h-[230px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{name:'Sector 17', baseline:38, alternative:49}, {name:'Sector 22', baseline:42, alternative:56}, {name:'Sector 34', baseline:28, alternative:39}, {name:'Sector 42', baseline:32, alternative:47}]}><CartesianGrid vertical={false} stroke="#eef1f5" /><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill:'#64748b', fontSize:10 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill:'#94a3b8', fontSize:10 }} /><Tooltip contentStyle={{ border:'1px solid #e2e8f0', borderRadius:6, fontSize:11 }} /><Bar dataKey="baseline" fill="#cbd5e1" radius={[3,3,0,0]} /><Bar dataKey="alternative" fill="#2563eb" radius={[3,3,0,0]} /></BarChart></ResponsiveContainer></div></div></div></div> }

export function UrbanXApp() { const [active, setActive] = useState('City Overview'); const [open, setOpen] = useState(false); return <div className="min-h-screen bg-[#f7f8fa] text-slate-900"><div className="flex min-h-screen"><Sidebar active={active} setActive={setActive} open={open} setOpen={setOpen} /><div className="min-w-0 flex-1"><Topbar setOpen={setOpen} /><main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8"><ModulePage active={active} setActive={setActive} /></main></div></div></div> }
