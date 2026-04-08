import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card } from '../components/ui/Card.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { getGeneralChat, sendGeneralChat } from '../api/chatApi'

export function GeneralChatPage() {
  const { token, user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const loadMessages = useCallback(async () => {
    try {
      const response = await getGeneralChat(token)
      setMessages(response.messages || [])
    } catch (e) {
      setError(e.message)
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    loadMessages()
    const timer = setInterval(loadMessages, 4000)
    return () => clearInterval(timer)
  }, [token, loadMessages])

  const handleSend = async () => {
    if (!text.trim()) return
    try {
      await sendGeneralChat(token, text)
      setText('')
      await loadMessages()
    } catch (e) {
      setError(e.message)
    }
  }

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [messages],
  )

  return (
    <section className="space-y-4">
      <div>
        <h1 className="page-title">General Chat</h1>
        <p className="page-subtitle">Chat with your Study Hive community.</p>
      </div>
      {error ? <p className="status-error">{error}</p> : null}
      <Card title="Community Room">
        <div className="max-h-[420px] space-y-2 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
          {sortedMessages.map((msg) => {
            const mine = String(msg.senderId) === String(user?.id || user?._id)
            return (
              <div
                key={msg._id}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  mine
                    ? 'ml-auto bg-indigo-600 text-white'
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}
              >
                <p className="text-xs opacity-80">{msg.senderName}</p>
                <p>{msg.text}</p>
              </div>
            )
          })}
        </div>
        <div className="flex gap-2">
          <input
            className="field-input"
            placeholder="Type a message..."
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSend()
            }}
          />
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            type="button"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </Card>
    </section>
  )
}
