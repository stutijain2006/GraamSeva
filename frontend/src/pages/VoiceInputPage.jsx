import { useState } from 'react'
import { voiceService } from '../services'
import '../styles/VoiceInputPage.css'

const LANGUAGE_NAMES = {
  hi: 'हिन्दी',
  bhoj: 'भोजपुरी',
  awa: 'अवधी',
  odi: 'ଓଡିଆ',
  mar: 'मराठी',
  mai: 'मैथिली',
    en: 'English',
}

export default function VoiceInputPage({ language, onComplete, onBack }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [name, setName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [step, setStep] = useState('info') // 'info' or 'recording'
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcriptionSource, setTranscriptionSource] = useState(null)
  let mediaRecorder = null
  let recordingTimeout = null

  const handleStartRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    const interval = setInterval(() => {
      setRecordingTime((t) => {
        if (t >= 60) {
          setIsRecording(false)
          clearInterval(interval)
          handleStopRecording()
          return t
        }
        return t + 1
      })
    }, 1000)
  }

  const handleStopRecording = async () => {
    setIsRecording(false)
    setIsProcessing(true)
    
    try {
      // Try to get audio from microphone, or use mock data
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const chunks = []
      mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' })
        stream.getTracks().forEach((track) => track.stop())
        
        // Call transcription API service
        const result = await voiceService.transcribeAudio(audioBlob, language)
        setTranscript(result.text)
        setTranscriptionSource(result.source)
        setIsProcessing(false)
      }
      
      mediaRecorder.start()
      recordingTimeout = setTimeout(() => {
        mediaRecorder.stop()
      }, 3000)
    } catch (error) {
      console.warn('Microphone access denied, using mock data:', error)
      // Fallback: Use mock data
      const result = await voiceService.transcribeAudio(null, language)
      setTranscript(result.text)
      setTranscriptionSource(result.source)
      setIsProcessing(false)
    }
  }

  const handleContinue = () => {
    if (!name.trim() || !mobileNumber.trim()) {
      alert('कृपया नाम और मोबाइल नंबर भरें')
      return
    }
    setStep('recording')
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    onComplete({
      name,
      mobileNumber,
      language,
      transcript,
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <div className="voice-input-page">
      <div className="voice-header">
        <button className="back-button" onClick={onBack}>
          ← वापस
        </button>
        <h2>GraamSeva - {LANGUAGE_NAMES[language]}</h2>
      </div>

      <div className="voice-content">
        {step === 'info' ? (
          <div className="info-form">
            <h3>कृपया अपनी जानकारी दर्ज करें</h3>

            <div className="form-group">
              <label>आपका नाम</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="नाम लिखें"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>मोबाइल नंबर</label>
              <div className="phone-input-wrapper">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.slice(0, 10))}
                  placeholder="10 अंक दर्ज करें"
                  className="form-input"
                  maxLength="10"
                />
              </div>
            </div>

            <button className="continue-button" onClick={handleContinue}>
              आगे बढ़ें →
            </button>
          </div>
        ) : (
          <div className="voice-recording">
            <div className="recording-box">
              <div className={`voice-icon ${isRecording ? 'recording' : ''}`}>
                🎤
              </div>
              <p className="recording-text">
                {isRecording ? 'रिकॉर्डिंग चल रही है...' : 'अपनी समस्या बताएं'}
              </p>
              {isRecording && (
                <div className="recording-timer">{recordingTime}s</div>
              )}
            </div>

            <div className="recording-controls">
              {!isRecording ? (
                <button
                  className="record-button"
                  onClick={handleStartRecording}
                >
                  🔴 शुरू करें
                </button>
              ) : (
                <button className="stop-button" onClick={handleStopRecording}>
                  ⏹️ बंद करें
                </button>
              )}
            </div>

            {transcript && (
              <div className="transcript-box">
                <h4>आपकी बात:</h4>
                <p className="transcript-text">{transcript}</p>
                <div className="transcript-actions">
                  <button
                    className="re-record-button"
                    onClick={() => {
                      setTranscript('')
                      setRecordingTime(0)
                    }}
                  >
                    🔄 दोबारा रिकॉर्ड करें
                  </button>
                </div>
              </div>
            )}

            {transcript && (
              <button
                className="submit-button"
                onClick={handleSubmit}
                disabled={isProcessing}
              >
                {isProcessing ? '⏳ प्रक्रिया चल रही है...' : '✅ पुष्टि करें'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
