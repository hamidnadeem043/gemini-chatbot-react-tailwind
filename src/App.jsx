import { useState, useEffect } from 'react'
import { URL } from "./constants"
import Answer from './components/Answers'

function App() {
  const [question, setQuestion] = useState("")
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('currentChat')
    return saved ? JSON.parse(saved) : []
  })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('chatSessions')
    return saved ? JSON.parse(saved) : []
  })
  const [activeSession, setActiveSession] = useState(null)

  useEffect(() => {
    localStorage.setItem('chatSessions', JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    localStorage.setItem('currentChat', JSON.stringify(chats))
  }, [chats])

  const startNewChat = () => {
    if (chats.length > 0) {
      const sessionTitle = chats[0].question.slice(0, 30) + "..."
      setSessions(prev => [...prev, { id: Date.now(), title: sessionTitle, chats }])
    }
    setChats([])
    setActiveSession(null)
  }

  const loadSession = (session) => {
    setChats(session.chats)
    setActiveSession(session.id)
  }

  const askQuestion = async () => {
    if (!question.trim() || loading) return

    setLoading(true)
    const currentQuestion = question
    setQuestion("")

    const payload = {
      contents: [{ parts: [{ text: currentQuestion }] }],
      systemInstruction: {
        parts: [{
          text: "You are a helpful assistant. Format responses using proper markdown. Use ** for bold headings, - for bullet points. Never use single * around quotes or text."
        }]
      }
    }

    try {
      let response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      response = await response.json()
      const answer = response.candidates[0].content.parts[0].text
      setChats(prev => [...prev, { question: currentQuestion, answer }])
    } catch (error) {
      setChats(prev => [...prev, {
        question: currentQuestion,
        answer: "⚠️ Too many requests! Please wait a few seconds and try again."
      }])
    }

    setLoading(false)
  }

  return (
    <div className="flex bg-zinc-900 min-h-screen">


      <div className="w-64 bg-zinc-800 h-screen flex flex-col p-4 fixed">
        <h1 className="text-white font-bold text-lg mb-4">🤖 AI Chat</h1>


        <button
          onClick={startNewChat}
          className="w-full bg-zinc-700 hover:bg-zinc-600 text-white text-sm py-2 px-4 rounded-lg mb-3 text-left border border-zinc-500"
        >
          + New Chat
        </button>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search chats..."
          className="w-full bg-zinc-700 text-zinc-300 text-sm px-3 py-2 rounded-lg mb-3 outline-none border border-zinc-600 placeholder-zinc-500"
        />


        <p className="text-zinc-500 text-xs uppercase mb-2">History</p>
        <div className="flex-1 overflow-y-auto flex flex-col gap-1">
          {sessions.length === 0 && (
            <p className="text-zinc-600 text-xs">No history yet</p>
          )}
          {sessions
            .filter(session =>
              session.title.toLowerCase().includes(search.toLowerCase())
            )
            .map((session) => (
              <button
                key={session.id}
                onClick={() => loadSession(session)}
                className={`text-left text-sm px-3 py-2 rounded-lg truncate ${activeSession === session.id
                    ? 'bg-zinc-600 text-white'
                    : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
                  }`}
              >
                💬 {session.title}
              </button>
            ))}

          {search && sessions.filter(s =>
            s.title.toLowerCase().includes(search.toLowerCase())
          ).length === 0 && (
              <p className="text-zinc-600 text-xs">No chats found</p>
            )}
        </div>
      </div>


      <div className="ml-64 flex-1 flex flex-col p-10">
        <div className="flex-1 h-[80vh] overflow-y-auto pr-4">
          <div className="max-w-3xl mx-auto">

            {chats.length === 0 && !loading && (
              <div className="text-zinc-500 text-center mt-20 text-lg">
                Hi Hamid! 👋 What will we learn today ??
              </div>
            )}

            {chats.map((chat, index) => (
              <div key={index} className="mb-8">
                <div className="flex justify-end mb-3">
                  <span className="bg-zinc-700 text-white px-4 py-2 rounded-2xl text-sm max-w-md">
                    {chat.question}
                  </span>
                </div>
                <div className="text-zinc-200 text-base leading-8">
                  <Answer ans={chat.answer} />
                </div>
              </div>
            ))}


            {loading && (
              <div className="mb-8">
                <div className="flex gap-1 items-center mt-2">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]"></div>
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]"></div>
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]"></div>
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="max-w-3xl mx-auto w-full">
          <div className="bg-zinc-800 text-white rounded-full border border-zinc-500 flex h-14 px-4 items-center">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
              disabled={loading}
              className="w-full h-full bg-transparent outline-none text-sm px-2 disabled:opacity-50"
              placeholder={loading ? "AI is thinking..." : "Hi Hamid! I am your personal AI. Ask me anything!"}
            />
            <button
              onClick={askQuestion}
              disabled={loading}
              className="text-zinc-300 font-semibold text-sm hover:text-white ml-2 disabled:opacity-50"
            >
              {loading ? '...' : 'ASK'}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default App