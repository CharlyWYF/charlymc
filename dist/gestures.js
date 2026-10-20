// One deliberate horizontal gesture advances one tab; vertical scrolling stays native.
(function (scope) {
  function installTabGestures({root, tabIds, getActiveTabId, navigate, isTransitioning}) {
    const view=root.defaultView || scope;
    let wheel={last:0,axis:null,total:0,fired:false};
    let wheelCooldownUntil=0;
    let touch=null;
    let suppressClickUntil=0;
    function element(target){return target?.nodeType===1?target:target?.parentElement;}
    function eligible(target){
      const el=element(target);
      return !!el?.closest('main, .header') && !el.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [data-no-swipe]');
    }
    function hasHorizontalScroller(target){
      for(let el=element(target);el&&el!==root.documentElement;el=el.parentElement){
        const overflow=view.getComputedStyle(el).overflowX;
        if(el.scrollWidth>el.clientWidth+2 && /^(auto|scroll)$/.test(overflow))return true;
      }
      return false;
    }
    function hasSelection(){return !!view.getSelection()?.toString();}
    function advance(direction){
      const index=tabIds.indexOf(getActiveTabId());
      const next=index+direction;
      if(index<0||next<0||next>=tabIds.length||isTransitioning())return false;
      navigate(tabIds[next]);
      return true;
    }
    function onWheel(event){
      if(event.ctrlKey||event.metaKey||!eligible(event.target)||hasHorizontalScroller(event.target)||hasSelection())return;
      const now=event.timeStamp;
      if(now-wheel.last>220)wheel={last:now,axis:null,total:0,fired:false};
      wheel.last=now;
      const factor=event.deltaMode===1?16:event.deltaMode===2?view.innerWidth:1;
      const dx=event.deltaX*factor,dy=event.deltaY*factor;
      if(!wheel.axis){
        if(Math.abs(dx)<2&&Math.abs(dy)<2)return;
        wheel.axis=Math.abs(dx)>Math.abs(dy)*1.3?'x':'y';
      }
      if(wheel.axis!=='x')return;
      if(event.cancelable)event.preventDefault();
      if(wheel.fired||now<wheelCooldownUntil)return;
      // Reversing before the threshold starts a fresh directional intent.
      if(wheel.total*dx<0)wheel.total=0;
      wheel.total+=dx;
      if(Math.abs(wheel.total)>=64){
        wheel.fired=true;
        wheelCooldownUntil=now+600;
        advance(Math.sign(wheel.total));
      }
    }
    function onTouchStart(event){
      touch=null;
      if(event.touches.length!==1||!eligible(event.target)||hasHorizontalScroller(event.target)||hasSelection())return;
      const point=event.touches[0];
      // Keep screen-edge gestures available to the browser / operating system.
      if(point.clientX<24||point.clientX>view.innerWidth-24)return;
      touch={identifier:point.identifier,x:point.clientX,y:point.clientY,dx:0,axis:null,fired:false};
    }
    function onTouchMove(event){
      if(!touch)return;
      if(event.touches.length!==1||hasSelection()){touch=null;return;}
      const point=[...event.touches].find(item=>item.identifier===touch.identifier);
      if(!point){touch=null;return;}
      const dx=point.clientX-touch.x,dy=point.clientY-touch.y;
      if(!touch.axis){
        if(Math.max(Math.abs(dx),Math.abs(dy))<12)return;
        touch.axis=Math.abs(dx)>Math.abs(dy)*1.3?'x':'y';
      }
      if(touch.axis!=='x')return;
      touch.dx=dx;
      if(event.cancelable)event.preventDefault();
    }
    function onTouchEnd(event){
      if(!touch)return;
      const gesture=touch;
      const point=[...event.changedTouches].find(item=>item.identifier===gesture.identifier);
      if(!point)return;
      touch=null;
      if(gesture.axis!=='x')return;
      const dx=point.clientX-gesture.x;
      const dy=point.clientY-gesture.y;
      // A horizontal drag is not a tap, even if it stops short of changing tabs.
      suppressClickUntil=event.timeStamp+450;
      const threshold=Math.min(90,Math.max(50,view.innerWidth*.12));
      if(Math.abs(dx)>=threshold&&Math.abs(dx)>Math.abs(dy)*1.3)advance(-Math.sign(dx));
    }
    function onTouchCancel(){touch=null;}
    function onClick(event){
      // Keyboard / assistive clicks have detail=0 and remain available.
      if(event.detail!==0&&event.timeStamp<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation();}
    }
    root.addEventListener('wheel',onWheel,{passive:false});
    root.addEventListener('touchstart',onTouchStart,{passive:true});
    root.addEventListener('touchmove',onTouchMove,{passive:false});
    root.addEventListener('touchend',onTouchEnd,{passive:true});
    root.addEventListener('touchcancel',onTouchCancel,{passive:true});
    root.addEventListener('click',onClick,true);
    return ()=>{
      root.removeEventListener('wheel',onWheel);
      root.removeEventListener('touchstart',onTouchStart);
      root.removeEventListener('touchmove',onTouchMove);
      root.removeEventListener('touchend',onTouchEnd);
      root.removeEventListener('touchcancel',onTouchCancel);
      root.removeEventListener('click',onClick,true);
    };
  }
  if(typeof module!=='undefined'&&module.exports)module.exports=installTabGestures;
  else scope.installTabGestures=installTabGestures;
})(globalThis);
