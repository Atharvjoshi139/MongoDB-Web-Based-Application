import { useEffect, useState } from 'react'
import './App.css'

const starterCaption = 'Golden hour, good coffee, and the best people around me ✨'

function App() {
  const [caption, setCaption] = useState(starterCaption)
  const [analysis, setAnalysis] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mongoReady, setMongoReady] = useState(false)

  useEffect(() => {
    fetch('/api/analyses')
      .then((response) => response.json())
      .then((items) => {
        setHistory(items)
        setMongoReady(true)
      })
      .catch(() => {
        setHistory([])
        setMongoReady(false)
      })
  }, [])

  async function analyzeCaption(event) {
    event.preventDefault()
    if (!caption.trim()) return

    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption }),
      })
      if (!response.ok) throw new Error('Could not analyze this caption.')
      const result = await response.json()
      setAnalysis(result)
      setHistory((items) => [result, ...items.filter((item) => item._id !== result._id)].slice(0, 5))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  function loadHistoryItem(item) {
    setCaption(item.caption)
    setAnalysis(item)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">◒</span><span>moodboard</span></div>
        <span className="status"><span className={`status-dot ${mongoReady ? 'ready' : 'offline'}`} /> {mongoReady ? 'MongoDB connected' : 'MongoDB offline'}</span>
      </header>
      <section className="intro"><p className="eyebrow">INSTAGRAM CAPTION ANALYZER</p><h1>Read the feeling<br /><em>behind the post.</em></h1><p className="intro-copy">Paste a caption and get a clear, human-readable sentiment read in seconds.</p></section>
      <section className="workspace">
        <div className="composer panel"><div className="panel-heading"><span>01 / WRITE</span><span className="char-count">{caption.length} / 500</span></div><form onSubmit={analyzeCaption}><label htmlFor="caption">Your caption</label><textarea id="caption" maxLength="500" value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Paste an Instagram caption..." /><div className="composer-footer"><span className="hint">We look for the words that shape the mood.</span><button type="submit" disabled={loading}>{loading ? 'Reading...' : 'Analyze caption  →'}</button></div></form>{error && <p className="error">{error}</p>}</div>
        <div className="result panel"><div className="panel-heading"><span>02 / THE READ</span><span className="saved-label">● SAVED TO MONGODB</span></div>{analysis ? <div className="result-content"><div className="score-row"><div className={`mood-icon ${analysis.sentiment}`}>{analysis.sentiment === 'positive' ? '✦' : analysis.sentiment === 'negative' ? '—' : '·'}</div><div><p className="result-label">OVERALL SENTIMENT</p><h2>{analysis.sentiment}</h2></div><strong className={`score ${analysis.sentiment}`}>{analysis.score > 0 ? '+' : ''}{analysis.score}</strong></div><div className="meter"><span style={{ width: `${analysis.confidence}%` }} /></div><p className="explanation">{analysis.explanation}</p><div className="signals"><div><span className="signal-number positive-text">+{analysis.positiveWords.length}</span><span>positive signals</span></div><div><span className="signal-number negative-text">-{analysis.negativeWords.length}</span><span>negative signals</span></div></div><div className="matched-words"><p className="result-label">WORDS THAT SHAPED THE READ</p><div>{analysis.positiveWords.map((word) => <span className="word positive-word" key={`positive-${word}`}>+ {word}</span>)}{analysis.negativeWords.map((word) => <span className="word negative-word" key={`negative-${word}`}>− {word}</span>)}{analysis.positiveWords.length === 0 && analysis.negativeWords.length === 0 && <span className="word neutral-word">No strong signals found</span>}</div></div></div> : <div className="empty-result"><span className="empty-spark">✦</span><p>Your read will appear here</p><small>We will show the mood, score, and exact words that influenced it.</small></div>}</div>
      </section>
      <section className="history"><div className="history-heading"><div><p className="eyebrow">RECENT CAPTIONS</p><h2>Your analysis history</h2></div><span className="history-count">{history.length} {history.length === 1 ? 'read' : 'reads'}</span></div>{history.length ? <div className="history-list">{history.map((item) => <button className="history-item" key={item._id} onClick={() => loadHistoryItem(item)}><span className={`history-dot ${item.sentiment}`} /><span className="history-caption">{item.caption}</span><span className={`history-sentiment ${item.sentiment}`}>{item.sentiment}</span><span className="history-score">{item.score > 0 ? '+' : ''}{item.score}</span><span className="history-arrow">↗</span></button>)}</div> : <p className="history-empty">Your saved reads will collect here.</p>}</section>
      <footer><span>Simple signals. Clearer stories.</span><span>Built for thoughtful posting.</span></footer>
    </main>
  )
}

export default App
