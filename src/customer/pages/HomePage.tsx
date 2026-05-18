import Header from '../components/Header'
import HeroSection from '../components/home/HeroSection'
import SearchSection from '../components/home/SearchSection'
import CategoryFilter from '../components/home/CategoryFilter'
import ForYouSection from '../components/home/ForYouSection'
import NearYouSection from '../components/home/NearYouSection'
import PopularCategory from '../components/home/PopularCategory'
import CommunityBanner from '../components/home/CommunityBanner'
import InfoSection from '../components/home/InfoSection'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-8 pt-16">
        <HeroSection />
        <SearchSection />
        <CategoryFilter />
        <ForYouSection />
        <NearYouSection />
        <PopularCategory />
        <CommunityBanner />
        <InfoSection />
      </main>
      <Footer />
    </div>
  )
}
