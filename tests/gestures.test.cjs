const {test}=require('node:test');
const assert=require('node:assert/strict');
const install=require('../dist/gestures.js');
function setup(initial=0){
 const handlers={};let active=initial,selection='',busy=false;
 const moved=[];
 const target={nodeType:1,parentElement:null,scrollWidth:800,clientWidth:800,closest(selector){return selector==='main, .header'?this:null;}};
 const view={innerWidth:800,getSelection:()=>({toString:()=>selection}),getComputedStyle:()=>({overflowX:'visible'})};
 const root={defaultView:view,addEventListener:(name,fn)=>handlers[name]=fn,removeEventListener:()=>{}};
 install({root,tabIds:['home','versions','guide','town'],getActiveTabId:()=>['home','versions','guide','town'][active],navigate:id=>{active=['home','versions','guide','town'].indexOf(id);moved.push(id);},isTransitioning:()=>busy});
 const emit=(name,args={})=>{let prevented=false,stopped=false;handlers[name]({target,timeStamp:1000,cancelable:true,deltaX:0,deltaY:0,deltaMode:0,detail:1,preventDefault:()=>prevented=true,stopImmediatePropagation:()=>stopped=true,...args});return{prevented,stopped};};
 return{emit,moved,target,view,setSelection:v=>selection=v,setBusy:v=>busy=v};
}
test('horizontal wheel advances once for a continuous inertial gesture',()=>{
 const x=setup();x.emit('wheel',{deltaX:35});x.emit('wheel',{deltaX:35,timeStamp:1020});
 for(let i=1;i<=20;i++)x.emit('wheel',{deltaX:20,timeStamp:1020+i*100});
 assert.deepEqual(x.moved,['versions']);
 x.emit('wheel',{deltaX:-80,timeStamp:3500});assert.deepEqual(x.moved,['versions','home']);
});
test('vertical, diagonal and pinch-zoom wheel remain native',()=>{
 for(const args of [{deltaY:100},{deltaX:60,deltaY:70},{deltaX:100,ctrlKey:true}]){
  const x=setup();assert.equal(x.emit('wheel',args).prevented,false);assert.deepEqual(x.moved,[]);
 }
});
test('line and page wheel deltas are normalized',()=>{
 for(const args of [{deltaX:5,deltaMode:1},{deltaX:1,deltaMode:2}]){
  const x=setup();x.emit('wheel',args);assert.deepEqual(x.moved,['versions']);
 }
});
test('edges do not wrap and in-flight transitions do not get skipped',()=>{
 const first=setup();first.emit('wheel',{deltaX:-100});assert.deepEqual(first.moved,[]);
 const last=setup(3);last.emit('wheel',{deltaX:100});assert.deepEqual(last.moved,[]);
 const busy=setup();busy.setBusy(true);busy.emit('wheel',{deltaX:100});assert.deepEqual(busy.moved,[]);
});
test('nested horizontal scrollers, editable controls and selected text are untouched',()=>{
 const scroll=setup();scroll.target.scrollWidth=1200;scroll.view.getComputedStyle=()=>({overflowX:'auto'});
 assert.equal(scroll.emit('wheel',{deltaX:100}).prevented,false);
 const editable=setup();editable.target.closest=selector=>editable.target;
 assert.equal(editable.emit('wheel',{deltaX:100}).prevented,false);
 const selection=setup();selection.setSelection('text');assert.equal(selection.emit('wheel',{deltaX:100}).prevented,false);
});
const point=(x,y=100,id=1)=>({identifier:id,clientX:x,clientY:y});
function swipe(x,from,to,dy=0){x.emit('touchstart',{touches:[point(from)]});x.emit('touchmove',{touches:[point(to,100+dy)],timeStamp:1050});x.emit('touchend',{changedTouches:[point(to,100+dy)],touches:[],timeStamp:1100});}
test('touch swipe follows finger direction and suppresses its follow-up click',()=>{
 const x=setup();swipe(x,400,250);assert.deepEqual(x.moved,['versions']);
 assert.deepEqual(x.emit('click',{timeStamp:1150}),{prevented:true,stopped:true});
 assert.equal(x.emit('click',{timeStamp:1150,detail:0}).prevented,false);
 const reverse=setup(1);swipe(reverse,250,400);assert.deepEqual(reverse.moved,['home']);
});
test('touch taps, small drags, vertical swipes and screen edges do not switch tabs',()=>{
 for(const [from,to,dy] of [[400,400,0],[400,380,0],[400,350,160],[10,160,0]]){
  const x=setup();swipe(x,from,to,dy);assert.deepEqual(x.moved,[]);
 }
 const tap=setup();swipe(tap,400,400);assert.equal(tap.emit('click',{timeStamp:1150}).prevented,false);
});
test('multitouch and canceled gestures do not navigate',()=>{
 const x=setup();x.emit('touchstart',{touches:[point(400)]});
 x.emit('touchmove',{touches:[point(250),point(300,120,2)]});
 x.emit('touchend',{changedTouches:[point(250)],touches:[]});assert.deepEqual(x.moved,[]);
 const canceled=setup();canceled.emit('touchstart',{touches:[point(400)]});canceled.emit('touchmove',{touches:[point(250)]});canceled.emit('touchcancel');canceled.emit('touchend',{changedTouches:[point(250)],touches:[]});assert.deepEqual(canceled.moved,[]);
});
