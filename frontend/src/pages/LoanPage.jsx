import { useState, useEffect, useMemo } from "react"
import loanService from "../services/loanService"
import { STORAGE_KEYS } from "../constants/appConfig"
import "../styles/LoanComparison.css"

const DEFAULT_LOAN_AMOUNT = 200000

function calculateLoanBreakdown(principal, annualRate, months, processingFeePercent) {
  const monthlyRate = annualRate / 100 / 12

  if (!principal || principal <= 0 || !months || months <= 0) {
    return { emi: 0, totalPayable: 0, totalInterest: 0, processingFee: 0, installmentCount: months || 0 }
  }

  const emi =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)

  const totalEmiPayable = emi * months
  const processingFee = principal * (processingFeePercent / 100)
  const totalPayable = totalEmiPayable + processingFee

  return {
    emi: Math.round(emi),
    totalPayable: Math.round(totalPayable),
    totalInterest: Math.round(totalEmiPayable - principal),
    processingFee: Math.round(processingFee),
    installmentCount: months,
  }
}

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`
const callFn = (fn, ...args) => (typeof fn === "function" ? fn(...args) : fn)

export default function LoanPage({ tr, uiLanguage, userLocation, profile }) {
  const [loanOptions, setLoanOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [nearbyLoading, setNearbyLoading] = useState(true)
  const [nearbySource, setNearbySource] = useState(null)
  const [loanAmount, setLoanAmount] = useState(DEFAULT_LOAN_AMOUNT)
  const [nearbyOffers, setNearbyOffers] = useState([])
  const [selectedNearbyOffer, setSelectedNearbyOffer] = useState(null)
  const [selectedGlobalOption, setSelectedGlobalOption] = useState(null)
  const [globalLoanAmount, setGlobalLoanAmount] = useState(DEFAULT_LOAN_AMOUNT)
  const [locationLabel, setLocationLabel] = useState(null)
  const [locationData, setLocationData] = useState(null)
  const [profileData, setProfileData] = useState(null)

  useEffect(() => {
    loadLoanOptions()
  }, [uiLanguage])

  useEffect(() => {
    try {
      const rawLocation = localStorage.getItem(STORAGE_KEYS.location)
      if (rawLocation) {
        const parsed = JSON.parse(rawLocation)
        setLocationData(parsed)
        setLocationLabel(parsed?.village || parsed?.district || parsed?.state || parsed?.displayName || null)
      }
    } catch {
      setLocationData(null)
      setLocationLabel(null)
    }

    try {
      const rawProfile = localStorage.getItem(STORAGE_KEYS.profile)
      setProfileData(rawProfile ? JSON.parse(rawProfile) : (profile || null))
    } catch {
      setProfileData(profile || null)
    }
  }, [profile])

  useEffect(() => {
    const lat = userLocation?.lat ?? userLocation?.latitude
    const lng = userLocation?.lng ?? userLocation?.longitude
    if (!lat || !lng) return

    const mergedLocation = {
      ...(locationData || {}),
      ...userLocation,
      lat,
      lng,
      latitude: lat,
      longitude: lng,
      displayName: userLocation?.displayName || `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`,
      source: userLocation?.source || "browser",
    }

    setLocationData(mergedLocation)
    setLocationLabel(mergedLocation?.village || mergedLocation?.district || mergedLocation?.state || mergedLocation?.displayName || null)

    try {
      const existingRaw = localStorage.getItem(STORAGE_KEYS.location)
      const existing = existingRaw ? JSON.parse(existingRaw) : {}
      localStorage.setItem(STORAGE_KEYS.location, JSON.stringify({ ...existing, ...mergedLocation }))
    } catch {
      // no-op
    }
  }, [userLocation?.lat, userLocation?.lng, userLocation?.latitude, userLocation?.longitude])

  useEffect(() => {
    loadNearbyOffers()
  }, [uiLanguage, locationData?.lat, locationData?.lng, locationData?.latitude, locationData?.longitude, locationData?.state, loanAmount, profileData?.name, profileData?.language])

  const loadLoanOptions = async () => {
    try {
      setLoading(true)
      const result = await loanService.getLoanOptions(uiLanguage)
      setLoanOptions(result.data || [])
      console.log(`Loan options loaded from ${result.source}:`, result.data)
    } catch (err) {
      console.error("Failed to load loan options:", err)
      setLoanOptions([])
    } finally {
      setLoading(false)
    }
  }

  const loadNearbyOffers = async () => {
    try {
      setNearbyLoading(true)
      const result = await loanService.getNearbyLoanComparisons(uiLanguage, {
        location: locationData || userLocation || null,
        profile: profileData || profile || null,
        requestedAmount: loanAmount,
      })
      setNearbyOffers(result.data || [])
      setNearbySource(result.source || null)
      console.log(`Nearby offers loaded from ${result.source}:`, result.data)
    } catch (err) {
      console.error("Failed to load nearby offers:", err)
      setNearbyOffers([])
      setNearbySource(null)
    } finally {
      setNearbyLoading(false)
    }
  }

  const nearbyLoanComparisons = useMemo(() => {
    return nearbyOffers.map((offer) => ({
      ...offer,
      breakdown: calculateLoanBreakdown(Number(loanAmount), offer.annualInterestRate, offer.tenureMonths, offer.processingFeePercent),
    }))
  }, [nearbyOffers, loanAmount])

  const parseAnnualRate = (option) => {
    const src = `${option?.interest || ""} ${option?.detail || ""}`
    const match = src.match(/(\d+(\.\d+)?)\s*%/)
    return match ? Number(match[1]) : 8.5
  }

  const parseTenureMonths = (option) => {
    const src = `${option?.tenure || ""} ${option?.detail || ""}`.toLowerCase()
    const ym = src.match(/(\d+)\s*-\s*(\d+)\s*year|(\d+)\s*year/)
    if (ym) return Number(ym[2] || ym[3] || ym[1] || 3) * 12
    const mm = src.match(/(\d+)\s*-\s*(\d+)\s*month|(\d+)\s*month/)
    if (mm) return Number(mm[2] || mm[3] || mm[1] || 36)
    return 36
  }

  const getGlobalDocuments = (option) => {
    const t = (option?.title || "").toLowerCase()
    if (t.includes("crop")) return ["Aadhaar Card", "Land/Crop Proof", "Bank Passbook", "Recent Photograph"]
    if (t.includes("equipment") || t.includes("tractor")) return ["Aadhaar + PAN", "Land Ownership/Lease Proof", "Income Certificate", "Quotation of Equipment"]
    return ["Aadhaar Card", "Address Proof", "Income Proof", "Bank Statement (6 months)", "Photograph"]
  }

  const nearbySubtitle = callFn(tr.loanNearbySubtitle, locationLabel)

  const selectedBreakdown = selectedNearbyOffer
    ? calculateLoanBreakdown(Number(loanAmount), selectedNearbyOffer.annualInterestRate, selectedNearbyOffer.tenureMonths, selectedNearbyOffer.processingFeePercent)
    : null

  const selectedGlobalBreakdown = selectedGlobalOption
    ? calculateLoanBreakdown(Number(globalLoanAmount), parseAnnualRate(selectedGlobalOption), parseTenureMonths(selectedGlobalOption), 0.5)
    : null

  return (
    <div className="card rustic-card">
      <div className="card-content">
        <span className="card-title">{tr.loanTitle}</span>
        <p className="mb-4 text-gray-600">{tr.loanSubtitle}</p>

        {loading ? (
          <div className="center-align py-4">
            <p>{tr.loanLoading}</p>
          </div>
        ) : (
          <ul className="collection top-gap">
            {loanOptions.map((item) => (
              <li key={item.id || item.title} className="collection-item">
                <div className="mb-2">
                  <strong className="text-lg">{item.title}</strong>
                  <div className="flex flex-col gap-3 mt-1 text-xs">
                    <span className="bg-blue-100 px-2 py-1 rounded">Amount: {item.amount}</span>
                    <span className="bg-green-100 px-2 py-1 rounded">Interest: {item.interest}</span>
                    <span className="bg-yellow-100 px-2 py-1 rounded">Tenure: {item.tenure}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{item.detail}</p>
                {item.eligibility && (
                  <p className="text-xs text-gray-500 mt-1">
                    <strong>{tr.loanEligibility}</strong> {item.eligibility}
                  </p>
                )}
                <div className="global-option-actions">
                  <button
                    className="nearby-details-btn"
                    onClick={() => {
                      setSelectedGlobalOption(item)
                      setGlobalLoanAmount(DEFAULT_LOAN_AMOUNT)
                    }}
                  >
                    {tr.loanViewDetails}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <section className="nearby-loan-section top-gap">
          <div className="nearby-loan-head">
            <h4>{tr.loanNearbyTitle}</h4>
            <p>{nearbySubtitle}</p>
            {nearbySource && <p className="text-xs text-gray-500">Data source: {nearbySource}</p>}
          </div>

          <div className="nearby-loan-input-row">
            <label htmlFor="loan-amount">{tr.loanAmount}</label>
            <input
              id="loan-amount"
              type="number"
              min="10000"
              step="1000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value || 0)))}
            />
          </div>

          {nearbyLoading ? (
            <div className="center-align py-3">
              <p>{tr.loanLoading}</p>
            </div>
          ) : nearbyLoanComparisons.length === 0 ? (
            <div className="center-align py-3">
              <p>No nearby bank offers found for your current location.</p>
            </div>
          ) : (
            <div className="nearby-loan-grid">
              {nearbyLoanComparisons.map((offer) => (
                <article className="nearby-loan-card" key={offer.id}>
                  <div className="nearby-loan-card-head">
                    <strong>{offer.bankName}</strong>
                    <small>{offer.branch}</small>
                  </div>
                  <div className="nearby-tags">
                    <span>{offer.distanceKm} km</span>
                    <span>{callFn(tr.loanEstRate, offer.annualInterestRate)}</span>
                    <span>{callFn(tr.loanEstTenure, offer.tenureMonths)}</span>
                  </div>
                  <div className="nearby-metrics">
                    <p>{tr.loanMonthlyEmi}: <strong>{formatCurrency(offer.breakdown.emi)}</strong></p>
                    <p>{tr.loanFinalPayable}: <strong>{formatCurrency(offer.breakdown.totalPayable)}</strong></p>
                  </div>
                  <button className="nearby-details-btn" onClick={() => setSelectedNearbyOffer(offer)}>
                    {tr.loanViewFull}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedNearbyOffer && selectedBreakdown && (
        <div className="nearby-loan-modal-overlay" onClick={() => setSelectedNearbyOffer(null)}>
          <div className="nearby-loan-modal" onClick={(e) => e.stopPropagation()}>
            <button className="nearby-loan-close" onClick={() => setSelectedNearbyOffer(null)}>
              {tr.loanClose}
            </button>

            <h3>{selectedNearbyOffer.bankName}</h3>
            <p className="nearby-loan-modal-sub">{selectedNearbyOffer.branch}</p>

            <div className="nearby-loan-summary-grid">
              <p>{tr.loanReqAmount}: <strong>{formatCurrency(loanAmount)}</strong></p>
              <p>{tr.loanInterestRate}: <strong>{callFn(tr.loanEstRate, selectedNearbyOffer.annualInterestRate)}</strong></p>
              <p>{tr.loanTenure}: <strong>{callFn(tr.loanEstTenure, selectedNearbyOffer.tenureMonths)}</strong></p>
              <p>{tr.loanInstallments}: <strong>{selectedBreakdown.installmentCount}</strong></p>
              <p>{tr.loanMonthlyEmi}: <strong>{formatCurrency(selectedBreakdown.emi)}</strong></p>
              <p>{tr.loanTotalInterest}: <strong>{formatCurrency(selectedBreakdown.totalInterest)}</strong></p>
              <p>{tr.loanProcessingFee}: <strong>{formatCurrency(selectedBreakdown.processingFee)}</strong></p>
              <p>{tr.loanFinalPayable}: <strong>{formatCurrency(selectedBreakdown.totalPayable)}</strong></p>
            </div>

            <p className="nearby-loan-modal-section">{tr.loanConditions}</p>
            <ul className="nearby-loan-list">
              <li>{callFn(tr.loanRange, formatCurrency(selectedNearbyOffer.minAmount), formatCurrency(selectedNearbyOffer.maxAmount))}</li>
              <li>{callFn(tr.loanPrepayment, selectedNearbyOffer.prepayment)}</li>
              {selectedNearbyOffer.address && <li>Address: {selectedNearbyOffer.address}</li>}
              {selectedNearbyOffer.contactPhone && <li>Contact: {selectedNearbyOffer.contactPhone}</li>}
              {selectedNearbyOffer.managerName && <li>Officer: {selectedNearbyOffer.managerName}</li>}
              {selectedNearbyOffer.workingHours && <li>Hours: {selectedNearbyOffer.workingHours}</li>}
              {selectedNearbyOffer.website && (
                <li>
                  Website: <a href={selectedNearbyOffer.website} target="_blank" rel="noreferrer">{selectedNearbyOffer.website}</a>
                </li>
              )}
              {selectedNearbyOffer.aiSummary && <li>Summary: {selectedNearbyOffer.aiSummary}</li>}
            </ul>

            <p className="nearby-loan-modal-section">{tr.loanDocsRequired}</p>
            <ul className="nearby-loan-list">
              {(selectedNearbyOffer.documents || []).map((doc) => <li key={doc}>{doc}</li>)}
            </ul>
          </div>
        </div>
      )}

      {selectedGlobalOption && selectedGlobalBreakdown && (
        <div className="nearby-loan-modal-overlay" onClick={() => setSelectedGlobalOption(null)}>
          <div className="nearby-loan-modal" onClick={(e) => e.stopPropagation()}>
            <button className="nearby-loan-close" onClick={() => setSelectedGlobalOption(null)}>
              {tr.loanClose}
            </button>

            <h3>{selectedGlobalOption.title}</h3>
            <p className="nearby-loan-modal-sub">{selectedGlobalOption.detail}</p>

            <div className="nearby-loan-input-row">
              <label htmlFor="global-loan-amount">{tr.loanAmount}</label>
              <input
                id="global-loan-amount"
                type="number"
                min="10000"
                step="1000"
                value={globalLoanAmount}
                onChange={(e) => setGlobalLoanAmount(Math.max(0, Number(e.target.value || 0)))}
              />
            </div>

            <div className="nearby-loan-summary-grid">
              <p>{tr.loanReqAmount}: <strong>{formatCurrency(globalLoanAmount)}</strong></p>
              <p>{tr.loanInterestRate}: <strong>{callFn(tr.loanEstRate, parseAnnualRate(selectedGlobalOption))}</strong></p>
              <p>{tr.loanTenure}: <strong>{callFn(tr.loanEstTenure, parseTenureMonths(selectedGlobalOption))}</strong></p>
              <p>{tr.loanInstallments}: <strong>{selectedGlobalBreakdown.installmentCount}</strong></p>
              <p>{tr.loanMonthlyEmi}: <strong>{formatCurrency(selectedGlobalBreakdown.emi)}</strong></p>
              <p>{tr.loanTotalInterest}: <strong>{formatCurrency(selectedGlobalBreakdown.totalInterest)}</strong></p>
              <p>{tr.loanProcessingFee}: <strong>{formatCurrency(selectedGlobalBreakdown.processingFee)}</strong></p>
              <p>{tr.loanFinalPayable}: <strong>{formatCurrency(selectedGlobalBreakdown.totalPayable)}</strong></p>
            </div>

            <p className="nearby-loan-modal-section">{tr.loanEligibility}</p>
            <ul className="nearby-loan-list">
              <li>{selectedGlobalOption.eligibility || tr.loanEligibilityFallback}</li>
            </ul>

            <p className="nearby-loan-modal-section">{tr.loanDocsRequired}</p>
            <ul className="nearby-loan-list">
              {getGlobalDocuments(selectedGlobalOption).map((doc) => <li key={doc}>{doc}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
