const entries = [
{ id:'Air', name:'Kowloon Corridor', img:'https://picsum.photos/id/1011/1600/1000', thumb:'https://picsum.photos/id/1011/400/250', alt:'潮湿的走廊，陈旧瓷砖上映出霓虹反光' },
{ id:'Roof', name:'Lilong Threshold', img:'https://picsum.photos/id/1024/1600/1000', thumb:'https://picsum.photos/id/1024/400/250', alt:'石库门的门框边缘，被手掌磨亮' },
{ id:'Plumbing', name:'Hutong Wall Ghost', img:'https://picsum.photos/id/1031/1600/1000', thumb:'https://picsum.photos/id/1031/400/250', alt:'被撕去的海报留下浅浅文字幽灵' },
{ id:'Room', name:'Bund Patina', img:'https://picsum.photos/id/1043/1600/1000', thumb:'https://picsum.photos/id/1043/400/250', alt:'金属栏杆被海风氧化的铜绿' },
{ id:'Ground', name:'Manhattan Bridge Echo', img:'https://picsum.photos/id/1050/1600/1000', thumb:'https://picsum.photos/id/1050/400/250', alt:'桥下回声与光线碎片' },
{ id:'Street', name:'Times Square Burn-in', img:'https://picsum.photos/id/1067/1600/1000', thumb:'https://picsum.photos/id/1067/400/250', alt:'LED 屏残影叠加在玻璃幕墙' },
{ id:'Habitants', name:'Ginza Alley Grain', img:'https://picsum.photos/id/1074/1600/1000', thumb:'https://picsum.photos/id/1074/400/250', alt:'狭窄巷道的木纹围挡' }
];
const indexView = document.getElementById('indexView');
const detailView = document.getElementById('detailView');
const backBtn = document.getElementById('backBtn');
function renderIndex(){ indexView.innerHTML=''; entries.forEach((e,i)=>{ const block=document.createElement('article'); block.className='block'; block.setAttribute('role','listitem'); block.innerHTML=`<div class="photo-wrap"><img src="${e.img}" alt="" loading="lazy"></div><h2 class="name"><a href="#${e.id}" data-id="${e.id}">${String(i+1).padStart(2,'0')} — ${e.name}</a></h2>`; indexView.appendChild(block); }); }
const titleEl=document.getElementById('detailTitle');
const heroImg=document.getElementById('heroImg');
const thumbImg=document.getElementById('thumbImg');
const caption=document.getElementById('heroCaption');
function showDetail(id){ const entry=entries.find(x=>x.id===id); if(!entry){return showIndex();} titleEl.textContent=entry.name; heroImg.src=entry.img; heroImg.alt=entry.alt; thumbImg.src=entry.thumb; thumbImg.alt=entry.alt+'（缩略图）'; caption.textContent=entry.alt; indexView.style.display='none'; detailView.classList.add('active'); window.scrollTo({top:0,behavior:'smooth'}); }
function showIndex(){ detailView.classList.remove('active'); indexView.style.display=''; }
function handleRoute(){ const id=decodeURIComponent(location.hash.replace('#','')); if(id){ showDetail(id);} else{ showIndex();} }
window.addEventListener('hashchange', handleRoute);
backBtn.addEventListener('click',(e)=>{ e.preventDefault(); history.pushState('',document.title,window.location.pathname+window.location.search); handleRoute(); });
renderIndex(); handleRoute();