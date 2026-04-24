import { useMemo } from 'react'
import { STORAGE_KEYS } from '../constants/appConfig'
import { formatTime } from '../lib/assistant'

export default function HistoryPage({ tr, uiLanguage, chatThreads = [], onOpenChat, onClearHistory }) {
  const sortedThreads = useMemo(() => {
    return [...chatThreads].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [chatThreads])

  const clearHistory = () => {
    // tr.historyConfirm is already localised for all 7 languages — no ternary needed
    if (window.confirm(tr.historyConfirm)) {
      if (onClearHistory) {
        onClearHistory()
      } else {
        localStorage.removeItem(STORAGE_KEYS.chatThreads)
        localStorage.removeItem(STORAGE_KEYS.history)
      }
    }
  }

  return (
    <div className="card rustic-card">
      <div className="card-content">
        <div className="flex justify-between items-center mb-3">
          <span className="card-title">{tr.pages.history}</span>
          {sortedThreads.length > 0 && (
            <button className="btn-small waves-effect red lighten-1" onClick={clearHistory}>
              {tr.historyClear}
            </button>
          )}
        </div>

        {sortedThreads.length === 0 ? (
          <p>{tr.historyEmpty}</p>
        ) : (
          <ul className="collection">
            {sortedThreads.map((thread) => {
              const lastMessage = thread.messages?.[thread.messages.length - 1]
              const preview = lastMessage?.text || ''
              return (
                <li className="collection-item" key={thread.id}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <strong>{thread.title || tr.historyTitle}</strong>
                      <p style={{ margin: '4px 0', color: '#6d4c41' }}>{preview.slice(0, 100)}</p>
                      <div className="history-meta">
                        {thread.messages?.length || 0} {tr.historyMessages} | {formatTime(thread.updatedAt || thread.createdAt)}
                      </div>
                    </div>
                    <button
                      className="btn-small amber darken-2"
                      onClick={() => onOpenChat && onOpenChat(thread.id)}
                    >
                      {tr.historyContinue}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}