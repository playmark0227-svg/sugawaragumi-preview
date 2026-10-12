(()=>{
 const header=document.querySelector('.header'),toggle=header?.querySelector('.header__close'),nav=header?.querySelector('.gnav');
 const setMenu=open=>{document.body.classList.toggle('menu-open',open);if(toggle){toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'メニューを閉じる':'メニューを開く');}document.body.style.overflow=open?'hidden':'';};
 toggle?.addEventListener('click',()=>setMenu(!document.body.classList.contains('menu-open')));
 header?.querySelectorAll('.gnav__item-1--sub > .gnav__item-1__link').forEach(button=>button.addEventListener('click',()=>{const item=button.parentElement,open=!item.classList.contains('open');item.classList.toggle('open',open);button.setAttribute('aria-expanded',String(open));}));
 nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){setMenu(false);toggle?.focus();header?.querySelectorAll('.gnav__item-1.open').forEach(x=>{x.classList.remove('open');x.querySelector('[aria-expanded]')?.setAttribute('aria-expanded','false');});}if(e.key==='Tab'&&document.body.classList.contains('menu-open')){const items=[toggle,...nav.querySelectorAll('a,button')].filter(x=>x&&x.getClientRects().length),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 matchMedia('(min-width:960px)').addEventListener('change',()=>setMenu(false));
 const video=document.querySelector('.mv__video'),control=document.querySelector('.mv-video-control');
 if(video&&control){const sync=()=>{control.textContent=video.paused?'PLAY':'PAUSE';control.setAttribute('aria-label',video.paused?'ドローン映像を再生':'ドローン映像を一時停止');};if(matchMedia('(prefers-reduced-motion:reduce)').matches){video.removeAttribute('autoplay');video.pause();}video.addEventListener('pause',sync);video.addEventListener('play',sync);control.addEventListener('click',()=>video.paused?video.play().catch(sync):video.pause());sync();}
})();
