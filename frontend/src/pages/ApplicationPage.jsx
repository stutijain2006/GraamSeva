import { useState } from 'react'
import { applicationService } from '../services'
import '../styles/ApplicationPage.css'

export default function ApplicationPage({
  tr,
  service,
  userProfile,
  language,
  onBack,
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    landArea: '',
    landType: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    familyMembers: '',
    annualIncome: '',
  })
  const [submitted, setSubmitted]               = useState(false)
  const [submitting, setSubmitting]             = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [dataSource, setDataSource]             = useState(null)

  const totalSteps = 3

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = () => { if (currentStep < totalSteps) setCurrentStep(currentStep + 1) }
  const handlePrev = () => { if (currentStep > 1) setCurrentStep(currentStep - 1) }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const result = await applicationService.submitApplication(
        { schemeId: service.id, schemeName: service.name, userProfile, formData, language },
        language
      )
      setSubmissionResult(result)
      setDataSource(result.source)
      setSubmitted(true)
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success screen ──
  if (submitted && submissionResult) {
    return (
      <div className="application-page success">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h2>{tr.appSuccessTitle}</h2>
          <div className="success-details">
            <p>
              {tr.appRefNo}{' '}
              <span className="reference-number">{submissionResult.referenceId}</span>
            </p>
            <p>{tr.appSmsNote}</p>
            <p className="timeline">
              {tr.appTimeline
                ? tr.appTimeline(submissionResult.data.expectedApprovalTime || tr.appTimelineFallback)
                : `⏱️ ${submissionResult.data.expectedApprovalTime || tr.appTimelineFallback}`}
            </p>
            {dataSource && (
              <p className="data-source-hint">
                {dataSource === 'api' ? tr.appViaApi : tr.appOffline}
              </p>
            )}
          </div>

          <div className="next-steps-box">
            <h4>{tr.appNextStepsTitle}</h4>
            <ul>
              {(submissionResult.data.nextSteps || []).map((step, idx) => (
                <li key={idx}>✓ {step}</li>
              ))}
            </ul>
          </div>

          <button className="new-application-button" onClick={() => window.location.reload()}>
            {tr.appNewApplication}
          </button>
        </div>
      </div>
    )
  }

  // ── Form ──
  return (
    <div className="application-page">
      <div className="app-header">
        <button className="back-button" onClick={onBack}>
          {tr.appBack}
        </button>
        <h2>{tr.appFormTitle}</h2>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
      </div>

      <p className="step-indicator">
        {typeof tr.appStepOf === 'function'
          ? tr.appStepOf(currentStep, totalSteps)
          : `${currentStep} / ${totalSteps}`}
      </p>

      <div className="form-container">

        {/* Step 1: Land Information */}
        {currentStep === 1 && (
          <div className="form-step">
            <h3>{tr.appStep1Title}</h3>

            <div className="form-group">
              <label>{tr.appLandArea}</label>
              <select name="landArea" value={formData.landArea} onChange={handleInputChange} className="form-input">
                <option value="">{tr.appChoose}</option>
                <option value="0.5">{tr.appLandHalf}</option>
                <option value="1">{tr.appLandOne}</option>
                <option value="1.5">{tr.appLandOneHalf}</option>
                <option value="2">{tr.appLandTwo}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{tr.appLandType}</label>
              <select name="landType" value={formData.landType} onChange={handleInputChange} className="form-input">
                <option value="">{tr.appChoose}</option>
                <option value="owned">{tr.appLandOwned}</option>
                <option value="leased">{tr.appLandLeased}</option>
                <option value="shared">{tr.appLandShared}</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Bank Information */}
        {currentStep === 2 && (
          <div className="form-step">
            <h3>{tr.appStep2Title}</h3>

            <div className="form-group">
              <label>{tr.appBankName}</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                placeholder={tr.appBankPlaceholder}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>{tr.appAccountNo}</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder={tr.appAccountPlaceholder}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>{tr.appIfsc}</label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleInputChange}
                placeholder={tr.appIfscPlaceholder}
                className="form-input"
              />
            </div>
          </div>
        )}

        {/* Step 3: Family Information */}
        {currentStep === 3 && (
          <div className="form-step">
            <h3>{tr.appStep3Title}</h3>

            <div className="form-group">
              <label>{tr.appFamilyMembers}</label>
              <select name="familyMembers" value={formData.familyMembers} onChange={handleInputChange} className="form-input">
                <option value="">{tr.appChoose}</option>
                <option value="1">{typeof tr.appPerson === 'function' ? tr.appPerson(1) : '1'}</option>
                <option value="2">{typeof tr.appPersonPlural === 'function' ? tr.appPersonPlural(2) : '2'}</option>
                <option value="3">{typeof tr.appPersonPlural === 'function' ? tr.appPersonPlural(3) : '3'}</option>
                <option value="4">{typeof tr.appPersonPlural === 'function' ? tr.appPersonPlural(4) : '4'}</option>
                <option value="5+">{tr.appFiveOrMore}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{tr.appAnnualIncome}</label>
              <select name="annualIncome" value={formData.annualIncome} onChange={handleInputChange} className="form-input">
                <option value="">{tr.appChoose}</option>
                <option value="100000">{tr.appIncome1}</option>
                <option value="200000">{tr.appIncome2}</option>
                <option value="300000">{tr.appIncome3}</option>
                <option value="500000">{tr.appIncome5}</option>
              </select>
            </div>

            <div className="terms-box">
              <input type="checkbox" id="terms" className="terms-checkbox" />
              <label htmlFor="terms" className="terms-label">
                {tr.appTerms}
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button className="prev-button" onClick={handlePrev} disabled={currentStep === 1}>
          {tr.appPrev}
        </button>
        {currentStep < totalSteps ? (
          <button className="next-button" onClick={handleNext}>
            {tr.appNext}
          </button>
        ) : (
          <button className="submit-button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? tr.appSubmitting : tr.appSubmit}
          </button>
        )}
      </div>
    </div>
  )
}