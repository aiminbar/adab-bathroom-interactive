const feedback = {correct:'correct.mp4', retry:'retry.mp4'};
function ensureFeedback(){let l=document.querySelector('.feedback-layer');if(!l){l=document.createElement('div');l.className='feedback-layer';l.innerHTML='<video playsinline preload="auto" style="display:none"></video><canvas></canvas>';document.body.appendChild(l)}return l}
function playFeedback(type, after){
 const l=ensureFeedback(),v=l.querySelector('video'),c=l.querySelector('canvas'),ctx=c.getContext('2d',{willReadFrequently:true});
 let raf=0,done=false;
 const finish=()=>{if(done)return;done=true;cancelAnimationFrame(raf);l.classList.remove('show');v.pause();v.onended=v.onerror=null;after&&after()};
 const draw=()=>{
   if(done)return;
   if(v.readyState>=2){
     const vw=v.videoWidth||1920,vh=v.videoHeight||1080;
     const scale=Math.min(1,960/vw); const w=Math.round(vw*scale),h=Math.round(vh*scale);
     if(c.width!==w||c.height!==h){c.width=w;c.height=h}
     ctx.clearRect(0,0,w,h);ctx.drawImage(v,0,0,w,h);
     const im=ctx.getImageData(0,0,w,h),d=im.data;
     for(let i=0;i<d.length;i+=4){
       const r=d[i],g=d[i+1],b=d[i+2];
       const dominance=g-Math.max(r,b);
       // Remove only chroma-green pixels. Blue scarf and mint node remain untouched.
       if(g>65 && dominance>18 && g>r*1.22 && g>b*1.16){
         let a=255-Math.min(255,(dominance-18)*8);
         d[i+3]=Math.max(0,a);
         if(a>0){ d[i+1]=Math.min(g,Math.max(r,b)+12); }
       }
     }
     ctx.putImageData(im,0,0);
   }
   raf=requestAnimationFrame(draw)
 };
 v.src=feedback[type];v.currentTime=0;l.classList.add('show');v.onended=finish;v.onerror=finish;
 v.play().then(draw).catch(()=>setTimeout(finish,1200));
}
function bindAnswers(scope=document){scope.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>{if(btn.disabled)return;const ok=btn.dataset.answer==='correct';btn.classList.add(ok?'correct':'wrong');if(ok){scope.querySelectorAll('[data-answer]').forEach(x=>x.disabled=true);playFeedback('correct',()=>{const n=scope.querySelector('[data-next]');if(n)n.classList.remove('hidden')})}else{playFeedback('retry',()=>btn.classList.remove('wrong'))}}))}
function home(){location.href='index.html'}
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-home]').forEach(x=>x.addEventListener('click',home));bindAnswers(document)});
