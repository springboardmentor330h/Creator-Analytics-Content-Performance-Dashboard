import { useState } from 'react'
import { seedInstagramSampleData } from '../services/instagramService'

export default function InstagramSeedCard() {
  const [status, setStatus] = useState('idle') // idle | seeding | success | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function handleSeed() {
    setStatus('seeding')
    setError('')
    try {
      const data = await seedInstagramSampleData(40)
      setResult(data)
      setStatus('success')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Could not generate sample data.')
      setStatus('error')
    }
  }

  return (
    <section className="sync-card">
      <h2>Instagram Sample Data</h2>
      <p className="text-muted">
        Instagram's API requires business approval we don't have for this project, so this
        generates realistic historical content and follower data and stores it in your
        database — the same way YouTube sync does, just without a live API call.
      </p>
      <button className="btn-small" onClick={handleSeed} disabled={status === 'seeding'}>
        {status === 'seeding' ? 'Generating...' : 'Generate sample data'}
      </button>

      {status === 'error' && <div className="auth-error" style={{ marginTop: '1rem' }}>{error}</div>}

      {status === 'success' && result && (
        <div className="sync-result">
          <p>
            <strong>{result.posts_created}</strong> posts added,{' '}
            <strong>{result.posts_updated}</strong> updated.
          </p>
          <p className="text-muted">
            {result.final_follower_count.toLocaleString()} followers as of the latest data point.
          </p>
        </div>
      )}
    </section>
  )
}
