import { useState, useEffect } from 'react'
import { PAGES, STORAGE_KEYS } from '../constants/appConfig'
import newSchemesOffersService from '../services/newSchemesOffers'
import '../styles/HomePage.css'

export default function HomePage({ tr, onNavigate, uiLanguage, profile }) {
  const [newOffers, setNewOffers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNewOffers()
  }, [uiLanguage, profile?.name, profile?.language])

  const loadNewOffers = async () => {
    try {
      setLoading(true)

      let location = null
      try {
        const rawLocation = localStorage.getItem(STORAGE_KEYS.location)
        location = rawLocation ? JSON.parse(rawLocation) : null
      } catch {
        location = null
      }

      const result = await newSchemesOffersService.getNewSchemes(uiLanguage, { profile, location })
      setNewOffers(result.data || [])
      console.log(`New offers loaded from ${result.source}:`, result.data)
    } catch (err) {
      console.error('Failed to load new offers:', err)
      setNewOffers([])
    } finally {
      setLoading(false)
    }
  }

  const latestUpdates = newOffers.filter((offer) => offer.type === 'new' || offer.type === 'update')
  const regularUpdates = newOffers.filter((offer) => offer.type !== 'new' && offer.type !== 'update')
  const homeOptions = PAGES.filter((page) => page.id !== 'home')

  return (
    <div className="home-layout">
      <section className="home-updates-panel rustic-card">
        <div className="home-panel-head">
          <h3>{tr.homeUpdatesTitle}</h3>
          <span>{newOffers.length}</span>
        </div>

        {loading ? (
          <p className="home-loading-text">{tr.homeLoadingUpdates}</p>
        ) : (
          <div className="updates-columns">
            <div className="updates-column">
              <h4>{tr.homeUpdatesTitle}</h4>
              <div className="updates-list">
                {latestUpdates.map((offer) => (
                  <article key={offer.id} className="update-item">
                    <div className="update-item-head">
                      <strong>{offer.title}</strong>
                      <span title={offer.badge}>{offer.badge}</span>
                    </div>
                    <p>{offer.desc}</p>
                    {offer.date && <small>{offer.date}</small>}
                    {offer.sourceName && !String(offer.sourceName).toLowerCase().includes("graamseva") && (
                      <small>{offer.sourceName}</small>
                    )}
                    {offer.url && (
                      <small>
                        <a href={offer.url} target="_blank" rel="noreferrer">Source</a>
                      </small>
                    )}
                  </article>
                ))}
                {latestUpdates.length === 0 && <p className="home-empty-text">{tr.homeNoUpdates}</p>}
              </div>
            </div>

            <div className="updates-column">
              <h4>{tr.homeRegularTitle}</h4>
              <div className="updates-list">
                {regularUpdates.map((offer) => (
                  <article key={offer.id} className="update-item regular">
                    <div className="update-item-head">
                      <strong>{offer.title}</strong>
                      <span title={offer.badge}>{offer.badge}</span>
                    </div>
                    <p>{offer.desc}</p>
                    {offer.date && <small>{offer.date}</small>}
                    {offer.sourceName && !String(offer.sourceName).toLowerCase().includes("graamseva") && (
                      <small>{offer.sourceName}</small>
                    )}
                    {offer.url && (
                      <small>
                        <a href={offer.url} target="_blank" rel="noreferrer">Source</a>
                      </small>
                    )}
                  </article>
                ))}
                {regularUpdates.length === 0 && <p className="home-empty-text">{tr.homeRegularEmpty}</p>}
              </div>
            </div>
          </div>
        )}
      </section>

      <aside className="home-options-panel rustic-card">
        <div className="home-panel-head">
          <h3>{tr.homeOptionsTitle}</h3>
          <span>{homeOptions.length}</span>
        </div>

        <p className="home-options-hint">{tr.homeOptionsHint}</p>

        <div className="service-grid home-service-grid">
          {homeOptions.map((page) => (
            <button key={page.id} className="card service-card" onClick={() => onNavigate(page.id)}>
              <div className="card-content">
                <span className="material-icons">{page.icon}</span>
                <h6>{tr.pages[page.id]}</h6>
                <p>
                  {tr.pages[page.id]} {tr.homeOpen}
                </p>
              </div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}
