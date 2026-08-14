const {JSDOM}=require('jsdom');
const fs=require('fs');
const path=require('path');
const HTML=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let pass=0, fail=0;
function T(name,cond){ if(cond){pass++;console.log("PASS "+name);} else {fail++;console.log("FAIL "+name);} }

function boot(preScript){
  const html=preScript?HTML.replace('<script>','<script>'+preScript+'</script><script>'):HTML;
  const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,url:"https://pipegrid.test/"});
  const w=dom.window, d=w.document;
  if(!w.PointerEvent) w.PointerEvent=w.MouseEvent;
  const canvas=d.querySelector(".canvas"), svg=d.getElementById("pg");
  canvas.setPointerCapture=()=>{}; canvas.releasePointerCapture=()=>{};
  canvas.scrollLeft=1000; canvas.scrollTop=1000;
  canvas.getBoundingClientRect=()=>({left:0,top:0,right:800,bottom:600,width:800,height:600,x:0,y:0});
  svg.getBoundingClientRect=()=>({left:1000-canvas.scrollLeft,top:1000-canvas.scrollTop,
    right:1000-canvas.scrollLeft+parseFloat(svg.getAttribute("width")||600),
    bottom:1000-canvas.scrollTop+parseFloat(svg.getAttribute("height")||600),
    width:parseFloat(svg.getAttribute("width")||600),height:parseFloat(svg.getAttribute("height")||600)});
  return {dom,w,d,canvas,svg,pg:w.__pg};
}
const px=(r,c,dx,dy)=>({x:c*44+22+(dx||0), y:r*44+22+(dy||0)});
function tap(env,r,c){
  const p=px(r,c);
  env.canvas.dispatchEvent(new env.w.PointerEvent("pointerdown",{pointerId:1,clientX:p.x,clientY:p.y,bubbles:true}));
  env.canvas.dispatchEvent(new env.w.PointerEvent("pointerup",{pointerId:1,clientX:p.x,clientY:p.y,bubbles:true}));
}
function drag(env,r,c,dx,dy){
  const a=px(r,c), b=px(r,c,dx,dy);
  env.canvas.dispatchEvent(new env.w.PointerEvent("pointerdown",{pointerId:1,clientX:a.x,clientY:a.y,bubbles:true}));
  env.canvas.dispatchEvent(new env.w.PointerEvent("pointermove",{pointerId:1,clientX:b.x,clientY:b.y,bubbles:true}));
  env.canvas.dispatchEvent(new env.w.PointerEvent("pointerup",{pointerId:1,clientX:b.x,clientY:b.y,bubbles:true}));
}
const click=(env,sel)=>{ const b=env.d.querySelector(`[data-action="${sel}"]`); if(!b) throw new Error("no button "+sel); b.click(); };
const scene=env=>env.d.getElementById("scene").innerHTML;
const findPart=(env,r,c)=>env.pg.state.parts.find(p=>p.type==="small"&&p.r===r&&p.c===c);
const C=r=>r*44+22;
const upChev=(x,y)=>`M ${x-4} ${y-1.6} L ${x} ${y-5.6} L ${x+4} ${y-1.6}`;
const dnChev=(x,y)=>`M ${x-4} ${y+1.6} L ${x} ${y+5.6} L ${x+4} ${y+1.6}`;
const opAfter=(s,d)=>{const i=s.indexOf(d); return i<0?null:(s.slice(i,i+d.length+40).match(/opacity="([^"]+)"/)||[])[1];};

(async ()=>{
const env=boot();
await new Promise(r=>setTimeout(r,60));
env.canvas.scrollLeft=1000; env.canvas.scrollTop=1000;

// regressions
T("R1 boots + seed", env.pg.state.parts.length===5);
click(env,"clear");
T("R2 clear", env.pg.state.parts.length===0);
T("R3 autosave envelope v3", JSON.parse(env.w.localStorage.getItem("pipegrid.board.v1")).v===3);
click(env,"tool:cross");
T("R4 cross pose row", !!env.d.querySelector('[data-action="pose:cross:vert"]') &&
  env.d.querySelector('[data-action="pose:cross:vert"] .flbl')!==null);
click(env,"tool:straight");
T("R5 straight row gained \u00d73", !!env.d.querySelector('[data-action="pose:straight:r3"]'));

// vertical mixing cross: default rising, spokes + through chevrons
click(env,"tool:cross"); click(env,"pose:cross:vert"); click(env,"var:xsplit");
tap(env,2,2);
let xs=findPart(env,2,2);
T("V1 vert xsplit placed", xs && xs.pose==="vert" && xs.kind==="xsplit");
T("V2 default rising: D in, U out", xs && xs.ports[0].dir==="D" && xs.ports[0].io==="in"
  && xs.ports[2].dir==="U" && xs.ports[2].io==="out");
let s1=scene(env);
T("V3 through chevrons", opAfter(s1,upChev(C(2),C(2)))==="1" && opAfter(s1,dnChev(C(2),C(2)))==="1");
T("V4 two horizontal spokes only", s1.includes(`M ${C(2)} ${C(2)} L ${C(2)+22} ${C(2)}`) ||
  s1.includes(`M ${C(2)+22} ${C(2)} L ${C(2)} ${C(2)}`));

// vertical overpass: gap straddles the bore
click(env,"var:xover");
tap(env,2,5);
let xo=findPart(env,2,5);
T("V5 vert xover placed, vertical stream rising", xo && xo.ports[0].dir==="D" && xo.io[0]==="in");
s1=scene(env);
T("V6 gap segments at \u00b116", s1.includes(`${C(5)-16} ${C(2)}`) && s1.includes(`${C(5)+16} ${C(2)}`));
T("V7 xover through chevrons", opAfter(s1,upChev(C(5),C(2)))==="1");

// vertical bend pair: under D-elbow with gradient, offset rings, \u2299 on the U ring
click(env,"var:xbend");
tap(env,5,2);
let xb=findPart(env,5,2);
T("V8 vert xbend placed", xb && xb.pose==="vert");
T("V9 twin pairing D+E \u00b7 U+W", xb && xb.ports[0].dir==="D" && xb.ports[1].dir==="E"
  && xb.ports[2].dir==="U" && xb.ports[3].dir==="W");
s1=scene(env);
const dRingIdx=s1.indexOf(`cx="${C(2)+3}" cy="${C(5)}" r="10"`);
const uRingIdx=s1.indexOf(`cx="${C(2)-3}" cy="${C(5)}" r="10"`);
T("V10 both offset rings drawn, D under U", dRingIdx>-1 && uRingIdx>-1 && dRingIdx<uRingIdx);
T("V11 U ring carries \u2299", s1.includes(`cx="${C(2)-3}" cy="${C(5)}" r="3.2"`));
T("V12 shadow gradients present", s1.includes("radialGradient") &&
  s1.includes(`offset="0.65"`) && s1.includes(`url(#xg${xb.id}c)`));
T("V13 no chevrons on the bend pair", opAfter(s1,upChev(C(2),C(5)))===null);

// trace: per-stream amber marks; stream-cycling flips one at a time
click(env,"tool:trace");
s1=scene(env);
T("V14 two amber marks, both rising by default",
  s1.includes(`cx="${C(2)+3}" cy="${C(5)}" r="3.2" fill="#ffc45e"`) &&
  s1.includes(`cx="${C(2)-3}" cy="${C(5)}" r="3.2" fill="#ffc45e"`));
tap(env,5,2);                                      // GRAY: flip stream A (the D elbow)
s1=scene(env);
T("V15 one tap flips one stream", s1.includes(`M ${C(2)+3-4.6} ${C(5)-4.6}`) &&
  s1.includes(`cx="${C(2)-3}" cy="${C(5)}" r="3.2" fill="#ffc45e"`));
T("V16 pose survives the cycle", findPart(env,5,2).pose==="vert");
click(env,"tool:trace");

// snap: role walks reach a horizontal arm, pose + kind sacred
env.pg.state.parts.push(Object.assign(env.pg.makeSmall("src",1,7,0),{id:9001}));
env.pg.render();
click(env,"tool:cross"); click(env,"var:xsplit");
tap(env,7,1);
const snapped=findPart(env,7,1);
T("V17 vert xsplit snaps via legal walk", snapped && snapped.kind==="xsplit" && snapped.pose==="vert"
  && !!snapped.ports.find(q=>q.dir==="W"&&q.io==="in"));

// Riser \u00d73: three floors, three classes, straight-3 in the bill
click(env,"tool:straight"); click(env,"pose:straight:r3");
tap(env,0,7);
const r3=findPart(env,0,7);
T("V18 riser3 spans three floors", r3 && r3.kind==="riser3" && r3.layers.join()==="0,1,2"
  && r3.ports[1].layer===2);
s1=scene(env);
T("V19 L0 bottom grade", opAfter(s1,upChev(C(7),C(0)))==="1" && opAfter(s1,dnChev(C(7),C(0)))==="0.3");
click(env,"layer+"); s1=scene(env);
T("V20 L1 pure body: through", opAfter(s1,upChev(C(7),C(0)))==="1" && opAfter(s1,dnChev(C(7),C(0)))==="1");
click(env,"layer+"); s1=scene(env);
T("V21 L2 top grade", opAfter(s1,upChev(C(7),C(0)))==="0.3" && opAfter(s1,dnChev(C(7),C(0)))==="1");
click(env,"layer+"); s1=scene(env);
T("V22 L3 hint: mate opens down", s1.includes(`r="13"`) &&
  s1.includes(`M ${C(7)-3.6} ${C(0)+1} L ${C(7)} ${C(0)+4.6}`));
click(env,"layer-"); click(env,"layer-"); click(env,"layer-");

// BOM: riser3 = Straight-3; vert crosses subtotal \u21d5 in layer lists, clean STACK
click(env,"tool:cross"); click(env,"pose:cross:flat"); click(env,"var:xsplit");
tap(env,7,4);                                      // flat xsplit for the mix
click(env,"layer+"); click(env,"tool:straight"); click(env,"pose:straight:flat"); tap(env,6,6);
click(env,"layer-");
click(env,"bom");
const bom=env.d.getElementById("bom").innerHTML;
const stackIdx=bom.indexOf("STACK");
T("V23 riser3 billed as Straight-3", bom.slice(stackIdx).includes("Straight-3") && !bom.includes("Riser"));
T("V24 layer detail carries \u21d5", bom.slice(0,stackIdx).includes("\u21d5 \u00d7"));
T("V25 STACK stays clean", !bom.slice(stackIdx).includes("letter-spacing:.5px"));

// selection chip names the pose
click(env,"tool:cross");
tap(env,2,2); tap(env,2,2);
T("V26 chip shows \u21d5", env.d.getElementById("selchip").textContent.includes("\u21d5"));

// persistence: po:"vert" + riser3 roundtrip
const ser=JSON.parse(env.pg.serialize());
T("V27 descriptors carry vert + riser3", ser.parts.some(dd=>dd.po==="vert") &&
  ser.parts.some(dd=>dd.k==="riser3"));
const doc=env.w.localStorage.getItem("pipegrid.board.v1");
const env2=boot(`localStorage.setItem("pipegrid.board.v1",${JSON.stringify(doc)});`);
await new Promise(r=>setTimeout(r,40));
const r3b=env2.pg.state.parts.find(p=>p.kind==="riser3");
const xbb=env2.pg.state.parts.find(p=>p.kind==="xbend");
T("V28 roundtrip: riser3 floors + xbend pose restored",
  r3b && r3b.ports[1].layer===2 && xbb && xbb.pose==="vert");
T("V29 restored xbend re-renders its shadow", scene(env2).includes("radialGradient"));

// v37 fix regressions, quick
click(env,"tool:tee"); click(env,"pose:tee:flat"); click(env,"var:tsplit");
env.pg.state.parts.push(Object.assign(env.pg.makeSmall("src",1,4,5),{id:9002}));
env.pg.render();
drag(env,4,6,20,0);                                // E-nudge: the old converter case
const tt=findPart(env,4,6);
T("R6 run tee stays run-role under E nudge", tt && tt.kind==="tsplit" && tt.io[1]!=="in");
click(env,"undo");
T("R7 undo works", !findPart(env,4,6));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
})().catch(e=>{ console.error("SUITE ERROR:",e); process.exit(1); });
