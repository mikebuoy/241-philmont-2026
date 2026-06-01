import { useEffect } from 'react';

export function useScrollSpy() {
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('section[id]')
    );
    if (!sections.length) return;

    const intersecting = new Set<string>();

    const updateHash = () => {
      if (window.scrollY < 50) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        return;
      }
      const candidates = sections.filter(s => intersecting.has(s.id));
      if (!candidates.length) return;
      // Prefer the section whose header is closest to the viewport top.
      // A visible header (top >= 0) beats one scrolled above; ties broken by proximity to 0.
      const active = candidates.reduce((best, cur) => {
        const ct = cur.getBoundingClientRect().top;
        const bt = best.getBoundingClientRect().top;
        if (ct >= 0 && bt < 0) return cur;
        if (ct < 0 && bt >= 0) return best;
        return Math.abs(ct) < Math.abs(bt) ? cur : best;
      });
      history.replaceState(null, '', '#' + active.id);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e =>
          e.isIntersecting
            ? intersecting.add(e.target.id)
            : intersecting.delete(e.target.id)
        );
        updateHash();
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 }
    );

    sections.forEach(s => observer.observe(s));

    const onScroll = () => {
      if (window.scrollY < 50) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
}
