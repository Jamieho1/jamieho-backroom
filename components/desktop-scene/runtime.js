import * as THREE from 'three';
import gsap from 'gsap';
import {DESKTOP_ASSETS as assets} from './assets';
import {actorDefs,ownershipTexture,W,H} from './layers.js';
import {createShipTraffic} from './boats.js';
import {createLondonEye} from './eye.js';
import {sampleStorm,sunlightGLSL,stormGLSL,birdsGLSL} from './weather.js';

const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const fragment=`precision highp float;
uniform sampler2D uDay,uNight,uCloud,uEmptyDay,uEmptyNight,uMatte,uRiverDay,uRiverNight,uRiverMask,uEyeDay,uEyeNight;
uniform float uNightMix,uTime,uMotion,uEffects,uFlash,uSunEnabled,uBirdsEnabled;
uniform vec2 uPointer,uResolution,uFlashCentre;

varying vec2 vUv;
float ellipse(vec2 p,vec2 c,vec2 r){float d=length((p-c)/r);return 1.-smoothstep(.48,1.,d);}
vec3 original(vec2 p){vec2 uv=vec2(p.x,1.-p.y);return mix(texture2D(uDay,uv).rgb,texture2D(uNight,uv).rgb,uNightMix);}
float matteAt(vec2 p){return texture2D(uMatte,vec2(p.x,1.-p.y)).a;}
vec3 base(vec2 p){
 vec2 uv=vec2(p.x,1.-p.y);float m=1.-smoothstep(.65,.68,p.y);
 vec3 empty=mix(texture2D(uEmptyDay,uv).rgb,texture2D(uEmptyNight,uv).rgb,uNightMix);
 vec3 col=mix(original(p),empty,m);
 vec3 water=mix(texture2D(uRiverDay,uv).rgb,texture2D(uRiverNight,uv).rgb,uNightMix);
 col=mix(col,water,texture2D(uRiverMask,uv).a);
 float eyeRepair=1.-smoothstep(.94,1.,length((p*vec2(1672.,941.)-vec2(492.,726.))/vec2(79.,91.)));
 col=mix(col,mix(texture2D(uEyeDay,uv).rgb,texture2D(uEyeNight,uv).rgb,uNightMix),eyeRepair);
 // Remove the old permanent purple glow without restoring any foreground figure.
 float cloudRepair=ellipse(p,vec2(.742,.654),vec2(.142,.083))*smoothstep(.594,.61,p.y)*(1.-smoothstep(.68,.697,p.y));
 col=mix(col,texture2D(uEyeNight,uv).rgb,cloudRepair*uNightMix);
 return col;
}
float hash(float p){return fract(sin(p*127.1)*43758.5453);}
${sunlightGLSL}
${stormGLSL}
${birdsGLSL}
void main(){
 vec2 p=vec2(vUv.x,1.-vUv.y);
 if(uEffects<.001){gl_FragColor=vec4(original(p),1.);return;}
 float characters=matteAt(p);
 vec2 sampleAt=p;
 // Tiny river-only refraction preserves the crisp stationary skyline.
 float river=ellipse(p,vec2(.52,.90),vec2(.30,.10));
 sampleAt.x+=sin(p.y*870.+uTime*1.6)*.00034*river*uMotion;
 vec3 col=base(sampleAt);
 // Transparent detailed cloud bank: tiled right-to-left over the city, separate from the art.
 for(int i=0;i<2;i++){
   float fi=float(i);float speed=.006+fi*.0015;
   float localX=fract(p.x/(.95+fi*.28)+uTime*speed+fi*.48);
   float localY=(p.y-(.57+fi*.12))/(.48+fi*.06);
   if(localY>0.&&localY<1.){
    vec4 cloud=texture2D(uCloud,vec2(localX,1.-localY));
    float edge=smoothstep(0.,.08,localX)*(1.-smoothstep(.92,1.,localX))*smoothstep(0.,.12,localY)*(1.-smoothstep(.80,1.,localY));
    float a=pow(cloud.a,1.45)*edge*(.135-fi*.035)*uEffects;
    float l=dot(cloud.rgb,vec3(.2126,.7152,.0722));
    vec3 nightCloud=mix(vec3(.045,.13,.18),vec3(.27,.39,.47),l);
    col=mix(col,mix(cloud.rgb,nightCloud,uNightMix),a);
   }
 }
 // Separate polar rays rotate clockwise; each has its own soft intensity cycle.
 float beam=sunIntensity(p,uTime);
 col+=vec3(.13,.093,.038)*beam*(1.-uNightMix)*uEffects*uSunEnabled;
 float birds=birdFlock(p,uTime)*(1.-uNightMix)*uEffects*uBirdsEnabled;
 col=mix(col,vec3(.105,.16,.21),birds*.90);
 // Fine rain in two depths. Foreground characters stay legible.
 float rain=0.;
 for(int i=0;i<2;i++){
   float f=float(i);vec2 q=p*vec2(178.+f*75.,38.+f*12.);
   q.x+=q.y*.23;q.y+=uTime*(13.+f*7.);
   vec2 id=floor(q),cell=fract(q);float seed=hash(id.x+float(i)*311.);
   float stroke=1.-smoothstep(.014,.075,abs(cell.x-(.2+seed*.6)));
   float lengthMask=smoothstep(.0,.03,cell.y)*(1.-smoothstep(.10+seed*.16,.15+seed*.16,cell.y));
   rain+=stroke*lengthMask*(.025+.06*seed);
 }
 float faceClear=1.-characters*.9;
 col=mix(col,vec3(.69,.80,.85),clamp(rain*uNightMix*faceClear*uEffects,0.,.13));
 // Four-second purple lightning, then five quiet seconds; one location at a time.
 float skyGlow=ellipse(p,uFlashCentre,vec2(.13,.064));
 float cloudDetail=.55+.45*smoothstep(.07,.32,dot(col,vec3(.2126,.7152,.0722)));
 float cloudOnly=(1.-characters)*smoothstep(.50,.57,p.y)*(1.-smoothstep(.68,.70,p.y));
 col+=(vec3(.68,.13,1.)*skyGlow*cloudDetail*.75+vec3(.82,.17,1.)*stormBolt(p,uFlashCentre))*cloudOnly*uFlash*uNightMix*uEffects;
 gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`;
const actorVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const actorFragment=`precision highp float;uniform sampler2D uDay,uNight,uMatte,uMatteNight,uOwnership;uniform float uNightMix,uId,uTime,uSunEnabled;uniform vec4 uBounds;varying vec2 vUv;${sunlightGLSL}void main(){vec2 p=uBounds.xy+vec2(vUv.x,1.-vUv.y)*uBounds.zw;vec2 uv=vec2(p.x,1.-p.y);float id=texture2D(uOwnership,uv).r*255.;if(abs(id-uId)>.25)discard;vec4 matte=texture2D(uMatte,uv);float alpha=matte.a;for(int x=-1;x<=1;x++){for(int y=-1;y<=1;y++){alpha=min(alpha,texture2D(uMatte,uv+vec2(float(x)/1672.,float(y)/941.)).a);}}alpha=smoothstep(.10,.90,alpha);if(alpha<.004)discard;vec3 day=texture2D(uDay,uv).rgb,night=texture2D(uNight,uv).rgb;float correspondence=1.-smoothstep(.10,.25,length(day-matte.rgb));vec4 nightMatte=texture2D(uMatteNight,uv);vec3 edge=mix(matte.rgb,nightMatte.a>.1?nightMatte.rgb:matte.rgb*.65,uNightMix);vec3 rgb=mix(edge,mix(day,night,uNightMix),correspondence);rgb+=vec3(.023,.016,.005)*sunIntensity(p,uTime)*(1.-uNightMix)*uSunEnabled;gl_FragColor=vec4(rgb,alpha);}`;


