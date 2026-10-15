(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
  const header = document.querySelector('.header');
  const toggle = header?.querySelector('.header__close');
  const nav = header?.querySelector('.gnav');
  nav?.querySelectorAll('.gnav__item-1__link').forEach(link => {
    link.setAttribute('aria-label', link.textContent.trim());
  });
  // Keep secondary links in one independent column, without changing their order.
  if (nav && !nav.querySelector('.gnav__secondary')) {
    const secondaryItems = [...nav.children].filter(item => !item.classList.contains('gnav__item-1'));
    if (secondaryItems.length) {
      const group = document.createElement('li');
      const list = document.createElement('ul');
      group.className = 'gnav__secondary';
      list.className = 'gnav__secondary-list';
      secondaryItems[0].before(group);
      group.append(list);
      list.append(...secondaryItems);
    }
  }
  const pageRegions = [...document.querySelectorAll('main,.footer,.page-top')];
  const initialInert = new Map(pageRegions.map(region => [region, region.inert]));
  let menuOpen = false, activeSubmenu = null, savedOverflow = '';
  const submenus = [...(header?.querySelectorAll('.gnav__item-1--sub') || [])].map((item, i) => {
    const button = item.querySelector(':scope > .gnav__item-1__link');
    const panel = item.querySelector('.child-menu');
    panel.id = 'navigation-submenu-' + (i + 1);
    panel.hidden = true;
    panel.inert = true;
    button.setAttribute('aria-controls', panel.id);
    button.setAttribute('aria-expanded', 'false');
    return {item, button, panel};
  });
  function closeSubmenu() {
    if (!activeSubmenu) return;
    activeSubmenu.item.classList.remove('open');
    activeSubmenu.button.setAttribute('aria-expanded', 'false');
    activeSubmenu.panel.hidden = true;
    activeSubmenu.panel.inert = true;
    activeSubmenu = null;
  }
  function openSubmenu(entry) {
    if (!menuOpen) return;
    if (activeSubmenu !== entry) closeSubmenu();
    activeSubmenu = entry;
    entry.item.classList.add('open');
    entry.button.setAttribute('aria-expanded', 'true');
    entry.panel.hidden = false;
    entry.panel.inert = false;
  }
  function setMenu(open, restoreFocus = false) {
    open = Boolean(open && nav && toggle);
    if (open && !menuOpen) {
      savedOverflow = document.body.style.overflow;
      nav.scrollTop = 0;
    }
    if (!open && menuOpen) document.body.style.overflow = savedOverflow;
    if (open) document.body.style.overflow = 'hidden';
    menuOpen = open;
    document.body.classList.toggle('menu-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      const label = toggle.querySelector('.header__close__txt');
      if (label) label.textContent = open ? 'CLOSE' : 'MENU';
    }
    if (nav) {
      nav.inert = !open;
      nav.setAttribute('aria-hidden', String(!open));
    }
    pageRegions.forEach(region => { region.inert = open || initialInert.get(region); });
    if (!open) closeSubmenu();
    if (restoreFocus) toggle?.focus();
  }
  toggle?.addEventListener('click', () => setMenu(!menuOpen));
  submenus.forEach(entry => {
    entry.button.addEventListener('click', () => {
      if (activeSubmenu === entry) closeSubmenu();
      else openSubmenu(entry);
    });
    entry.button.addEventListener('keydown', event => {
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      openSubmenu(entry);
      const links = [...entry.panel.querySelectorAll('a,button')];
      (event.key === 'ArrowUp' ? links.at(-1) : links[0])?.focus();
    });
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false, true)));
  document.addEventListener('click', event => {
    if (activeSubmenu && !activeSubmenu.item.contains(event.target)) closeSubmenu();
  });
  document.addEventListener('focusin', event => {
    if (menuOpen && !header.contains(event.target) && !document.querySelector('dialog[open]')) toggle.focus();
  });
  document.addEventListener('keydown', event => {
    if (document.querySelector('dialog[open]')) return;
    if (event.key === 'Escape') {
      if (activeSubmenu) {
        const button = activeSubmenu.button;
        closeSubmenu();
        button.focus();
        event.preventDefault();
      } else if (menuOpen) {
        setMenu(false, true);
        event.preventDefault();
      }
    }
    if (event.key === 'Tab' && menuOpen) {
      const items = [...header.querySelectorAll('a[href],button:not([disabled])')].filter(element => !element.closest('[inert],[hidden]') && element.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  setMenu(false);

  const hero = document.querySelector('.mv');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => document.body.classList.toggle('hero-in-view', entry.isIntersecting)).observe(hero);
  }
  const video = document.querySelector('.mv__video'), control = document.querySelector('.mv-video-control');
  if (video && control) {
    const sync = () => {
      control.textContent = video.paused ? 'PLAY' : 'PAUSE';
      control.setAttribute('aria-label', video.paused ? 'ドローン映像を再生' : 'ドローン映像を一時停止');
    };
    if (reducedMotion.matches) { video.removeAttribute('autoplay'); video.pause(); }
    video.addEventListener('pause', sync);
    video.addEventListener('play', sync);
    control.addEventListener('click', () => video.paused ? video.play().catch(sync) : video.pause());
    sync();
  }

  function makeButton(label, text, className) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', label);
    button.textContent = text;
    button.dataset.auditAdded = 'true';
    return button;
  }
  const zoomFigures = [...document.querySelectorAll('figure.zoom')];
  if (zoomFigures.length) {
    const dialog = document.createElement('dialog');
    dialog.className = 'image-dialog';
    dialog.setAttribute('aria-labelledby', 'image-dialog-title');
    const toolbar = document.createElement('div');
    toolbar.className = 'image-dialog__toolbar';
    const title = document.createElement('h2');
    title.id = 'image-dialog-title';
    const size = makeButton('原寸で見る', '原寸で見る', 'image-dialog__size');
    const close = makeButton('画像を閉じる', '閉じる ×', 'image-dialog__close');
    toolbar.append(title, size, close);
    const canvas = document.createElement('div');
    canvas.className = 'image-dialog__canvas';
    const image = document.createElement('img');
    canvas.append(image);
    dialog.append(toolbar, canvas);
    document.body.append(dialog);
    let trigger = null, overflowBeforeDialog = '';
    close.addEventListener('click', () => dialog.close());
    size.addEventListener('click', () => {
      const original = dialog.classList.toggle('image-dialog--original');
      image.style.width = original ? image.naturalWidth + 'px' : '';
      size.textContent = original ? '全体表示' : '原寸で見る';
      size.setAttribute('aria-label', size.textContent);
    });
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = overflowBeforeDialog;
      image.removeAttribute('src');
      trigger?.focus();
    });
    zoomFigures.forEach((figure, index) => {
      const source = figure.querySelector('img');
      if (!source) return;
      const precedingHeading = [...document.querySelectorAll('main h2,main h3')].filter(heading => heading.compareDocumentPosition(figure) & Node.DOCUMENT_POSITION_FOLLOWING).at(-1);
      const caption = source.alt || precedingHeading?.textContent.trim() || '健康経営の資料 ' + (index + 1);
      const button = makeButton(caption + 'を拡大', '', 'image-zoom');
      delete button.dataset.auditAdded;
      source.before(button);
      button.append(source);
      button.addEventListener('click', () => {
        trigger = button;
        title.textContent = caption;
        image.src = source.currentSrc || source.src;
        image.alt = caption;
        image.style.width = '';
        dialog.classList.remove('image-dialog--original');
        size.textContent = '原寸で見る';
        size.setAttribute('aria-label', size.textContent);
        overflowBeforeDialog = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
        close.focus();
      });
    });
  }

  function carousel(track, label, recruit = false) {
    const slides = [...track.children];
    if (slides.length < 2) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'media-carousel' + (recruit ? ' media-carousel--recruit' : '');
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', label);
    track.before(wrapper);
    wrapper.append(track);
    track.classList.add('carousel-track');
    track.tabIndex = 0;
    track.id ||= 'carousel-' + (label.replace(/[^\d]/g, '') || 'staff');
    const controls = document.createElement('div');
    controls.className = 'carousel-controls';
    controls.dataset.auditAdded = 'true';
    const previous = makeButton(label + (recruit ? '：前の項目' : '：前の写真'), '←', 'carousel-controls__button');
    const next = makeButton(label + (recruit ? '：次の項目' : '：次の写真'), '→', 'carousel-controls__button');
    previous.setAttribute('aria-controls', track.id);
    next.setAttribute('aria-controls', track.id);
    const counter = document.createElement('span');
    counter.className = 'carousel-controls__count';
    counter.setAttribute('aria-live', 'polite');
    counter.setAttribute('aria-atomic', 'true');
    controls.append(previous, counter, next);
    wrapper.append(controls);
    if (recruit) {
      const sizeEndSpace = () => track.style.setProperty('--carousel-end-space', Math.max(0, track.clientWidth - slides.at(-1).getBoundingClientRect().width) + 'px');
      sizeEndSpace();
      new ResizeObserver(sizeEndSpace).observe(track);
    }
    let current = 0, timer;
    const leftOf = slide => slide.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    function paint() {
      counter.textContent = (current + 1) + ' / ' + slides.length;
      previous.disabled = current === 0;
      next.disabled = current === slides.length - 1;
      wrapper.dataset.slide = String(current + 1);
    }
    function go(index) {
      current = Math.max(0, Math.min(slides.length - 1, index));
      track.scrollTo({left:leftOf(slides[current]), behavior:reducedMotion.matches ? 'auto' : 'smooth'});
      paint();
    }
    previous.addEventListener('click', () => go(current - 1));
    next.addEventListener('click', () => go(current + 1));
    track.addEventListener('scroll', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const maximum = track.scrollWidth - track.clientWidth;
        current = maximum > 1 && track.scrollLeft >= maximum - 2 ? slides.length - 1 : slides.reduce((best, slide, i) => Math.abs(leftOf(slide) - track.scrollLeft) < Math.abs(leftOf(slides[best]) - track.scrollLeft) ? i : best, 0);
        paint();
      }, 120);
    }, {passive:true});
    track.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      go(current + (event.key === 'ArrowRight' ? 1 : -1));
    });
    paint();
  }
  document.querySelectorAll('.konbu-slide').forEach((track, i) => carousel(track, '昆布養殖工程 ' + (i + 3)));
  const related = document.querySelector('.sg-slide__wrap');
  if (related) carousel(related, '菅原組の関連情報', true);

  const pdfViewport = matchMedia('(min-width:768px)');
  const pdfObjects = [...document.querySelectorAll('object.wp-block-file__embed')];
  const syncPdfPreview = () => pdfObjects.forEach(object => { object.hidden = !(navigator.pdfViewerEnabled && pdfViewport.matches); });
  syncPdfPreview();
  pdfViewport.addEventListener('change', syncPdfPreview);
  document.querySelectorAll('.fb-page[data-href]').forEach(container => {
    const frame = document.createElement('iframe');
    const query = new URLSearchParams({href:container.dataset.href, tabs:'timeline', width:String(Math.min(500, Math.max(180, container.clientWidth))), height:container.dataset.height || '500', small_header:'false', adapt_container_width:'true', hide_cover:'false', show_facepile:'true'});
    frame.src = 'https://www.facebook.com/plugins/page.php?' + query;
    frame.title = '株式会社菅原組のFacebook更新情報';
    frame.loading = 'lazy';
    frame.allow = 'encrypted-media';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    container.prepend(frame);
  });
})();

