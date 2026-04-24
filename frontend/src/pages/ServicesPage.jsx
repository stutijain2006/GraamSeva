import { useState, useEffect } from 'react'
import { schemeService } from '../services'
import '../styles/ServicesPage.css'

export default function ServicesPage({
  userProfile,
  language,
  onServiceSelect,
  onBack,
}) {
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dataSource, setDataSource] = useState(null)

  useEffect(() => {
    loadSchemes()
  }, [language])

  const loadSchemes = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Loading schemes...')
      const result = await schemeService.getAllSchemes(language)
      setSchemes(result.data)
      setDataSource(result.source)
      console.log(`Schemes loaded from ${result.source}`)
    } catch (err) {
      console.error('Failed to load schemes:', err)
      setError('Unable to load schemes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="services-page loading-state">
        <div className="loading-spinner">⏳ योजनाएं लोड की जा रही हैं...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="services-page error-state">
        <div className="error-message">
          <p>❌ {error}</p>
          <button className="retry-button" onClick={loadSchemes}>
            दोबारा कोशिश करें
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="services-page">
      <div className="services-header">
        <button className="back-button" onClick={onBack}>
          ← वापस
        </button>
        <div className="user-greeting">
          <h2>नमस्ते, {userProfile.name}! 👋</h2>
          <p className="subtitle">उपलब्ध सरकारी योजनाएं:</p>
          {dataSource && (
            <p className="data-source-hint">
              {dataSource === 'api' ? '✓ लाइव डेटा' : '📱 ऑफलाइन डेटा'}
            </p>
          )}
        </div>
      </div>

      <div className="services-content">
        <div className="services-list">
          {schemes.map((service) => (
            <div
              key={service.id}
              className={`service-card ${
                !service.eligible ? 'not-eligible' : ''
              }`}
            >
              <div className="service-icon">{service.icon}</div>
              <div className="service-info">
                <h3>{service.name}</h3>
                <p className="service-desc">{service.desc}</p>
                <p className="service-details">{service.details}</p>
              </div>
              <div className="service-status">
                {service.eligible ? (
                  <span className="badge eligible">
                    ✓ पात्र हो सकते हैं
                  </span>
                ) : (
                  <span className="badge not-eligible">
                    ✗ पात्र नहीं
                  </span>
                )}
              </div>
              <button
                className={`service-action ${
                  !service.eligible ? 'disabled' : ''
                }`}
                onClick={() => service.eligible && onServiceSelect(service)}
                disabled={!service.eligible}
              >
                जानकारी लें →
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="services-footer">
        <p>
          💡 तुरंत सहायता के लिए: <strong>1234-567-8900</strong> पर कॉल करें
        </p>
      </div>
    </div>
  )
}
