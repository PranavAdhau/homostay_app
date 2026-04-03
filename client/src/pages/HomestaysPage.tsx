import Header from '../components/Header';
import Footer from '../components/Footer';
import HomestaysSection from '../components/HomestaysSection';

export default function HomestaysPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow pt-20"> 
        <HomestaysSection />
      </div>
      <Footer />
    </div>
  );
}
