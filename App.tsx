import React, { useContext, useState } from 'react';
import { AuthContext } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { HowItWorks } from './components/HowItWorks';
import { StyleRecommender } from './components/StyleRecommender';
import { Services } from './components/Services';
import { Barbers } from './components/Barbers';
import { GallerySection } from './components/GallerySection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { BottomNavBar } from './components/BottomNavBar';
import { ToastContainer } from './components/Toast';
import { ProfileModal } from './components/ProfileModal';

const App: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (user && user.role === 'admin') {
    return (
      <>
        <AdminDashboard />
        <ToastContainer />
      </>
    );
  }

  return (
    <BookingProvider>
      <div className="bg-gray-900 text-gray-300 font-sans">
        <Header onProfileClick={() => setIsProfileOpen(true)} />
        <main>
          <HeroSection />
          <HowItWorks />
          <StyleRecommender />
          <Services />
          <Barbers />
          <GallerySection />
        </main>
        <Footer />
        <BookingModal />
        <BottomNavBar />
        <ToastContainer />
        {isProfileOpen && user?.role === 'client' && <ProfileModal onClose={() => setIsProfileOpen(false)} />}
      </div>
    </BookingProvider>
  );
};

export default App;