/* Progressive, one-time motion for the existing editorial layout. */
(() => {
  'use strict';

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !Element.prototype.animate || !('IntersectionObserver' in window)) return;

  const body = document.body;
  const main = document.querySelector('main');
  if (!body || !main) return;
  body.classList.add('motion-enabled');

  const animations = new Set();
  const targets = new Set();
  let observer;

  function play(element, keyframes, options) {
    try {
      const animation = element.animate(keyframes, {
        duration: 720,
        easing: 'cubic-bezier(.16,1,.3,1)',
        fill: 'backwards',
        ...options
      });
      animations.add(animation);
      animation.finished.catch(() => {}).finally(() => animations.delete(animation));
    } catch (_) {
      // Unsupported keyframes must never keep content from being read.
    }
  }

  function enter(element, delay = 0) {
    if (element.classList.contains('is-in-view')) return;
    element.classList.add('is-in-view');
    if (document.visibilityState === 'hidden' || element.contains(document.activeElement)) return;

    const type = element.dataset.motion;
    const timing = {delay, duration: type === 'heading' ? 740 : 640};
    if (type === 'media') {
      play(element, [
        {opacity: .55, clipPath: 'inset(0 0 24% 0)'},
        {opacity: 1, clipPath: 'inset(0 0 0 0%)'}
      ], {...timing, duration: 820});
    } else if (type === 'card') {
      play(element, [
        {opacity: .36, transform: 'translate3d(0,24px,0)'},
        {opacity: 1, transform: 'translate3d(0,0,0)'}
      ], timing);
      const value = element.querySelector('.number__main');
      if (value) play(value, [
        {opacity: .5, transform: 'translate3d(0,12px,0) scale(.94)'},
        {opacity: 1, transform: 'translate3d(0,0,0) scale(1)'}
      ], {delay: delay + 150, duration: 700});
    } else if (type === 'heading') {
      play(element, [
        {opacity: .35, transform: 'translate3d(0,26px,0)', clipPath: 'inset(0 0 100% 0)'},
        {opacity: 1, transform: 'translate3d(0,0,0)', clipPath: 'inset(0 0 0 0)'}
      ], timing);
    } else {
      play(element, [
        {opacity: .3, transform: 'translate3d(0,18px,0)'},
        {opacity: 1, transform: 'translate3d(0,0,0)'}
      ], timing);
    }
  }

  function stagger(element) {
    const siblings = [...element.parentElement.children];
    return Math.min(siblings.indexOf(element) % 5, 4) * 55;
  }

  function register(selector, type) {
    main.querySelectorAll(selector).forEach(element => {
      if (targets.has(element) || !element.getClientRects().length) return;
      if (element.closest('[aria-hidden="true"], [hidden], dialog')) return;
      // A parent card already moves its contents together. Keep the layout calm.
      if (element.closest('[data-motion="card"]')) return;
      element.dataset.motion = type;
      targets.add(element);
    });
  }

  // Repeated editorial units appear throughout all source pages. Register the
  // units first so headings and images inside a card do not animate twice.
  register([
    '.interview-list__box', '.tiles__item', '.list-module-4__item',
    '.news-list__item', '.list-module-2__item', '.list-module-1__item',
    '.info-nav__item', '.recruit__inner .contents__block',
    '.konbu-step-1', '.konbu-step-2', '.konbu-step-3',
    '.award', '.banner-icon', '.box-module-1'
  ].join(','), 'card');

  register([
    '.ttl-module-1__main', '.sg-sec__ttl', '.ttl-module-2',
    '.ttl-module-3', '.ttl-module-4', '.tiles__ttl',
    '.wp-block-heading', '.itw-box__ttl', '.article__head',
    '.recruit-table .table-title', '.block-title'
  ].join(','), 'heading');

  register([
    '.about__inner-interview .sg-sec__lead', '.sg-sec__lead',
    '.txt-module-1', '.wp-block-paragraph', '.itw-box__txt',
    '.interview-list__intro', '.article__body > p',
    '.recruit__inner .contents__lead'
  ].join(','), 'copy');

  register([
    '.box-module-4', '.ship-block__left__ph', '.wp-block-image',
    '.itw-img', '.itw-box__img'
  ].join(','), 'media');

  observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      enter(entry.target, stagger(entry.target));
    }
  }, {threshold: .08, rootMargin: '0px 0px -5% 0px'});

  for (const element of targets) observer.observe(element);

  // The drone hero leads with the exact existing copy, then the subline,
  // destination and news. Only the presentation changes; text and order stay.
  const hero = main.querySelector('.mv');
  if (hero) {
    const line1 = hero.querySelector('.slogan-line:first-child');
    const line2 = hero.querySelector('.slogan-line:nth-child(2)');
    const subline = hero.querySelector('.mv__catch__sub');
    const action = hero.querySelector('.mv__catch__link');
    const news = hero.querySelector('.mv__news');
    [line1, line2, subline, action, news].forEach((element, index) => {
      if (!element) return;
      element.dataset.motion = 'hero';
      element.classList.add('is-in-view');
      play(element, [
        {opacity: 0, transform: `translate3d(0,${index < 2 ? 34 : 18}px,0)`, clipPath: 'inset(0 0 100% 0)'},
        {opacity: 1, transform: 'translate3d(0,0,0)', clipPath: 'inset(0 0 0 0)'}
      ], {duration: index < 2 ? 800 : 650, delay: 100 + index * 135});
    });
  }

  let scrollQueued = false;
  function updateScrollState() {
    body.classList.toggle('motion-scrolled', window.scrollY > 24);
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    document.documentElement.style.setProperty('--reading-progress', (distance > 0 ? Math.min(100, Math.max(0, window.scrollY / distance * 100)) : 0) + '%');
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(updateScrollState);
  }, {passive: true});
  updateScrollState();

  preference.addEventListener('change', () => {
    if (!preference.matches) return;
    observer.disconnect();
    animations.forEach(animation => animation.cancel());
    targets.forEach(element => element.classList.add('is-in-view'));
    body.classList.remove('motion-enabled');
  }, {once: true});
})();
