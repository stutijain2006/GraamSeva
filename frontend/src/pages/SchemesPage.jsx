import { useState, useEffect, useMemo } from "react"
import schemeService from "../services/schemeService"
import { t } from "../lib/i18n"
import { STORAGE_KEYS } from "../constants/appConfig"
import "../styles/SchemesModal.css"

function inferRegionFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.location)
    if (!raw) return ""

    const parsed = JSON.parse(raw)
    const source = [parsed?.state, parsed?.district, parsed?.displayName]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return parsed?.state || ""
  } catch (err) {
    console.warn("Could not read saved location for region schemes:", err)
  }

  return ""
}

export default function SchemesPage({ uiLanguage }) {
  const [schemes, setSchemes] = useState([])
  const [regionalSchemes, setRegionalSchemes] = useState([])
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedScheme, setSelectedScheme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [regionalLoading, setRegionalLoading] = useState(true)

  useEffect(() => {
    setSelectedRegion(inferRegionFromStorage())
  }, [])

  useEffect(() => {
    loadGlobalSchemes()
  }, [uiLanguage])

  useEffect(() => {
    loadRegionalSchemes(selectedRegion)
  }, [selectedRegion, uiLanguage])

  const loadGlobalSchemes = async () => {
    try {
      setLoading(true)
      const result = await schemeService.getAllSchemes(uiLanguage)
      setSchemes(result.data || [])
      console.log(`Schemes loaded from ${result.source}:`, result.data)
    } catch (err) {
      console.error("Failed to load schemes:", err)
      setSchemes([])
    } finally {
      setLoading(false)
    }
  }

  const stateOptions = useMemo(() => {
    const states = new Set()
    ;[...schemes, ...regionalSchemes].forEach((scheme) => {
      ;(scheme.states || []).forEach((s) => {
        const val = String(s || "").trim()
        if (val && val.toLowerCase() !== "all") states.add(val)
      })
    })
    if (selectedRegion) states.add(selectedRegion)
    return Array.from(states).sort((a, b) => a.localeCompare(b))
  }, [schemes, regionalSchemes, selectedRegion])

  const loadRegionalSchemes = async (region) => {
    try {
      setRegionalLoading(true)
      const result = await schemeService.getSchemesByState(region, uiLanguage)
      setRegionalSchemes(result.data || [])
      console.log(`Regional schemes loaded from ${result.source} for ${region}:`, result.data)
    } catch (err) {
      console.error("Failed to load regional schemes:", err)
      setRegionalSchemes([])
    } finally {
      setRegionalLoading(false)
    }
  }

  const handleClick = async (item) => {
    try {
      const result = await schemeService.getSchemeById(item.id, uiLanguage)
      setSelectedScheme(result.data)
    } catch (err) {
      console.error("Failed to load scheme details", err)
    }
  }

  const closeModal = () => setSelectedScheme(null)

  return (
    <div className="card rustic-card">
      <div className="card-content">
        <span className="card-title">{t(uiLanguage, "schemesTitle")}</span>

        <h6 style={{ marginTop: "12px" }}>All India schemes</h6>
        {loading ? (
          <div className="center-align py-4">
            <p>{t(uiLanguage, "schemesLoading")}</p>
          </div>
        ) : (
          <ul className="collection">
            {schemes.map((item) => (
              <li
                key={item.id}
                className="collection-item cursor-pointer hover:bg-gray-100"
                onClick={() => handleClick(item)}
              >
                <strong>{item.name || item.title}</strong>
                <p>{item.desc || item.detail}</p>
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: "18px" }}>
          <h6>Regional schemes</h6>
          <p style={{ margin: "4px 0 10px", fontSize: "0.86rem", color: "#6b5d54" }}>
            Schemes available in the selected region.
          </p>

          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="region-select" style={{ display: "block", marginBottom: "5px", fontWeight: 600 }}>
              Select region
            </label>
            <select
              id="region-select"
              className="browser-default"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{ maxWidth: "280px" }}
            >
              {stateOptions.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {regionalLoading ? (
            <div className="center-align py-3">
              <p>{t(uiLanguage, "schemesLoading")}</p>
            </div>
          ) : regionalSchemes.length === 0 ? (
            <p style={{ color: "#6b5d54", margin: "8px 0 0" }}>
              No specific schemes found for {selectedRegion}.
            </p>
          ) : (
            <ul className="collection">
              {regionalSchemes.map((item) => (
                <li
                  key={`regional-${item.id}`}
                  className="collection-item cursor-pointer hover:bg-gray-100"
                  onClick={() => handleClick(item)}
                >
                  <strong>{item.name || item.title}</strong>
                  <p>{item.desc || item.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {selectedScheme && (
        <div className="scheme-modal-overlay" onClick={closeModal}>
          <div className="scheme-modal" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="scheme-modal-close">
              x
            </button>

            <h3 className="scheme-modal-title">{selectedScheme.name || selectedScheme.title}</h3>
            <p className="scheme-modal-desc">{selectedScheme.desc || selectedScheme.detail}</p>
            <p className="scheme-modal-meta">
              <strong>Government:</strong> {selectedScheme.governmentLevel}
            </p>

            <p className="scheme-modal-section">Benefits</p>
            <ul className="scheme-modal-list">
              {selectedScheme.benefits?.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            <p className="scheme-modal-section">Eligibility</p>
            <ul className="scheme-modal-list">
              <li>Gender: {selectedScheme.eligibility?.gender}</li>
              <li>Marital Status: {selectedScheme.eligibility?.maritalStatus}</li>
              <li>Income Limit: {selectedScheme.eligibility?.incomeLimit}</li>
              <li>Land Requirement: {selectedScheme.eligibility?.landRequired}</li>
            </ul>

            <p className="scheme-modal-section">Documents Required</p>
            <ul className="scheme-modal-list">
              {selectedScheme.documents?.map((doc, i) => (
                <li key={i}>{doc}</li>
              ))}
            </ul>

            <p className="scheme-modal-section">How to Apply</p>
            <ul className="scheme-modal-list scheme-modal-list-last">
              {selectedScheme.howToApply?.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>

            <div className="scheme-modal-actions">
              <button className="scheme-modal-action primary">{t(uiLanguage, "applySubmit")}</button>
              <button className="scheme-modal-action secondary">{t(uiLanguage, "applyTitle")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

