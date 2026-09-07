function TopContentTable({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b text-sm text-gray-500">
            <th className="px-4 py-3">Content</th>
            <th className="px-4 py-3">Platform</th>
            <th className="px-4 py-3">Views</th>
            <th className="px-4 py-3">Reach</th>
            <th className="px-4 py-3">Watch Time</th>
            <th className="px-4 py-3">Engagement Rate</th>
          </tr>
        </thead>

        <tbody>
          {data.map((content, index) => (
            <tr
              key={index}
              className="border-b last:border-b-0"
            >
              <td className="px-4 py-4 font-medium text-gray-800">
                {content.content_title}
              </td>

              <td className="px-4 py-4 text-gray-600">
                {content.platform}
              </td>

              <td className="px-4 py-4 text-gray-600">
                {content.views.toLocaleString()}
              </td>

              <td className="px-4 py-4 text-gray-600">
                {content.reach.toLocaleString()}
              </td>

              <td className="px-4 py-4 text-gray-600">
                {content.watch_time.toLocaleString()}
              </td>

              <td className="px-4 py-4 font-medium text-gray-800">
                {content.engagement_rate}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TopContentTable