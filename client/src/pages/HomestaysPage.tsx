import Header from '../components/Header';
import Footer from '../components/Footer';
import HomestaysSection from '../components/HomestaysSection';

export default function HomestaysPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 md:pt-28"> 
        <HomestaysSection />
      </main>
      <Footer />
    </div>
  );
}
