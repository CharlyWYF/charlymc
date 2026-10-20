const source='https://cy23ivqg59.feishu.cn/wiki/XXj6wjCvliXPeOkxqFncqJqLncb';
document.querySelector('#archive-list').innerHTML=[['4.0','历史版本'],['3.5','历史版本'],['3.4','含 AX'],['3.3','历史版本']].map(([v,label])=>`<a href="${source}#AGpodSE8DoetpextfF5cZt3Inrg" target="_blank" rel="noopener" aria-label="前往飞书查找 ${v} 版本"><strong>${v}</strong><span>${label}</span><i>↗</i></a>`).join('');
let toastTimer;function toast(msg){let el=document.querySelector('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600)}
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(button.dataset.copy);toast('服务器地址已复制，游戏里见！')}catch{toast('服务器地址：'+button.dataset.copy)}}));
const canvas=document.querySelector('#world'),ctx=canvas.getContext('2d');
function draw(){const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=box.width*dpr;canvas.height=box.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);let w=box.width,h=box.height;ctx.fillStyle='#e6eddf';ctx.fillRect(0,0,w,h);const scale=Math.min(w/550,h/470);ctx.save();ctx.translate(w/2,h*.48);ctx.scale(scale,scale);
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
