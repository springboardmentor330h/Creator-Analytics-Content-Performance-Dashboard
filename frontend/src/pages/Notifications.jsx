import { useEffect, useState } from 'react'
import api from '../services/api'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Change this if you want to test another creator
  const creatorId = 1

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get(
          `/notifications/creator/${creatorId}`
        )

        console.log(
          'Notifications API response:',
          response.data
        )

        if (Array.isArray(response.data)) {
          setNotifications(response.data)
        } else if (Array.isArray(response.data.data)) {
          setNotifications(response.data.data)
        } else {
          setNotifications([])
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load notifications.')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Notifications
        </h1>

        <p className="mt-4 text-gray-500">
          Loading notifications...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Notifications
        </h1>

        <p className="mt-4 text-red-500">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Page Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Notifications
        </h1>

        <p className="mt-2 text-gray-500">
          View your performance, engagement, and revenue alerts.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Total Notifications
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {notifications.length}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            All notifications
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Unread Notifications
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {
              notifications.filter(
                (notification) =>
                  notification.is_read === false ||
                  notification.read === false
              ).length
            }
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Notifications that need attention
          </p>
        </div>

      </div>

      {/* Notification List */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-bold text-gray-800">
          Notification List
        </h2>

        {notifications.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No notifications found.
          </p>
        ) : (
          <div className="space-y-4">

            {notifications.map((notification, index) => (
              <div
                key={notification.id || index}
                className="rounded-lg border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {notification.title ||
                        notification.notification_type ||
                        'Notification'}
                    </h3>

                    <p className="mt-2 text-gray-600">
                      {notification.message ||
                        notification.description ||
                        'No message available.'}
                    </p>
                  </div>

                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                      notification.is_read === false ||
                      notification.read === false
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {notification.is_read === false ||
                    notification.read === false
                      ? 'Unread'
                      : 'Read'}
                  </span>

                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">

                  {notification.notification_type && (
                    <span>
                      Type: {notification.notification_type}
                    </span>
                  )}

                  {notification.created_at && (
                    <span>
                      {notification.created_at}
                    </span>
                  )}

                  {notification.id && (
                    <span>
                      ID: {notification.id}
                    </span>
                  )}

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  )
}

export default Notifications