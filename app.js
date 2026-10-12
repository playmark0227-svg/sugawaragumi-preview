(() => {
  const base = document.documentElement.dataset.base || '/';
  const menu = document.querySelector('.site-directory');
  const toggle = document.querySelector('.index-toggle');
  const search = document.querySelector('#site-search');
  const close = () => {menu.hidden=true;toggle.setAttribute('aria-expanded','false');document.body.style.overflow='';toggle.focus();};
  toggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':'';if(open)search.focus();});
  document.querySelector('.directory-close').addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden)close();if(e.key==='Tab'&&!menu.hidden){const items=[...menu.querySelectorAll('a,button,input')].filter(x=>x.getClientRects().length);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  document.querySelectorAll('.header-links>a').forEach(a=>{if(a.pathname===location.pathname)a.setAttribute('aria-current','page');});
  let indexPromise;
  const getIndex=()=>indexPromise||(indexPromise=fetch(base+'search-index.json').then(r=>{if(!r.ok)throw Error('index');return r.json();}));
  const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let searchSerial=0;
  search.addEventListener('input',async()=>{
    const serial=++searchSerial;const q=search.value.trim().toLocaleLowerCase();
    const groups=document.querySelector('.site-directory .directory-groups');const results=document.querySelector('.search-results');
    groups.hidden=!!q;results.hidden=!q;if(!q)return;
    try{const data=await getIndex();if(serial!==searchSerial)return;const terms=q.split(/\s+/);const found=data.filter(p=>terms.every(t=>(p.title+' '+p.text).toLocaleLowerCase().includes(t))).slice(0,60);results.innerHTML=found.length?found.map(p=>`<a href="${base+safe(p.route)}"><small>${safe(p.category)}${p.date?' / '+safe(p.date):''}</small><strong>${safe(p.title)}</strong><p>${safe(p.text.slice(0,120))}…</p></a>`).join(''):'<p class="search-empty">該当する掲載内容はありません。</p>';}
    catch{results.innerHTML='<p class="search-empty">検索情報を読み込めませんでした。メニューからお探しください。</p>';}
  });
  const video=document.querySelector('.hero-media video');const videoBtn=document.querySelector('.video-control');
  if(video&&videoBtn){const sync=()=>{videoBtn.setAttribute('aria-label',video.paused?'ドローン映像を再生':'ドローン映像を一時停止');videoBtn.innerHTML=`<span>${video.paused?'▷':'Ⅱ'}</span>${video.paused?'PLAY':'PAUSE'}`;};if(matchMedia('(prefers-reduced-motion: reduce)').matches){video.removeAttribute('autoplay');video.pause();}video.addEventListener('play',sync);video.addEventListener('pause',sync);video.addEventListener('error',()=>{videoBtn.hidden=true;});videoBtn.addEventListener('click',()=>video.paused?video.play().catch(sync):video.pause());sync();}
  const fleetBtns=document.querySelectorAll('[data-ship]');
  if(fleetBtns.length){const ships=JSON.parse(document.querySelector('#fleet-data').textContent);fleetBtns.forEach(btn=>btn.addEventListener('click',()=>{const s=ships.find(x=>x.id===btn.dataset.ship);if(!s)return;document.querySelector('#fleet-photo').src=base+s.image;document.querySelector('#fleet-photo').alt=s.name;document.querySelector('#fleet-name').textContent=s.name;document.querySelector('#fleet-type').textContent=s.type;document.querySelector('#fleet-capacity').innerHTML=s.stat;document.querySelector('#fleet-description').textContent=s.description;document.querySelector('#fleet-number').textContent=s.id.padStart(2,'0');document.querySelector('#fleet-detail').href=base+s.route;fleetBtns.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));}));}
  const newsRoot=document.querySelector('#news-list');
  if(newsRoot){const news=JSON.parse(document.querySelector('#news-data').textContent);const input=document.querySelector('#news-search');const pager=document.querySelector('.pagination');const count=document.querySelector('#news-count');let category='all',page=1;const pageSize=15;
    const render=()=>{const q=input.value.trim().toLocaleLowerCase();const matches=news.filter(n=>(category==='all'||n.category===category)&&(!q||(n.title+' '+n.text).toLocaleLowerCase().includes(q)));const pages=Math.ceil(matches.length/pageSize);page=Math.max(1,Math.min(page,pages||1));count.textContent=`${matches.length}件 / 全${news.length}件`;newsRoot.innerHTML=matches.slice((page-1)*pageSize,page*pageSize).map(n=>`<a href="${base+safe(n.route)}"><time>${safe(n.date)}</time><span class="news-tag">${safe(n.category)}</span><h3>${safe(n.title)}</h3><span>↗</span></a>`).join('')||'<p class="search-empty">該当する記事はありません。</p>';pager.innerHTML=Array.from({length:pages},(_,i)=>`<button aria-label="${i+1}ページ目" ${page===i+1?'aria-current="page"':''} data-page="${i+1}">${i+1}</button>`).join('');pager.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{page=Number(b.dataset.page);render();document.querySelector('.archive-controls').scrollIntoView({block:'start'});}));};
    input.addEventListener('input',()=>{page=1;render();});document.querySelectorAll('[data-category-filter]').forEach(btn=>btn.addEventListener('click',()=>{category=btn.dataset.categoryFilter;page=1;document.querySelectorAll('[data-category-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));render();}));const query=new URLSearchParams(location.search);if(query.has('q'))input.value=query.get('q');render();
  }
})();
