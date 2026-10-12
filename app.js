(() => {
  const menu = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'メニューを開く');
    mobileNav.hidden = true;
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    mobileNav.hidden = !open;
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width: 1001px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
  const base = '/sugawaragumi-preview/';
  const path = location.pathname;
  document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(link => {
    if (link.getAttribute('href') === path) link.setAttribute('aria-current', 'page');
  });

  const video = document.querySelector('.hero-video');
  const toggle = document.querySelector('#video-toggle');
  if (video && toggle) {
    const syncVideoState = () => {
      toggle.setAttribute('aria-label', video.paused ? '映像を再生' : '映像を一時停止');
      toggle.querySelector('.pause-symbol').textContent = video.paused ? '▷' : 'Ⅱ';
      toggle.querySelector('.video-state').textContent = video.paused ? 'PLAY' : 'PAUSE';
    };
    video.addEventListener('play', syncVideoState);
    video.addEventListener('pause', syncVideoState);
    video.addEventListener('error', () => { toggle.hidden = true; });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) { video.removeAttribute('autoplay'); video.pause(); }
    toggle.addEventListener('click', () => {
      if (video.paused) video.play().catch(syncVideoState);
      else video.pause();
    });
    syncVideoState();
  }

  const fleetTabs = document.querySelectorAll('[data-ship]');
  if (fleetTabs.length) {
    fetch(base + 'content.json').then(r => { if (!r.ok) throw new Error('Content unavailable'); return r.json(); }).then(data => {
      fleetTabs.forEach(button => button.addEventListener('click', () => {
        const ship = data.fleet.find(s => s.id === button.dataset.ship);
        if (!ship) return;
        document.querySelector('#fleet-image').src = base + ship.image;
        document.querySelector('#fleet-image').alt = ship.name;
        document.querySelector('#fleet-name').textContent = ship.name;
        document.querySelector('#fleet-type').textContent = ship.type;
        document.querySelector('#fleet-capacity').textContent = ship.capacity.replace('t吊', '');
        document.querySelector('#fleet-description').textContent = ship.description;
        document.querySelector('#fleet-label').textContent = ship.id.padStart(2, '0');
        document.querySelector('#fleet-link').href = base + 'fleet/#ship-' + ship.id;
        fleetTabs.forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
      }));
    }).catch(() => {
      fleetTabs.forEach(button => {
        button.disabled = true;
        button.title = '船舶一覧ページからご覧ください';
      });
    });
  }

  const newsFilters = document.querySelectorAll('[data-news-filter]');
  if (newsFilters.length) {
    newsFilters.forEach(button => button.addEventListener('click', () => {
      const filter = button.dataset.newsFilter;
      newsFilters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      document.querySelectorAll('#news-archive > a').forEach(row => { row.hidden = filter !== 'all' && row.dataset.category !== filter; });
    }));
  }
})();
