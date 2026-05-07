import { useState, useEffect } from 'react';

const DEFAULTS = {
  facebook: 'https://www.facebook.com/techbox.ua',
  instagram: 'https://www.instagram.com/techbox_ua',
  tiktok: 'https://www.tiktok.com/@techbox_ua',
  telegram: 'https://t.me/techbox_ua',
};

let cached: typeof DEFAULTS | null = null;

export function useSocialLinks() {
  const [links, setLinks] = useState(cached || DEFAULTS);
  useEffect(() => {
    if (cached) return;
    fetch('/api/settings/social')
      .then(r => r.json())
      .then(data => { cached = data; setLinks(data); })
      .catch(() => {});
  }, []);
  return links;
}
