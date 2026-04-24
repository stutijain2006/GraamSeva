import { LANGUAGES } from '../constants/appConfig'

export default function OnboardingPage({ tr, profile, setProfile, onboardingStep, setOnboardingStep, onSubmit }) {
  return (
    <div className="onboarding-wrap">
      <div className="card onboarding-card">
        <div className="card-content">
          <h4>{tr.appName}</h4>
          <p>{tr.appTagline}</p>

          {onboardingStep === 'language' ? (
            <div className="top-gap">
              <p className="section-label">{tr.chooseLanguage}</p>
              <div className="chip-grid">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    className={`chip selectable-chip ${profile.language === lang.code ? 'selected-chip' : ''}`}
                    onClick={() => {
                      setProfile((prev) => ({ ...prev, language: lang.code }))
                      setOnboardingStep('profile')
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="top-gap">
              <div className="input-field">
                <input id="name" value={profile.name} onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))} />
                <label className="active" htmlFor="name">{tr.name}</label>
              </div>
              <div className="input-field">
                <input
                  id="mobile"
                  value={profile.mobile}
                  maxLength={10}
                  onChange={(e) => setProfile((prev) => ({ ...prev, mobile: e.target.value.replace(/\D/g, '') }))}
                />
                <label className="active" htmlFor="mobile">{tr.mobile}</label>
              </div>
              <button className="btn waves-effect amber darken-3" type="submit">{tr.continue}</button>
              <button type="button" className="btn-flat" onClick={() => setOnboardingStep('language')}>{tr.back}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}