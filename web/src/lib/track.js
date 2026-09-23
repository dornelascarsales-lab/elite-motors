// Métricas lidas pelo dashboard.html (mesmas coleções e campos do site antigo).
const firebaseConfig = {
  apiKey: 'AIzaSyDi-fKmgiLOIHm5OzBWmFNHnGRWDDH8gmA',
  authDomain: 'elite-motors-8f364.firebaseapp.com',
  projectId: 'elite-motors-8f364',
  storageBucket: 'elite-motors-8f364.firebasestorage.app',
  messagingSenderId: '706116258130',
  appId: '1:706116258130:web:ea7063e1f8fdff0885d28b',
  measurementId: 'G-M983HTWPF5',
};

let db = null;
try {
  if (window.firebase && !['localhost', '127.0.0.1'].includes(location.hostname)) {
    window.firebase.initializeApp(firebaseConfig);
    db = window.firebase.firestore();
  }
} catch {}

function visitorId() {
  let id = localStorage.getItem('em_visitor_id');
  if (!id) {
    id = 'v_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
    localStorage.setItem('em_visitor_id', id);
  }
  return id;
}

function add(collection, data) {
  if (!db) return;
  db.collection(collection).add({ visitorId: visitorId(), timestamp: new Date().toISOString(), ...data }).catch(() => {});
}

export const trackPageVisit = () =>
  add('page_visits', { userAgent: navigator.userAgent, referrer: document.referrer || 'direct' });

// O link abre normalmente (target=_blank); o registro vai em paralelo.
export function trackWhatsApp(car) {
  window.fbq?.('track', 'Lead');
  add('whatsapp_clicks', {
    vin: car?.vin || '',
    name: car ? car.title.toUpperCase() : 'HERO / CTA BUTTON',
    price: car?.priceValue ? String(car.priceValue) : '',
    userAgent: navigator.userAgent,
  });
}

export const trackCardView = car =>
  add('card_views', { vin: car.vin, name: car.title.toUpperCase(), price: car.priceValue ? String(car.priceValue) : '' });

export const trackPhotoClick = car =>
  add('photo_clicks', { vin: car.vin, name: car.title.toUpperCase() });
