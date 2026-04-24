import { useEffect, useMemo, useState } from "react"
import "./App.css"
import { PAGES, STORAGE_KEYS, UI_LANGUAGE_MAP } from "./constants/appConfig"
import { TRANSLATIONS, getUiLanguage } from "./lib/i18n"
import OnboardingPage from "./pages/OnboardingPage"
import HomePage from "./pages/HomePage"
import SchemesPage from "./pages/SchemesPage"
import MandiPage from "./pages/MandiPage"
import LoanPage from "./pages/LoanPage"
import ApplyPage from "./pages/ApplyPage"
import HistoryPage from "./pages/HistoryPage"
import voiceService from "./services/voiceService"
import { generateChatResponse } from "./services/llmService"

function App() {
  const [onboardingStep, setOnboardingStep] = useState("language")
  const [profile, setProfile] = useState({ name: "", mobile: "", language: "" })
  const [currentPage, setCurrentPage] = useState("home")
  const [assistantThreads, setAssistantThreads] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [threadsHydrated, setThreadsHydrated] = useState(false)
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null })

  const uiLanguage = getUiLanguage(profile.language, UI_LANGUAGE_MAP)
  const tr = TRANSLATIONS[uiLanguage]

  useEffect(() => {
    const storedProfile = localStorage.getItem(STORAGE_KEYS.profile)
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile)
      setProfile(parsed)
      setOnboardingStep("done")
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.chatThreads)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return
      setAssistantThreads(parsed)
      if (parsed.length > 0) setActiveChatId(parsed[0].id)
    } catch (err) {
      console.error("Failed to load chat threads:", err)
    } finally {
      setThreadsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!threadsHydrated) return
    localStorage.setItem(STORAGE_KEYS.chatThreads, JSON.stringify(assistantThreads))
  }, [assistantThreads, threadsHydrated])

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const liveLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            displayName: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
            source: "browser",
          }
          setUserLocation(liveLocation)

          try {
            const existingRaw = localStorage.getItem(STORAGE_KEYS.location)
            const existing = existingRaw ? JSON.parse(existingRaw) : {}
            localStorage.setItem(
              STORAGE_KEYS.location,
              JSON.stringify({
                ...existing,
                ...liveLocation,
              }),
            )
          } catch (err) {
            console.warn("Failed to persist location:", err)
          }
        },
        (error) => {
          console.warn("Geolocation access denied or failed:", error.message)
        }
      )
    }
  }, [])

  const activeThread = useMemo(() => {
    return assistantThreads.find((thread) => thread.id === activeChatId) || null
  }, [assistantThreads, activeChatId])

  const greeting = useMemo(() => {
    if (!profile.name) return tr.greeting
    return `${tr.greeting}, ${profile.name}`
  }, [profile.name, tr.greeting])

  const upsertThreadMessage = (threadId, message, seedQuery) => {
    setAssistantThreads((prev) => {
      const now = new Date().toISOString()
      const index = prev.findIndex((thread) => thread.id === threadId)

      if (index === -1) {
        const titleSource = (seedQuery || message.text || "New Chat").trim()
        const thread = {
          id: threadId,
          title: titleSource.length > 40 ? `${titleSource.slice(0, 40)}...` : titleSource,
          createdAt: now,
          updatedAt: now,
          messages: [{ ...message, timestamp: now }],
        }
        return [thread, ...prev]
      }

      const current = prev[index]
      const updated = {
        ...current,
        updatedAt: now,
        messages: [...(current.messages || []), { ...message, timestamp: now }],
      }

      const next = [...prev]
      next[index] = updated
      return next
    })
  }

  const serializeAssistantResult = (data) => {
    if (data?.message) return data.message
    if (data?.speak) return data.speak

    const items = data?.result?.items || []
    if (!items.length) return "No details found."

    return items
      .map((item) =>
        Object.entries(item)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" | "),
      )
      .join("\n")
  }

  const persistLegacyHistory = (query, responseText, pageId) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.history)
      const existing = raw ? JSON.parse(raw) : []
      const next = [
        {
          id: `h_${Date.now()}`,
          query,
          response: responseText,
          page: pageId,
          timestamp: new Date().toISOString(),
        },
        ...existing,
      ].slice(0, 200)
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next))
    } catch (err) {
      console.error("Failed to persist history:", err)
    }
  }

  const handleAssistantResponse = (data, sourceQuery, threadId) => {
    const responseText = serializeAssistantResult(data)

    upsertThreadMessage(
      threadId,
      {
        id: `m_${Date.now()}_a`,
        role: "assistant",
        text: responseText,
      },
      sourceQuery,
    )

    persistLegacyHistory(sourceQuery, responseText, data.redirect || currentPage)

    if (data.redirect) {
      setCurrentPage(data.redirect)
    }

    if (data.speak) {
      const speech = new SpeechSynthesisUtterance(data.speak)
      const localeMap = {
        hi: 'hi-IN',
        mr: 'mr-IN',
        or: 'or-IN',
        en: 'en-US'
      }
      speech.lang = localeMap[uiLanguage] || 'hi-IN'
      window.speechSynthesis.speak(speech)
    }
  }

  const runAssistant = async (incomingQuery) => {
    const query = incomingQuery?.trim()
    if (!query) return

    const threadId = activeChatId || `chat_${Date.now()}`
    setActiveChatId(threadId)

    upsertThreadMessage(
      threadId,
      {
        id: `m_${Date.now()}_u`,
        role: "user",
        text: query,
      },
      query,
    )

    try {
      const data = await generateChatResponse(query, uiLanguage, {
        profile,
        location: userLocation,
      })
      handleAssistantResponse(data, query, threadId)
    } catch (err) {
      console.warn("Assistant failed, using fallback:", err)
      const fallbackData = {
        message: "I am having trouble processing your request right now. Please try again later.",
        speak: "I am having trouble right now. Please try later.",
        redirect: "home",
        result: { items: [] }
      }
      handleAssistantResponse(fallbackData, query, threadId)
    }
  }

  const startNewChat = () => {
    setActiveChatId(null)
  }

  const openChatFromHistory = (threadId) => {
    setActiveChatId(threadId)
    setCurrentPage("home")
  }

  const clearAllChats = () => {
    localStorage.removeItem(STORAGE_KEYS.chatThreads)
    localStorage.removeItem(STORAGE_KEYS.history)
    setAssistantThreads([])
    setActiveChatId(null)
  }

  const submitProfile = (event) => {
    event.preventDefault()
    const isMobileValid = /^\d{10}$/.test(profile.mobile)

    if (!profile.language || !profile.name.trim() || !isMobileValid) {
      window.alert(tr.invalidProfile)
      return
    }

    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile))
    setOnboardingStep("done")
  }

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage tr={tr} onNavigate={setCurrentPage} uiLanguage={uiLanguage} profile={profile} />
      case "schemes":
        return <SchemesPage tr={tr} uiLanguage={uiLanguage} />
      case "mandi":
        return <MandiPage tr={tr} uiLanguage={uiLanguage} />
      case "loan":
        return <LoanPage tr={tr} uiLanguage={uiLanguage} userLocation={userLocation} profile={profile} />
      case "apply":
        return <ApplyPage tr={tr} uiLanguage={uiLanguage} profile={profile} />
      case "history":
        return (
          <HistoryPage
            tr={tr}
            uiLanguage={uiLanguage}
            chatThreads={assistantThreads}
            onOpenChat={openChatFromHistory}
            onClearHistory={clearAllChats}
          />
        )
      default:
        return <HomePage tr={tr} onNavigate={setCurrentPage} uiLanguage={uiLanguage} profile={profile} />
    }
  }

  if (onboardingStep !== "done") {
    return (
      <OnboardingPage
        tr={tr}
        profile={profile}
        setProfile={setProfile}
        onboardingStep={onboardingStep}
        setOnboardingStep={setOnboardingStep}
        onSubmit={submitProfile}
      />
    )
  }

  return (
    <div className="app-shell">
      <header className="top-header">
        <div>
          <h5>{tr.appName}</h5>
          <p>{greeting}</p>
        </div>

        <button className="btn-flat" onClick={() => setOnboardingStep("language")}>
          {tr.reset}
        </button>
      </header>

      <main className="content-area">
        <AssistantChatPanel
          onRunAssistant={runAssistant}
          uiLanguage={uiLanguage}
          activeThread={activeThread}
          onNewChat={startNewChat}
        />
        {renderPage()}
      </main>

      <nav className="bottom-nav">
        <div className="nav-wrapper bottom-nav-surface">
          <ul className="bottom-tabs">
            {PAGES.map((page) => (
              <li key={page.id}>
                <button
                  className={`tab-btn ${currentPage === page.id ? "tab-active" : ""}`}
                  onClick={() => setCurrentPage(page.id)}
                >
                  <span className="material-icons">{page.icon}</span>
                  <small>{tr.pages[page.id]}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  )
}

export default App

function AssistantChatPanel({ onRunAssistant, uiLanguage, activeThread, onNewChat }) {
  const [query, setQuery] = useState("")
  const [isListening, setIsListening] = useState(false)

  const submit = () => {
    if (!query.trim()) return
    onRunAssistant(query)
    setQuery("")
  }

  const handleMic = async () => {
    try {
      setIsListening(true)
      setQuery("")

      const result = await voiceService.recognizeAndTranslate(uiLanguage || "hi", (interimText) => {
        setQuery(interimText)
      })

      if (result.text) {
        setQuery(result.text)
        const finalPrompt = result.translatedText || result.text
        onRunAssistant(finalPrompt)
        setTimeout(() => setQuery(""), 800)
      }
    } catch (error) {
      console.error("Mic error:", error)
      window.alert(
        uiLanguage === "hi"
          ? "Could not capture audio. Please try again in Chrome/Edge."
          : "Could not capture audio. Please try again in Chrome/Edge.",
      )
      setQuery("")
    } finally {
      setIsListening(false)
    }
  }

  return (
    <div className="rustic-card" style={{ padding: "10px", marginBottom: "10px" }}>
      <div className="flex items-center justify-between mb-2">
        <strong>Assistant Chat</strong>
        <button className="btn-flat" onClick={onNewChat}>New Chat</button>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(109, 76, 65, 0.18)",
          borderRadius: "10px",
          maxHeight: "240px",
          overflowY: "auto",
          padding: "8px",
          marginBottom: "8px",
          marginTop: "5px",
        }}
      >
        {(activeThread?.messages || []).length === 0 ? (
          <p style={{ margin: 0, color: "#7b6b5f", fontSize: "0.85rem" }}>Start a chat. It will be saved automatically.</p>
        ) : (
          (activeThread.messages || []).map((message) => (
            <div
              key={message.id + message.timestamp}
              style={{
                marginBottom: "6px",
                marginTop: "5px",
                display: "flex",
                justifyContent: message.role === "user" ? "flex-end" : "flex-start",
              }}

            >
              <div
                style={{
                  maxWidth: "84%",
                  background: message.role === "user" ? "#efe2c8" : "#f7f3ea",
                  border: "1px solid rgba(109, 76, 65, 0.18)",
                  borderRadius: "8px",
                  padding: "6px 8px",
                  whiteSpace: "pre-wrap",
                  fontSize: "0.84rem",
                  marginTop: "5px",
                }}

              >
                {message.text}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 bg-white shadow-lg px-3 py-2 rounded-md">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Ask GraamSeva..."
          className="outline-none text-sm w-full"
        />

        <button onClick={submit} className="rounded-md">
          <span className="material-icons text-amber-600  align-middle" >send</span>
        </button>

        <button
          onClick={handleMic}
          disabled={isListening}
          className={`relative flex items-center justify-center w-8 h-8 rounded-md transition-all ${isListening ? "bg-red-500 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          <span className="material-icons !text-[20px] z-10">{isListening ? "hearing" : "mic"}</span>
        </button>
      </div>
    </div>
  )
}




