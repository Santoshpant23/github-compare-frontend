import { useState, useEffect } from 'react'
import { Github, Loader2, Sparkles } from 'lucide-react'
import './animation.css'

const MEME_PHRASES = [
  "Analyzing spaghetti code... 🍝",
  "Counting empty commits... 👻",
  "Measuring keyboard smashing level... ⌨️",
  "Calculating coffee dependency... ☕",
  "Detecting Stack Overflow copies... 📝",
  "Mining documentation fossils... 🦖",
  "Evaluating meme potential... 🎭",
  "Scanning for console.log()... 🔍"
]

export default function App() {
  const [ans, setAns] = useState('')
  const [user1, setUser1] = useState('')
  const [user2, setUser2] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [memePhrase, setMemePhrase] = useState(MEME_PHRASES[0])

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev
          return prev + Math.random() * 15
        })
        setMemePhrase(MEME_PHRASES[Math.floor(Math.random() * MEME_PHRASES.length)])
      }, 800)
      return () => clearInterval(interval)
    } else {
      setProgress(0)
    }
  }, [loading])

  async function handleCompare() {
    if (user1.length < 2 || user2.length < 2) {
      alert('Please enter valid usernames for both users')
      return
    }

    setLoading(true)
    setAns('')
    let accumulatedHtml = ''
    
    try {
      const response = await fetch('http://localhost:3001/compare-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1, user2 })
      })

      const reader = response.body?.getReader()
      if (!reader) return

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                accumulatedHtml += data.content
                setAns(accumulatedHtml)
              }
            } catch (e) {
              console.error('Parse error:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error)
      setAns('Failed to roast. The developers are being roasted instead. 🔥')
    } finally {
      setLoading(false)
      setProgress(100)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-pulse">
            GitHub Roast Battle 🔥
          </h1>
          <Github className="text-white animate-bounce" size={32} />
        </header>

        <main>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              { user: user1, setUser: setUser1, placeholder: "The Challenger" },
              { user: user2, setUser: setUser2, placeholder: "The Opponent" }
            ].map((field, i) => (
              <div key={i} className="group">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 transform transition-all duration-300 hover:scale-105 hover:border-purple-500/40 cursor-pointer">
                  <div className="h-48 flex items-center justify-center text-8xl animate-float">
                    {field.user ? '👨‍💻' : '❓'}
                  </div>
                  <input
                    className="w-full mt-4 p-4 text-lg rounded-xl bg-gray-700/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 outline-none transition-all cursor-pointer"
                    onChange={(e) => field.setUser(e.target.value)}
                    type="text"
                    placeholder={`Enter ${field.placeholder}'s GitHub username`}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleCompare}
            disabled={loading}
            className="w-full py-5 px-8 text-2xl font-black text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl hover:from-pink-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Roasting in Progress...
              </>
            ) : (
              <>
                <Sparkles className="group-hover:animate-spin" />
                Initialize Roast Sequence
              </>
            )}
          </button>

          {loading && (
            <div className="mt-8">
              <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center mt-4 text-gray-400 animate-pulse font-mono">
                {memePhrase}
              </p>
            </div>
          )}

          {ans && (
            <div className="mt-8 transform transition-all duration-500 animate-fade-in">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
                <div 
                  className="prose prose-invert max-w-none text-lg font-mono leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: ans }}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}