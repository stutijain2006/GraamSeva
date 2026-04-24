import { useState } from "react"
import applicationService from "../services/applicationService"
import { t } from "../lib/i18n"

export default function ApplyPage({ tr, uiLanguage, profile }) {
  const [applicationMode, setApplicationMode] = useState('typing')
  const [applicationForm, setApplicationForm] = useState({
    fullName: profile?.name || '',
    village: '',
    serviceNeeded: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const submitApplication = async (event) => {
    event.preventDefault()

    if (!applicationForm.fullName || !applicationForm.village || !applicationForm.serviceNeeded) {
      window.alert(t(uiLanguage, 'applyRequired'))
      return
    }

    try {
      setSubmitting(true)

      const result = await applicationService.submitApplication({
        ...applicationForm,
        language: uiLanguage,
        mobile: profile?.mobile,
      })

      console.log(`Application submitted from ${result.source}:`, result.data)

      window.alert(t(uiLanguage, 'applySuccess')(result.data.referenceId || 'N/A'))

      setApplicationForm({
        fullName: profile?.name || '',
        village: '',
        serviceNeeded: '',
        notes: '',
      })
    } catch (err) {
      console.error("Failed to submit application:", err)
      window.alert(t(uiLanguage, 'applyError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card rustic-card">
      <div className="card-content">
        <span className="card-title">{t(uiLanguage, 'applyTitle')}</span>

        <div className="mode-row">
          <button
            className={`btn-small ${applicationMode === 'typing' ? 'amber darken-3' : 'brown lighten-1'}`}
            onClick={() => setApplicationMode('typing')}
          >
            {t(uiLanguage, 'applyTyping')}
          </button>
          <button
            className={`btn-small ${applicationMode === 'call' ? 'amber darken-3' : 'brown lighten-1'}`}
            onClick={() => setApplicationMode('call')}
          >
            {t(uiLanguage, 'applyCall')}
          </button>
        </div>

        {applicationMode === 'call' ? (
          <div className="call-box">
            <p>{t(uiLanguage, 'applyCallText')} <strong>1800-120-4455</strong></p>
            <p>{t(uiLanguage, 'applyCallSub')}</p>
          </div>
        ) : (
          <form onSubmit={submitApplication} className="top-gap">
            <div className="input-field">
              <input
                id="fullName"
                value={applicationForm.fullName}
                onChange={(e) => setApplicationForm((prev) => ({ ...prev, fullName: e.target.value }))}
              />
              <label className="active" htmlFor="fullName">{t(uiLanguage, 'applyFullName')}</label>
            </div>
            <div className="input-field">
              <input
                id="village"
                value={applicationForm.village}
                onChange={(e) => setApplicationForm((prev) => ({ ...prev, village: e.target.value }))}
              />
              <label className="active" htmlFor="village">{t(uiLanguage, 'applyVillage')}</label>
            </div>
            <div className="input-field">
              <input
                id="serviceNeeded"
                value={applicationForm.serviceNeeded}
                onChange={(e) => setApplicationForm((prev) => ({ ...prev, serviceNeeded: e.target.value }))}
              />
              <label className="active" htmlFor="serviceNeeded">{t(uiLanguage, 'applyService')}</label>
            </div>
            <div className="input-field">
              <textarea
                id="notes"
                className="materialize-textarea"
                value={applicationForm.notes}
                onChange={(e) => setApplicationForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
              <label className="active" htmlFor="notes">{t(uiLanguage, 'applyNotes')}</label>
            </div>
            <button
              type="submit"
              className="btn waves-effect amber darken-3"
              disabled={submitting}
            >
              {submitting ? t(uiLanguage, 'applySubmitting') : t(uiLanguage, 'applySubmit')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}