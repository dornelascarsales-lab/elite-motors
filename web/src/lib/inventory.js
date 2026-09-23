import { useEffect, useState } from 'react';

export const WHATSAPP = '16892446424';

// Categoria usada nos filtros, a partir do body_type da Summit
export function category(car) {
  const b = (car.body || '').toUpperCase();
  if (b === 'PICKUP' || b === 'CAB_CHASSIS') return 'pickup';
  if (b === 'SUV') return 'suv';
  if (b === 'CARGO' || b === 'VAN') return 'van';
  return 'car';
}

export function trimOf(car) {
  const prefix = `${car.year} ${car.make} ${car.model}`.toLowerCase();
  const t = car.title || '';
  return t.toLowerCase().startsWith(prefix) ? t.slice(prefix.length).trim() : '';
}

export const money = n => (n ? '$' + n.toLocaleString('en-US') : null);
export const miles = n => (n ? n.toLocaleString('en-US') + ' mi' : '—');

export function waLink(text) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export function useInventory() {
  const [state, setState] = useState({ loading: true, error: null, vehicles: [], updatedAt: null });
  useEffect(() => {
    fetch('./inventory.json', { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then(d => setState({ loading: false, error: null, vehicles: d.vehicles || [], updatedAt: d.updatedAt }))
      .catch(err => setState(s => ({ ...s, loading: false, error: err })));
  }, []);
  return state;
}