/** Optional graphics layer. The React host owns navigation, text and the still. */
export function mountDesktopScene(host,options){
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');host.append(canvas);
 let disposed=false,ready=false,contextLost=false,themePending=false,request=0,frames=0;
 let renderer,scene,camera,uniforms,background,backgroundMaterial,backgroundGeometry,ships,eye;
 let last=performance.now(),lastDraw=0,lastReport=0,time=options.initialTime||0;
 let night=options.night,paused=false,visible=!document.hidden;
 const textures=new Set(),auxTextures=[],promises=new Map(),loaded=new Map();
 const materials=[],geometries=[],groups=[];
 const pointer={x:0,y:0},smoothPointer={x:0,y:0};
 const actorValues=actorDefs.map(d=>({x:0,y:-d.a,angle:-d.angle}));
 const timelines=actorDefs.map((d,i)=>gsap.timeline({repeat:-1,paused:true}).to(actorValues[i],{x:d.a*.22,y:d.a,angle:d.angle,duration:d.duration,ease:'sine.inOut'},0).to(actorValues[i],{x:-d.a*.22,y:-d.a,angle:-d.angle,duration:d.duration,ease:'sine.inOut'},d.duration));
 const carrier={x:0,y:-5};
 const carrierTimeline=gsap.timeline({repeat:-1,paused:true}).to(carrier,{x:1.5,y:5,duration:3.7,ease:'sine.inOut'}).to(carrier,{x:-1.5,y:-5,duration:3.7,ease:'sine.inOut'});
 const loader=new THREE.TextureLoader();
 function load(key){
  if(!promises.has(key))promises.set(key,loader.loadAsync(assets[key]).then(texture=>{
   texture.colorSpace=THREE.NoColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;
   if(disposed){texture.dispose();return texture}textures.add(texture);loaded.set(key,texture);return texture;
  }));
  return promises.get(key);
 }
 const themeKeys=value=>value?['night','emptyNight','cutoutNight','riverNight','eyeNight']:['sunDay','riverDay','eyeDay'];
 const loadTheme=value=>Promise.all(themeKeys(value).map(load));
 function installTheme(){
  const original=loaded.get(night?'night':'day'),empty=loaded.get(night?'emptyNight':'sunDay'),river=loaded.get(night?'riverNight':'riverDay'),wheel=loaded.get(night?'eyeNight':'eyeDay');
  const values={uDay:loaded.get('day'),uNight:loaded.get('night')||original,uCloud:loaded.get('clouds'),uEmptyDay:loaded.get('sunDay')||empty,uEmptyNight:loaded.get('emptyNight')||empty,uMatte:loaded.get('cutout'),uMatteNight:loaded.get('cutoutNight')||loaded.get('cutout'),uRiverDay:loaded.get('riverDay')||river,uRiverNight:loaded.get('riverNight')||river,uEyeDay:loaded.get('eyeDay')||wheel,uEyeNight:loaded.get('eyeNight')||wheel,uWheelMatte:loaded.get('eyeMatte')};
  for(const [key,value]of Object.entries(values)){if(uniforms[key])uniforms[key].value=value;else uniforms[key]={value}}
 }
 function makeActors(){
  const ownership=ownershipTexture(THREE);auxTextures.push(ownership);
  actorDefs.forEach(def=>{
   const [x,y,w,h]=def.bounds,group=new THREE.Group(),geo=new THREE.PlaneGeometry(w,h);
   const mat=new THREE.ShaderMaterial({uniforms:{uDay:uniforms.uDay,uNight:uniforms.uNight,uMatte:uniforms.uMatte,uMatteNight:uniforms.uMatteNight,uNightMix:uniforms.uNightMix,uTime:uniforms.uTime,uSunEnabled:uniforms.uSunEnabled,uOwnership:{value:ownership},uId:{value:def.id},uBounds:{value:new THREE.Vector4(x/W,y/H,w/W,h/H)}},vertexShader:actorVertex,fragmentShader:actorFragment,transparent:true,depthTest:false,depthWrite:false,toneMapped:false});
   const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x+w/2-def.pivot[0],def.pivot[1]-y-h/2,0);mesh.renderOrder=def.id;group.add(mesh);scene.add(group);groups.push(group);materials.push(mat);geometries.push(geo);
  });
  const geo=new THREE.PlaneGeometry(46,46),mat=new THREE.ShaderMaterial({vertexShader:actorVertex,fragmentShader:`precision highp float;varying vec2 vUv;void main(){vec2 p=(vUv-.5)*2.;float r=length(p);float a=exp(-r*5.)*.34;float star=exp(-abs(p.x)*55.)*exp(-abs(p.y)*4.)+exp(-abs(p.y)*55.)*exp(-abs(p.x)*4.);gl_FragColor=vec4(1.,.76,.31,(a+star*.45)*(1.-smoothstep(.7,1.,r)));}`,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending});
  const spark=new THREE.Mesh(geo,mat);spark.renderOrder=30;scene.add(spark);materials.push(mat);geometries.push(geo);return spark;
 }
 // Small repair masks never change grants, data or application content.
 function repairMask(){const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');if(!ctx)throw Error('Canvas unavailable');ctx.fillStyle='white';ctx.filter='blur(3px)';[[269,888,83,39],[621,841,84,47],[827,829,89,52],[984,794,77,44],[902,795,54,38],[518,826,62,33]].forEach(r=>ctx.fillRect(...r));for(const points of [[[535,888],[630,862],[650,867],[551,896]],[[695,892],[841,851],[866,860],[718,902]],[[179,921],[282,900],[306,910],[183,930]],[[952,837],[1003,813],[1017,825],[963,844]]]){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.NoColorSpace;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;auxTextures.push(t);return t}
 let spark;
 function draw(){
  if(!ready||disposed||contextLost||themePending)return;
  const storm=sampleStorm(time);uniforms.uTime.value=time;uniforms.uFlash.value=storm.intensity;uniforms.uFlashCentre.value.set(...storm.centre);uniforms.uPointer.value.set(smoothPointer.x,smoothPointer.y);
  timelines.forEach((tl,i)=>tl.totalTime(time+actorDefs[i].phase*actorDefs[i].duration*2,true));carrierTimeline.totalTime(time,true);
  groups.forEach((group,i)=>{const def=actorDefs[i],a=actorValues[i],amount=.75;group.position.set(def.pivot[0]-W/2+(a.x+carrier.x+smoothPointer.x*2)*amount,H/2-def.pivot[1]-(a.y+carrier.y+smoothPointer.y*1.5)*amount,0);group.rotation.set(0,0,-a.angle*amount);group.scale.set(1,1,1)});
  if(spark)spark.position.set(775-W/2+carrier.x*.75,H/2-272-carrier.y*.75,0);
  ships.update(time,1,.75);eye.update(time,1);renderer.render(scene,camera);frames++;
  const now=performance.now();if(now-lastReport>250){host.dataset.sceneTheme=night?'night':'day';host.dataset.sceneTime=time.toFixed(2);host.dataset.sceneFrame=String(frames);lastReport=now}
 }
 function resize(){if(!renderer||!uniforms||disposed)return;const box=host.getBoundingClientRect();if(!box.width||!box.height)return;renderer.setPixelRatio(Math.min(devicePixelRatio||1,box.width<700?1.25:1.5));renderer.setSize(box.width,box.height,false);uniforms.uResolution.value.set(box.width,box.height);draw()}
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
 const intersectionObserver=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&!document.hidden;last=performance.now()});intersectionObserver.observe(host);
 function tick(){const now=performance.now(),dt=Math.max(0,(now-last)/1000);last=now;if(!ready||disposed||paused||!visible||contextLost||themePending)return;time+=dt;smoothPointer.x+=(pointer.x-smoothPointer.x)*.08;smoothPointer.y+=(pointer.y-smoothPointer.y)*.08;if(now-lastDraw<1000/30)return;lastDraw=now;draw()}
 function onVisibility(){visible=!document.hidden;last=performance.now()}
 function onPointer(e){if(e.pointerType==='touch')return;const r=host.getBoundingClientRect();pointer.x=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));pointer.y=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1))}
 function onLeave(){pointer.x=pointer.y=0}
 function onLost(e){e.preventDefault();if(disposed)return;contextLost=true;canvas.hidden=true;options.onFallback('context-lost')}
 function onRestored(){if(disposed)return;contextLost=false;canvas.hidden=false;draw();options.onReady()}
 document.addEventListener('visibilitychange',onVisibility);host.parentElement?.addEventListener('pointermove',onPointer);host.parentElement?.addEventListener('pointerleave',onLeave);canvas.addEventListener('webglcontextlost',onLost);canvas.addEventListener('webglcontextrestored',onRestored);
 async function setNight(value){night=value;if(!ready||disposed)return;const token=++request;themePending=true;options.onLoading?.();try{await loadTheme(value);if(disposed||token!==request)return;installTheme();themePending=false;gsap.killTweensOf(uniforms.uNightMix);uniforms.uNightMix.value=value?1:0;await renderer.compileAsync(scene,camera);if(disposed||token!==request)return;draw();options.onReady()}catch{if(!disposed&&token===request){themePending=false;options.onFallback('unavailable')}}}
 function dispose(){
  if(disposed)return;disposed=true;request++;gsap.ticker.remove(tick);timelines.forEach(t=>t.kill());carrierTimeline.kill();if(uniforms)gsap.killTweensOf(uniforms.uNightMix);resizeObserver.disconnect();intersectionObserver.disconnect();document.removeEventListener('visibilitychange',onVisibility);host.parentElement?.removeEventListener('pointermove',onPointer);host.parentElement?.removeEventListener('pointerleave',onLeave);canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',onRestored);ships?.dispose();eye?.dispose();materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());backgroundMaterial?.dispose();backgroundGeometry?.dispose();textures.forEach(t=>t.dispose());auxTextures.forEach(t=>t.dispose());renderer?.dispose();renderer?.forceContextLoss();canvas.remove();delete host.dataset.sceneTheme;delete host.dataset.sceneTime;delete host.dataset.sceneFrame;
 }
 (async()=>{
  try{
   renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:false,powerPreference:'low-power'});renderer.toneMapping=THREE.NoToneMapping;renderer.outputColorSpace=THREE.SRGBColorSpace;
   await Promise.all(['day','cutout','clouds','eyeMatte'].map(load));
   while(!disposed){const wanted=night;await loadTheme(wanted);if(wanted===night)break}if(disposed)return;
   uniforms={uNightMix:{value:night?1:0},uTime:{value:time},uMotion:{value:.75},uEffects:{value:1},uFlash:{value:0},uFlashCentre:{value:new THREE.Vector2()},uSunEnabled:{value:1},uBirdsEnabled:{value:1},uPointer:{value:new THREE.Vector2()},uResolution:{value:new THREE.Vector2()},uRiverMask:{value:repairMask()}};installTheme();
   scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-W/2,W/2,H/2,-H/2,.1,100);camera.position.set(0,0,10);
   backgroundMaterial=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,depthTest:false,depthWrite:false});backgroundGeometry=new THREE.PlaneGeometry(2,2);background=new THREE.Mesh(backgroundGeometry,backgroundMaterial);background.renderOrder=0;scene.add(background);spark=makeActors();ships=createShipTraffic(THREE,scene,uniforms,auxTextures);eye=createLondonEye(THREE,scene,uniforms,auxTextures);
   await renderer.compileAsync(scene,camera);if(disposed)return;ready=true;resize();last=performance.now();gsap.ticker.add(tick);draw();options.onReady();
  }catch{if(!disposed)options.onFallback('unavailable')}
 })();
 return {dispose,setNight,setPaused(value){paused=value;last=performance.now()},getTime(){return time}};
}
