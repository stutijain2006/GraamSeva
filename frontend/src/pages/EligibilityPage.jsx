import { useState, useEffect } from 'react'
import { eligibilityService } from '../services'
import '../styles/EligibilityPage.css'

export default function EligibilityPage({
  service,
  userProfile,
  language,
  onApplyNow,
  onBack,
}) {
  const [isEligible, setIsEligible] = useState(null)
  const [expandedSection, setExpandedSection] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [dataSource, setDataSource] = useState(null)

  useEffect(() => {
    if (service) {
      loadEligibilityCriteria()
    }
  }, [service, language])

  const loadEligibilityCriteria = async () => {
    setLoading(true)
    try {
      const result = await eligibilityService.getEligibilityCriteria(
        service.id,
        language
      )
      setInfo(result.data)
      setDataSource(result.source)
    } catch (err) {
      console.error('Failed to load criteria:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateEligibility = async () => {
    setChecking(true)
    try {
      const result = await eligibilityService.checkEligibility(
        service.id,
        userProfile,
        language
      )
      setIsEligible(result.eligible)
      setDataSource(result.source)
    } catch (err) {
      console.error('Failed to check eligibility:', err)
      setIsEligible(false)
    } finally {
      setChecking(false)
    }
  }

  if (!service || loading) return null

  return (
    <div className="eligibility-page">
      <div className="eligibility-header">
        <button className="back-button" onClick={onBack}>
          ← वापस
        </button>
        <div className="service-banner">
          <h2>{info.title}</h2>
          <p>{info.description}</p>
        </div>
      </div>

      <div className="eligibility-content">
        {/* Benefits Section */}
        <div className="info-section">
          <button
            className="section-header"
            onClick={() =>
              setExpandedSection(expandedSection === 'benefits' ? null : 'benefits')
            }
          >
            <span className="section-icon">💰</span>
            <span>लाभ</span>
            <span className="expand-icon">
              {expandedSection === 'benefits' ? '▼' : '▶'}
            </span>
          </button>
          {expandedSection === 'benefits' && (
            <div className="section-content">
              {info.benefits.map((benefit, idx) => (
                <div key={idx} className="benefit-item">
                  <span className="check-mark">✓</span>
                  {benefit}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Requirements Section */}
        <div className="info-section">
          <button
            className="section-header"
            onClick={() =>
              setExpandedSection(expandedSection === 'requirements' ? null : 'requirements')
            }
          >
            <span className="section-icon">✅</span>
            <span>योग्यता जांच</span>
            <span className="expand-icon">
              {expandedSection === 'requirements' ? '▼' : '▶'}
            </span>
          </button>
          {expandedSection === 'requirements' && (
            <div className="section-content">
              <button className="check-button" onClick={calculateEligibility}>
                🔍 मेरी योग्यता जांचें
              </button>
              <div className="requirements-list">
                {info.requirements.map((req, idx) => (
                  <div key={idx} className={`requirement-item ${req.status}`}>
                    <span className="status-icon">
                      {req.status === 'verified' ? '✓' : '?'}
                    </span>
                    <span>{req.item}</span>
                    <span className="status-label">
                      {req.status === 'verified' ? 'सत्यापित' : 'लंबित'}
                    </span>
                  </div>
                ))}
              </div>
              {isEligible !== null && (
                <div className={`eligibility-result ${isEligible ? 'eligible' : 'ineligible'}`}>
                  {isEligible ? (
                    <>
                      <h4>🎉 आप पात्र हैं!</h4>
                      <p>आप इस योजना के लिए आवेदन कर सकते हैं</p>
                    </>
                  ) : (
                    <>
                      <h4>ℹ️ कुछ शर्तें पूरी नहीं हैं</h4>
                      <p>अधिक जानकारी के लिए पंचायत से संपर्क करें</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="info-section">
          <button
            className="section-header"
            onClick={() =>
              setExpandedSection(expandedSection === 'documents' ? null : 'documents')
            }
          >
            <span className="section-icon">📄</span>
            <span>आवश्यक दस्तावेज़</span>
            <span className="expand-icon">
              {expandedSection === 'documents' ? '▼' : '▶'}
            </span>
          </button>
          {expandedSection === 'documents' && (
            <div className="section-content">
              {info.documents.map((doc, idx) => (
                <div key={idx} className="document-item">
                  <span>📋</span> {doc}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Steps Section */}
        <div className="info-section">
          <button
            className="section-header"
            onClick={() =>
              setExpandedSection(expandedSection === 'steps' ? null : 'steps')
            }
          >
            <span className="section-icon">👣</span>
            <span>अगले कदम</span>
            <span className="expand-icon">
              {expandedSection === 'steps' ? '▼' : '▶'}
            </span>
          </button>
          {expandedSection === 'steps' && (
            <div className="section-content">
              <p className="next-steps">{info.nextSteps}</p>
            </div>
          )}
        </div>
      </div>

      <div className="eligibility-footer">
        <button className="apply-button" onClick={onApplyNow}>
          आवेदन शुरू करें →
        </button>
        <p className="footer-text">
          सभी क्षेत्र विकास अधिकारी से मुक्त सहायता प्राप्त करें
        </p>
      </div>
    </div>
  )
}
