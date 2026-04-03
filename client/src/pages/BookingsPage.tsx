import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingSection from '../components/BookingSection';

export default function BookingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow pt-20"> 
        <BookingSection />
      </div>
      <Footer />
    </div>
  );
}
