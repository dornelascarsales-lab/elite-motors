import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NexusEngine from './components/NexusEngine';
import CarDialog from './components/CarDialog';
import WhatsIcon from './components/WhatsIcon';
import Hero from './sections/Hero';
import HowItWorks from './sections/HowItWorks';
import WhyUs from './sections/WhyUs';
import Inventory from './sections/Inventory';
import PriceBands from './sections/PriceBands';
import Clients from './sections/Clients';
import Faq from './sections/Faq';
import CustomOrder from './sections/CustomOrder';
import Financing from './sections/Financing';
import FinalCta from './sections/FinalCta';
import { useLang } from './i18n';
import { useInventory, waLink } from './lib/inventory';
import { trackPageVisit, trackWhatsApp } from './lib/track';

export default function App() {
  const { t } = useLang();
  const inv = useInventory();
  const [filters, setFilters] = useState({ cat: 'all', q: '', onlySale: false, sort: 'priceDesc', band: null });
  const [open, setOpen] = useState(null);

  useEffect(() => { trackPageVisit(); }, []);

  const pickBand = band => {
    setFilters(f => ({ ...f, band, cat: 'all' }));
    document.getElementById('grade')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative antialiased selection:bg-accent selection:text-black min-h-screen">
      <NexusEngine />

      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none flex justify-center">
        <div className="w-full max-w-7xl h-full border-x border-white/[0.03] relative">
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/[0.02]"></div>
          <div className="absolute right-1/3 top-0 bottom-0 w-px bg-white/[0.02]"></div>
        </div>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <Navbar />
        <main className="w-full flex flex-col items-center">
          <Hero vehicles={inv.vehicles} />
          <CustomOrder />
          <Inventory inv={inv} filters={filters} setFilters={setFilters} onOpen={setOpen} />
          <Financing />
          <HowItWorks />
          <WhyUs vehicles={inv.vehicles} />
          <PriceBands vehicles={inv.vehicles} onPick={pickBand} />
          <Clients />
          <Faq />
          <FinalCta />
        </main>
        <Footer />
      </div>

      <a
        href={waLink(t('final.msg'))}
        target="_blank"
        rel="noopener"
        onClick={() => trackWhatsApp(null)}
        aria-label="WhatsApp"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25d366] text-white flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(37,211,102,0.5)] hover:scale-105 active:scale-95 transition-transform"
      >
        <WhatsIcon className="text-3xl" />
      </a>

      <CarDialog car={open} onClose={() => setOpen(null)} />
    </div>
  );
}
