(() => {
  'use strict';
  const desktop = matchMedia('(min-width:960px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
  const header = document.querySelector('.header');
  const toggle = header?.querySelector('.header__close');
  const nav = header?.querySelector('.gnav');
  const pageRegions = [...document.querySelectorAll('main,.footer,.page-top')];
  let menuOpen = false, activeSubmenu = null, submenuMode = '', savedOverflow = '';
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
    submenuMode = '';
  }
  function openSubmenu(entry, mode = 'click') {
    if (activeSubmenu !== entry) closeSubmenu();
    activeSubmenu = entry;
    submenuMode = mode;
    entry.item.classList.add('open');
    entry.button.setAttribute('aria-expanded', 'true');
    entry.panel.hidden = false;
    entry.panel.inert = false;
  }
  function setMenu(open, restoreFocus = false) {
    open = open && !desktop.matches;
    if (open && !menuOpen) savedOverflow = document.body.style.overflow;
    if (!open && menuOpen) document.body.style.overflow = savedOverflow;
    if (open) document.body.style.overflow = 'hidden';
    menuOpen = open;
    document.body.classList.toggle('menu-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    }
    if (nav) nav.inert = !desktop.matches && !open;
    pageRegions.forEach(region => { region.inert = open; });
    if (!open) closeSubmenu();
    if (restoreFocus) toggle?.focus();
  }
  toggle?.addEventListener('click', () => setMenu(!menuOpen));
  submenus.forEach(entry => {
    let hoverCloseTimer;
    entry.button.addEventListener('click', () => {
      if (activeSubmenu === entry && submenuMode === 'click') closeSubmenu();
      else openSubmenu(entry);
    });
    entry.button.addEventListener('keydown', event => {
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      openSubmenu(entry);
      const links = [...entry.panel.querySelectorAll('a,button')];
      (event.key === 'ArrowUp' ? links.at(-1) : links[0])?.focus();
    });
    entry.item.addEventListener('pointerenter', event => {
      clearTimeout(hoverCloseTimer);
      if (desktop.matches && event.pointerType !== 'touch' && submenuMode !== 'click') openSubmenu(entry, 'hover');
    });
    entry.item.addEventListener('pointerleave', () => {
      hoverCloseTimer = setTimeout(() => {
        if (activeSubmenu === entry && submenuMode === 'hover' && !entry.item.contains(document.activeElement)) closeSubmenu();
      }, 250);
    });
    entry.panel.addEventListener('pointerenter', () => clearTimeout(hoverCloseTimer));
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', event => {
    if (activeSubmenu && !activeSubmenu.item.contains(event.target)) closeSubmenu();
  });
  document.addEventListener('focusin', event => {
    if (desktop.matches && activeSubmenu && !activeSubmenu.item.contains(event.target)) closeSubmenu();
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
      const items = [toggle, ...nav.querySelectorAll('a,button')].filter(element => element && !element.closest('[inert]') && element.getClientRects().length);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  desktop.addEventListener('change', () => setMenu(false));
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
