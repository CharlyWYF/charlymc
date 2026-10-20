const releases = window.CHARLY_RELEASES;
const latest = releases[0];
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function channels(release) {
  return `<div class="download-channels"><button type="button" class="button primary download-trigger" data-download-version="${escapeHtml(release.version)}" aria-haspopup="dialog" aria-expanded="false" aria-controls="download-picker">下载 v${escapeHtml(release.version)} <span aria-hidden="true">↓</span></button></div>`;
}
function changeRows(release) {
  if (!release.changes.length) return '<p class="pending-note">此版本的更新日志待整理。</p>';
  return `<div class="update-list">${release.changes.map((change,index) => `<article><span class="change-tag ${change.type==='新增'?'add':change.type==='调整'?'opt':''}">${escapeHtml(change.type)}</span><div><h3>${escapeHtml(change.title)}</h3><p>${escapeHtml(change.text).replace(/`([^`]+)`/g, '<kbd>$1</kbd>')}</p></div><span class="row-num">${String(index+1).padStart(2,'0')}</span></article>`).join('')}</div>`;
}
document.querySelectorAll('[data-latest-version]').forEach(el => el.textContent=latest.version);
document.querySelector('#latest-download').innerHTML = `<div class="download-panel"><div class="version-art"><span>CHARLYMC</span><strong>${escapeHtml(latest.version)}</strong><div class="block-logo" aria-hidden="true"><i></i><i></i><i></i></div><small>THE NEXT CHAPTER</small></div><div class="download-info"><div class="release-label">最新发布 <span>VERSION ${escapeHtml(latest.version)}</span></div><h3>${escapeHtml(latest.title)}</h3><p>${escapeHtml(latest.summary)}<br>下载整合包，跟着指南导入 PCL，就能和大家汇合。</p><div class="file-meta"><span>ZIP 整合包</span><span>${escapeHtml(latest.size)}</span><span>通过 PCL 导入</span></div>${channels(latest)}<small class="download-hint">选择下载渠道 · 下载后无需解压</small></div></div>`;
document.querySelector('#latest-changelog').innerHTML=`<div class="update-layout"><div class="update-version"><strong>${escapeHtml(latest.version)}</strong><span>本次更新</span><p>给日常冒险，<br>添一点新鲜感。</p></div>${changeRows(latest)}</div>`;
document.querySelector('#version-list').innerHTML=releases.map((release,index)=>`<article class="release-card"><header class="release-header"><div><span class="release-number">${escapeHtml(release.version)}</span>${index===0?'<span class="latest-badge">最新版本</span>':''}${release.note?`<span class="release-note">${escapeHtml(release.note)}</span>`:''}</div><span class="release-file">${release.size?escapeHtml(release.size)+' · ZIP 整合包':'历史版本'}</span></header><div class="release-body"><div class="release-log"><h2>更新日志</h2>${changeRows(release)}</div><div class="release-download"><h2>下载整合包</h2>${channels(release)}${release.downloadUrl?'<p class="pending-note">通过 PCL 导入，无需解压。</p>':''}</div></div></article>`).join('');

// A shared top-layer popover stays above cards and never changes their layout.
const downloadPicker=document.createElement('div');
downloadPicker.id='download-picker';
downloadPicker.className='download-picker';
downloadPicker.setAttribute('popover','manual');
downloadPicker.setAttribute('role','dialog');
downloadPicker.setAttribute('aria-label','选择下载渠道');
downloadPicker.setAttribute('data-no-swipe','');
const supportsPopover=typeof downloadPicker.showPopover==='function';
if(!supportsPopover)downloadPicker.hidden=true;
document.body.append(downloadPicker);
let downloadTrigger=null;
function pickerIsOpen(){return supportsPopover?downloadPicker.matches(':popover-open'):!downloadPicker.hidden;}
function closeDownloadPicker({restoreFocus=false}={}){
  if(!pickerIsOpen())return;
  if(supportsPopover)downloadPicker.hidePopover();else downloadPicker.hidden=true;
  downloadTrigger?.setAttribute('aria-expanded','false');
  if(restoreFocus)downloadTrigger?.focus();
}
function positionDownloadPicker(){
  if(!downloadTrigger||!pickerIsOpen())return;
  const rect=downloadTrigger.getBoundingClientRect();
  const width=downloadPicker.offsetWidth,height=downloadPicker.offsetHeight;
  const gap=10,edge=12;
  const left=Math.max(edge,Math.min(rect.left,window.innerWidth-width-edge));
  const top=rect.bottom+gap+height<=window.innerHeight-edge?rect.bottom+gap:Math.max(edge,rect.top-height-gap);
  downloadPicker.style.left=left+'px';
  downloadPicker.style.top=top+'px';
}
function showDownloadPicker(trigger){
  if(downloadTrigger===trigger&&pickerIsOpen()){closeDownloadPicker();return;}
  closeDownloadPicker();
  const release=releases.find(item=>item.version===trigger.dataset.downloadVersion);
  if(!release)return;
  downloadTrigger=trigger;
  const sources=[
    {name:'GitHub',description:'主下载',icon:'GH',url:release.downloadUrl||release.githubUrl},
    {name:'NAS',description:'备用直链',icon:'NAS',url:release.nasUrl},
    {name:'飞书',description:'所有版本总览',icon:'飞',url:window.CHARLY_DOWNLOADS?.feishuUrl}
  ];
  downloadPicker.innerHTML=`<p class="picker-label">v${escapeHtml(release.version)} · 选择下载渠道</p><div class="picker-options">${sources.map(source=>{
    const content=`<span class="channel-icon" aria-hidden="true">${source.icon}</span><span class="channel-name">${source.name}<small>${source.url?source.description:'此版本暂未提供'}</small></span><span class="channel-arrow" aria-hidden="true">${source.url?'↗':'—'}</span>`;
    return source.url?`<a class="channel-option" href="${escapeHtml(source.url)}"${source.name==='飞书'?' target="_blank" rel="noopener"':''}>${content}</a>`:`<button type="button" class="channel-option" disabled>${content}</button>`;
  }).join('')}</div>`;
  if(supportsPopover)downloadPicker.showPopover();else downloadPicker.hidden=false;
  trigger.setAttribute('aria-expanded','true');
  positionDownloadPicker();
  downloadPicker.querySelector('a')?.focus({preventScroll:true});
}
document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-download-version]');
  if(trigger){showDownloadPicker(trigger);return;}
  if(!downloadPicker.contains(event.target))closeDownloadPicker();
  else if(event.target.closest('a'))closeDownloadPicker();
});
downloadPicker.addEventListener('toggle',()=>{
  if(!pickerIsOpen())downloadTrigger?.setAttribute('aria-expanded','false');
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&pickerIsOpen()){event.preventDefault();closeDownloadPicker({restoreFocus:true});}
});
window.addEventListener('scroll',()=>{if(pickerIsOpen())positionDownloadPicker();},true);
window.addEventListener('resize',()=>closeDownloadPicker());

const tabs = [...document.querySelectorAll('[role="tab"]')];
const tabIds = tabs.map(tab=>tab.dataset.tab);
const main = document.querySelector('main');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const tabIndicator = document.createElement('span');
tabIndicator.className = 'tab-indicator';
tabIndicator.setAttribute('aria-hidden','true');
document.querySelector('.tabs').append(tabIndicator);
let activeTabId = null;
let finishTransition = null;
function moveIndicator() {
  const selected=tabs.find(tab=>tab.dataset.tab===activeTabId);
  if(!selected)return;
  tabIndicator.style.width=selected.offsetWidth+'px';
  tabIndicator.style.transform=`translateX(${selected.offsetLeft}px)`;
}
new ResizeObserver(moveIndicator).observe(document.querySelector('.tabs'));
function activateTab(id, {focus=false, scroll=false, animate=true}={}) {
  closeDownloadPicker();
  if (!tabIds.includes(id)) id='home';
  if(finishTransition)finishTransition();
  const previousId=activeTabId;
  const previous=previousId?document.querySelector('#panel-'+previousId):null;
  const next=document.querySelector('#panel-'+id);
  const previousHeight=previous?.getBoundingClientRect().height || 0;
  const canAnimate=animate&&previous&&previousId!==id&&!reducedMotion.matches;
  activeTabId=id;
  tabs.forEach(tab=>{
    const selected=tab.dataset.tab===id;
    const panel=document.querySelector('#'+tab.getAttribute('aria-controls'));
    tab.setAttribute('aria-selected',String(selected));
    tab.tabIndex=selected?0:-1;
    panel.hidden=!selected;
    panel.inert=!selected;
    panel.setAttribute('aria-hidden',String(!selected));
    if(selected&&(focus||previous?.contains(document.activeElement)))tab.focus();
  });
  moveIndicator();
  document.title=id==='home'?'CharlyMC · 一起，方块之间':`${tabs.find(tab=>tab.dataset.tab===id).textContent} · CharlyMC`;
  if(scroll)window.scrollTo({top:0,behavior:'instant'});
  if(!canAnimate)return Promise.resolve();
  const direction=tabIds.indexOf(id)>tabIds.indexOf(previousId)?1:-1;
  const nextHeight=next.getBoundingClientRect().height;
  previous.hidden=false;
  previous.classList.add('tab-outgoing');
  main.classList.add('tabs-moving');
  const timing={duration:380,easing:'cubic-bezier(.22,.68,0,1)',fill:'both'};
  const animations=[
    previous.animate([{transform:'translateX(0)'},{transform:`translateX(${-direction*100}%)`}],timing),
    next.animate([{transform:`translateX(${direction*100}%)`},{transform:'translateX(0)'}],timing),
    main.animate([{height:previousHeight+'px'},{height:nextHeight+'px'}],timing)
  ];
  return new Promise(resolve=>{
    let finished=false;
    const cleanup=()=>{
      if(finished)return;
      finished=true;
      animations.forEach(animation=>animation.cancel());
      previous.hidden=true;
      previous.classList.remove('tab-outgoing');
      main.classList.remove('tabs-moving');
      if(finishTransition===cleanup)finishTransition=null;
      resolve();
    };
    finishTransition=cleanup;
    Promise.all(animations.map(animation=>animation.finished)).then(cleanup,cleanup);
  });
}
function navigate(id, jump) {
  if(location.hash !== '#'+id)history.pushState(null,'','#'+id);
  activateTab(id,{scroll:!jump}).then(()=>{
    if(jump&&activeTabId===id)document.getElementById(jump)?.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'});
  });
}
tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>navigate(tab.dataset.tab));
  tab.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    if(next!==undefined){event.preventDefault();navigate(tabs[next].dataset.tab);tabs[next].focus();}
  });
});
document.querySelectorAll('[data-panel-link], [data-jump]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();navigate(link.dataset.panelLink||'home',link.dataset.jump);}));
function restoreTab(){activateTab(location.hash.slice(1)||'home',{scroll:true});}
window.addEventListener('resize',()=>{if(finishTransition)finishTransition();});
reducedMotion.addEventListener('change',()=>{if(finishTransition)finishTransition();});
window.addEventListener('popstate',restoreTab);
window.addEventListener('hashchange',restoreTab);
activateTab(location.hash.slice(1)||'home',{animate:false});
installTabGestures({root:document,tabIds,getActiveTabId:()=>activeTabId,navigate,isTransitioning:()=>!!finishTransition});
let toastTimer;
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(button.dataset.copy);toast('服务器地址已复制，游戏里见！');}catch{toast('服务器地址：'+button.dataset.copy);}}));
const canvas=document.querySelector('#world'),ctx=canvas.getContext('2d');
function draw(){const box=canvas.getBoundingClientRect();if(!box.width||!box.height)return;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=box.width*dpr;canvas.height=box.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);let w=box.width,h=box.height;ctx.fillStyle='#e6eddf';ctx.fillRect(0,0,w,h);const scale=Math.min(w/550,h/470);ctx.save();ctx.translate(w/2,h*.48);ctx.scale(scale,scale);
// An isometric block world, drawn locally without remote image dependencies.
const unit=15,N=21;function point(x,y,z){return[(x-y)*unit,(x+y)*unit*.49-z*unit*.9]}
function poly(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()}
function block(x,y,z,color,side1,side2,height=1){let a=point(x,y,z+height),b=point(x+1,y,z+height),c=point(x+1,y+1,z+height),d=point(x,y+1,z+height),e=point(x+1,y,z),f=point(x+1,y+1,z),g=point(x,y+1,z);poly([b,c,f,e],side1);poly([d,c,f,g],side2);poly([a,b,c,d],color)}
// Soft ground shadow.
ctx.save();ctx.scale(1,.43);ctx.fillStyle='#b9c8ac';ctx.filter='blur(14px)';ctx.beginPath();ctx.ellipse(0,270,267,125,0,0,Math.PI*2);ctx.fill();ctx.restore();
function river(x,y){return Math.abs(x-(8+Math.sin(y*.34)*2.8))<1.7}
function terrain(x,y){if(river(x,y))return 1;let m=Math.max(0,6-Math.hypot(x-4,y-3)*.75)+Math.max(0,3.2-Math.hypot(x-17,y-5)*.5);return 2+Math.floor(m)}
const height=Array.from({length:N},(_,x)=>Array.from({length:N},(_,y)=>terrain(x,y)));
for(let sum=0;sum<N*2;sum++)for(let x=0;x<N;x++){let y=sum-x;if(y<0||y>=N)continue;let z=height[x][y],water=river(x,y);let shade=Math.sin(x*15+y*28)*.5+.5;let top=water?(shade>.5?'#8bb8b8':'#96c1bf'):(shade>.6?'#8ca75b':shade>.3?'#9bb76a':'#a6bd72');block(x-N/2,y-N/2,-3,top,water?'#759b9a':'#93856a',water?'#6f9293':'#ac9a77',z+3);if((x*17+y*31)%79===0&&!water&&z<=3){block(x-N/2+.2,y-N/2+.2,z,'#c8c4a9','#aaa58e','#b8b39b',.5)}}
function tree(x,y,z,size=1){block(x,y,z,'#887453','#796247','#927b55',2*size);for(let t=0;t<3;t++){let wid=(3-t)*.75*size;for(let a=0;a<Math.ceil(wid);a++)for(let b=0;b<Math.ceil(wid);b++)block(x+a-wid/2+.5,y+b-wid/2+.5,z+1.7*size+t*.9,'#5e7f4d','#47633d','#6c8b50',1.3*size)}}
const objects=[];for(let x=1;x<N-1;x++)for(let y=1;y<N-1;y++)if(!river(x,y)&&Math.abs(x-(8+Math.sin(y*.34)*2.8))>3&&(x*13+y*7)%19===0&&!(x>12&&y>10))objects.push({x,y,type:'tree'});
objects.push({x:15,y:13,type:'house'});objects.sort((a,b)=>(a.x+a.y)-(b.x+b.y));for(let ob of objects){let x=ob.x-N/2,y=ob.y-N/2,z=height[ob.x][ob.y];if(ob.type==='tree'){tree(x,y,z,.85+(ob.x%3)*.13)}else{for(let a=0;a<4;a++)for(let b=0;b<3;b++){block(x+a,y+b,z,'#c4ae7f','#b99d70','#d1bb88',2.5);if(b===2&&a===1)block(x+a+.25,y+b+.02,z+.1,'#776346','#66563f','#6b593f',1.8);if(a===3&&b===1)block(x+a+.02,y+b+.2,z+1.1,'#e8d99b','#9eb7ac','#cad1b5',.8);let roofHeight=1+Math.max(0,1.7-Math.abs(b-1)*1.1);block(x+a-.15,y+b-.15,z+2.5,'#9d664b','#81553e','#b67b56',roofHeight)}block(x+1,y+.3,z+5,'#afa48b','#908570','#c1b59b',1.3);for(let a=0;a<4;a++)block(x+a,y+3,z,'#c7ba8e','#ab9c76','#b9aa7e',.12)}}
// A short wooden bridge across the stream.
for(let x=5;x<11;x++)for(let y=14;y<16;y++)block(x-N/2,y-N/2,2,'#bfa67b','#947b55','#a18b62',.25);
// Tiny flowers in the meadow.
for(let n=0;n<21;n++){let x=(n*7+3)%20,y=(n*11+9)%20;if(river(x,y)||height[x][y]>3)continue;let [px,py]=point(x-N/2+.5,y-N/2+.5,height[x][y]);ctx.fillStyle=n%2?'#e9dda2':'#e9eee0';ctx.fillRect(px-1,py-5,3,3);ctx.fillStyle='#789250';ctx.fillRect(px,py-2,1,4)}
ctx.restore();}
new ResizeObserver(draw).observe(canvas);draw();
