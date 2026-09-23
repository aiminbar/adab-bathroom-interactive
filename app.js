const feedback = {correct:'correct.webm', retry:'retry.webm'};
function ensureFeedback(){let l=document.querySelector('.feedback-layer');if(!l){l=document.createElement('div');l.className='feedback-layer';l.innerHTML='<video playsinline style="display:none"></video><canvas></canvas>';document.body.appendChild(l)}return l}
function playFeedback(type, after){
 const l=ensureFeedback(),v=l.querySelector('video'),c=l.querySelector('canvas'),ctx=c.getContext('2d',{willReadFrequently:true});
 let raf=0,done=false;
 const finish=()=>{if(done)return;done=true;cancelAnimationFrame(raf);l.classList.remove('show');v.pause();v.onended=v.onerror=null;after&&after()};
 const draw=()=>{if(done)return;if(v.readyState>=2){const w=v.videoWidth||1920,h=v.videoHeight||1080;c.width=w;c.height=h;ctx.drawImage(v,0,0,w,h);const im=ctx.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2];const blue=b-Math.max(r,g);if(b>90&&blue>18){let a=255-Math.min(255,(blue-18)*7);d[i+3]=a;if(a<245){const spill=Math.max(0,b-blue*.75);d[i+2]=spill}}}ctx.putImageData(im,0,0)}raf=requestAnimationFrame(draw)};
 v.src=feedback[type];v.currentTime=0;l.classList.add('show');v.onended=finish;v.onerror=finish;v.play().then(draw).catch(()=>setTimeout(finish,900));
}
function bindAnswers(scope=document){scope.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>{if(btn.disabled)return;const ok=btn.dataset.answer==='correct';btn.classList.add(ok?'correct':'wrong');if(ok){scope.querySelectorAll('[data-answer]').forEach(x=>x.disabled=true);playFeedback('correct',()=>{const n=scope.querySelector('[data-next]');if(n)n.classList.remove('hidden')})}else{playFeedback('retry',()=>btn.classList.remove('wrong'))}}))}
function home(){location.href='index.html'}
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-home]').forEach(x=>x.addEventListener('click',home));bindAnswers(document)});
