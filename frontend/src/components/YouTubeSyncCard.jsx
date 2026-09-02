import { useState } from 'react'
import { syncYouTubeChannel } from '../services/youtubeService'

export default function YouTubeSyncCard() {
  const [channelId, setChannelId] = useState('')
  const [status, setStatus] = useState('idle') // idle | syncing | success | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function handleSync(e) {
    e.preventDefault()
    setStatus('syncing')
    setError('')
    try {
      const data = await syncYouTubeChannel(channelId)
      setResult(data)
      setStatus('success')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Sync failed.')
      setStatus('error')
    }
  }

  return (
    <section className="sync-card">
      <h2>Sync YouTube Channel</h2>
      <p className="text-muted">
        Pulls your channel's subscriber count and recent video stats into CreatorIQ.
      </p>
      <form onSubmit={handleSync} className="sync-form">
        <input
          type="text"
          placeholder="Channel ID (e.g. UCX6OQ3DkcsbYNE6H8uQQuVA)"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          required
        />
        <button type="submit" disabled={status === 'syncing'}>
          {status === 'syncing' ? 'Syncing...' : 'Sync now'}
        </button>
      </form>

      {status === 'error' && <div className="auth-error" style={{ marginTop: '1rem' }}>{error}</div>}

      {status === 'success' && result && (
        <div className="sync-result">
          <p><strong>{result.channel.title}</strong> — {result.channel.subscriber_count.toLocaleString()} subscribers</p>
          <p className="text-muted">
            {result.videos_synced} new video{result.videos_synced !== 1 ? 's' : ''} added,{' '}
            {result.videos_updated} updated.
          </p>
        </div>
      )}
    </section>
  )
}
