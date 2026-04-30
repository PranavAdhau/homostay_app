import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingSection from '../components/BookingSection';

export default function BookingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 md:pt-28"> 
        <BookingSection />
      </main>
      <Footer />
    </div>
  );
}
