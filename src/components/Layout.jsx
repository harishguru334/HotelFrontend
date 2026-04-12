import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 p-4 md:p-8 bg-hotel-light min-h-screen">
        {children}
      </main>
    </div>
  )
}
