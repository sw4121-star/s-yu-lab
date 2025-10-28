alt:'石库门的门框边缘，被手掌磨亮' },


{ id:'Plumbing', name:'Plumbing',
indexImg:'https://picsum.photos/id/1031/1200/800',
heroImg:'https://picsum.photos/id/1035/1600/1000',
thumbImg:'https://picsum.photos/id/1036/400/250',
alt:'被撕去的海报留下浅浅文字幽灵' },


{ id:'Room', name:'Room',
indexImg:'https://picsum.photos/id/1043/1200/800',
heroImg:'https://picsum.photos/id/1045/1600/1000',
thumbImg:'https://picsum.photos/id/1049/400/250',
alt:'金属栏杆被海风氧化的铜绿' },


{ id:'Ground', name:'Ground',
indexImg:'https://picsum.photos/id/1050/1200/800',
heroImg:'https://picsum.photos/id/1052/1600/1000',
thumbImg:'https://picsum.photos/id/1053/400/250',
alt:'桥下回声与光线碎片' },


{ id:'Street', name:'Street',
indexImg:'https://picsum.photos/id/1067/1200/800',
heroImg:'https://picsum.photos/id/1069/1600/1000',
thumbImg:'https://picsum.photos/id/1070/400/250',
alt:'LED 屏残影叠加在玻璃幕墙' },


{ id:'Habitants', name:'Habitants',
indexImg:'https://picsum.photos/id/1074/1200/800',
heroImg:'https://picsum.photos/id/1076/1600/1000',
thumbImg:'https://picsum.photos/id/1077/400/250',
alt:'狭窄巷道的木纹围挡' }
];


const indexView = document.getElementById('indexView');
const detailView = document.getElementById('detailView');
const backBtn = document.getElementById('backBtn');


function renderIndex(){
indexView.innerHTML='';
entries.forEach((e,i)=>{
const block=document.createElement('article');
block.className='block';
block.setAttribute('role','listitem');
block.innerHTML = `
<div class="photo-wrap">
<img src="${e.indexImg}" alt="${e.alt}" loading="lazy">
</div>
<h2 class="name"><a href="#${e.id}" data-id="${e.id}">${String(i+1).padStart(2,'0')} — ${e.name}</a></h2>
`;
indexView.appendChild(block);
});
}


const titleEl = document.getElementById('detailTitle');
const heroImg = document.getElementById('heroImg');
const thumbImg = document.getElementById('thumbImg');
const caption = document.getElementById('heroCaption');


function showDetail(id){
const entry = entries.find(x => x.id === id);
if(!entry){ return showIndex(); }
titleEl.textContent = entry.name;
heroImg.src = entry.heroImg; heroImg.alt = entry.alt;
thumbImg.src = entry.thumbImg; thumbImg.alt = entry.alt + '（缩略图）';
caption.textContent = entry.alt;
indexView.style.display = 'none';
detailView.classList.add('active');
window.scrollTo({top:0, behavior:'smooth'});
}


function showIndex(){
detailView.classList.remove('active');
indexView.style.display = '';
}


function handleRoute(){
const id = decodeURIComponent(location.hash.replace('#',''));
if(id){ showDetail(id); }
else{ showIndex(); }
}


window.addEventListener('hashchange', handleRoute);
backBtn.addEventListener('click',(e)=>{
e.preventDefault();
history.pushState('', document.title, window.location.pathname + window.location.search);
handleRoute();
});


renderIndex();
handleRoute();