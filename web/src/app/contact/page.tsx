import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ContactClient from './ContactClient'

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ContactClient />
      <Footer />
    </div>
  )
}
