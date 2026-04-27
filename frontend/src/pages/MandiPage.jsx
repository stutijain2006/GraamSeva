import { useState, useEffect, useMemo } from "react"
import mandiService from "../services/mandiService"
import { t } from "../lib/i18n"
import "../styles/MandiPage.css"

export default function MandiPage({ tr, uiLanguage }) {
  const [mandiPrices, setMandiPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState("")
  const [selectedState, setSelectedState] = useState("all")
  const [sortBy, setSortBy] = useState("rising")
  const [dataSource, setDataSource] = useState(null)

  useEffect(() => {
    loadMandiPrices()
  }, [uiLanguage])

  const loadMandiPrices = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await mandiService.getMandiPrices(uiLanguage)
      setMandiPrices(result.data || [])
      setDataSource(result.source)
      console.log(`Mandi prices loaded from ${result.source}:`, result.data)
    } catch (err) {
      console.error("Failed to load mandi prices:", err)
      setError("Unable to load mandi prices right now.")
      setMandiPrices([])
    } finally {
      setLoading(false)
    }
  }

  const stateOptions = useMemo(() => {
    const uniqueStates = Array.from(new Set((mandiPrices || []).map((item) => item.state).filter(Boolean)))
    return ["all", ...uniqueStates]
  }, [mandiPrices])

  const filteredMandiPrices = useMemo(() => {
    const searchText = query.trim().toLowerCase()

    const filtered = (mandiPrices || []).filter((mandi) => {
      const stateMatch = selectedState === "all" || mandi.state === selectedState
      if (!stateMatch) return false

      if (!searchText) return true

      const mandiMatch = String(mandi.mandi || "").toLowerCase().includes(searchText)
      const cropMatch = (mandi.crops || []).some((crop) =>
        String(crop.crop || "").toLowerCase().includes(searchText)
      )

      return mandiMatch || cropMatch
    })

    const trendScore = (mandi) => {
      const crops = mandi.crops || []
      const up = crops.filter((c) => c.trend === "up").length
      const down = crops.filter((c) => c.trend === "down").length
      return up - down
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return String(a.mandi || "").localeCompare(String(b.mandi || ""))
      }
      if (sortBy === "crops") {
        return (b.crops?.length || 0) - (a.crops?.length || 0)
      }
      return trendScore(b) - trendScore(a)
    })

    return sorted
  }, [mandiPrices, query, selectedState, sortBy])

  const summary = useMemo(() => {
    const markets = filteredMandiPrices.length
    const allCrops = filteredMandiPrices.flatMap((m) => m.crops || [])
    const totalCrops = allCrops.length
    const rising = allCrops.filter((c) => c.trend === "up").length

    return { markets, totalCrops, rising }
  }, [filteredMandiPrices])

  const getTrendMeta = (trend) => {
    if (trend === "up") return { label: "Rising", icon: "↗", className: "trend-up" }
    if (trend === "down") return { label: "Falling", icon: "↘", className: "trend-down" }
    return { label: "Stable", icon: "→", className: "trend-stable" }
  }

  if (loading) {
    return (
      <section className="mandi-page rustic-card">
        <header className="mandi-header">
          <h3>{t(uiLanguage, "mandiTitle")}</h3>
          <p>Loading fresh mandi rates...</p>
        </header>
        <div className="mandi-loading-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <article key={index} className="mandi-skeleton-card" />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mandi-page rustic-card">
        <header className="mandi-header">
          <h3>{t(uiLanguage, "mandiTitle")}</h3>
          <p>Market feed unavailable</p>
        </header>
        <div className="mandi-error-box">
          <p>{error}</p>
          <button type="button" className="mandi-refresh-btn" onClick={loadMandiPrices}>
            Retry
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="mandi-page rustic-card">
      <header className="mandi-header">
        <div>
          <h3>{t(uiLanguage, "mandiTitle")}</h3>
          <p>Live mandi pulse across nearby markets</p>
        </div>
        <div className="mandi-header-actions">
          {dataSource && <span className="mandi-source-chip">Source: {dataSource}</span>}
          <button type="button" className="mandi-refresh-btn" onClick={loadMandiPrices}>
            Refresh
          </button>
        </div>
      </header>

      <section className="mandi-summary-grid">
        <article className="mandi-summary-card">
          <span>Markets</span>
          <strong>{summary.markets}</strong>
        </article>
        <article className="mandi-summary-card">
          <span>Crops tracked</span>
          <strong>{summary.totalCrops}</strong>
        </article>
        <article className="mandi-summary-card">
          <span>Rising trends</span>
          <strong>{summary.rising}</strong>
        </article>
      </section>

      <section className="mandi-controls">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search mandi or crop..."
          className="mandi-search"
        />

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="mandi-select"
        >
          {stateOptions.map((state) => (
            <option key={state} value={state}>
              {state === "all" ? "All states" : state}
            </option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="mandi-select">
          <option value="rising">Sort: Trend score</option>
          <option value="name">Sort: Name</option>
          <option value="crops">Sort: Crop count</option>
        </select>
      </section>

      {filteredMandiPrices.length === 0 ? (
        <div className="mandi-empty-box">
          <p>No mandi data matched your filters.</p>
          <button
            type="button"
            className="mandi-refresh-btn"
            onClick={() => {
              setQuery("")
              setSelectedState("all")
              setSortBy("rising")
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="mandi-grid">
          {filteredMandiPrices.map((mandi) => {
            const crops = mandi.crops || []
            const risingCount = crops.filter((crop) => crop.trend === "up").length

            return (
              <article key={mandi.id} className="mandi-card">
                <div className="mandi-card-head">
                  <div>
                    <h4>{mandi.mandi}</h4>
                    <p>{mandi.state}</p>
                  </div>
                  <span className="mandi-rising-pill">{risingCount} rising</span>
                </div>

                <div className="mandi-crop-list">
                  {crops.map((crop, index) => {
                    const trendMeta = getTrendMeta(crop.trend)

                    return (
                      <div key={`${mandi.id}-${crop.crop}-${index}`} className="mandi-crop-row">
                        <div className="mandi-crop-left">
                          <strong>{crop.crop}</strong>
                          <small>{crop.change || "No change"}</small>
                        </div>

                        <div className="mandi-crop-right">
                          <p>{crop.price}</p>
                          <span className={`mandi-trend-pill ${trendMeta.className}`}>
                            {trendMeta.icon} {trendMeta.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}