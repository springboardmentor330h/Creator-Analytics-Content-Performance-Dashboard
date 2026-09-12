import Sidebar from './Sidebar'
import TopHeader from './TopHeader'

export default function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main-wrapper">
        <TopHeader />
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}
