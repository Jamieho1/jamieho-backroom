// Native image-space compositing: boat pixels come from the unchanged masters.
// No boat body is deformed; only position, heading and opacity change.
const W=1672,H=941;
const hulls=[
 {name:'river-bus',bounds:[630,847,65,34],axis:-.13,polygon:[[3,23],[9,19],[14,15],[19,14],[20,7],[22,7],[22,14],[39,12],[41,3],[44,3],[44,12],[51,12],[52,17],[60,15],[63,20],[60,25],[12,32],[4,29]]},
 {name:'cruiser',bounds:[836,834,73,40],axis:-.17,polygon:[[3,25],[8,21],[15,20],[16,12],[25,9],[27,3],[29,3],[30,9],[39,8],[43,12],[45,19],[65,17],[70,21],[67,27],[17,37],[5,34]]},
 {name:'commuter',bounds:[993,798,60,35],axis:-.16,polygon:[[3,24],[9,20],[15,19],[15,13],[24,12],[25,8],[28,8],[28,12],[42,10],[44,14],[48,18],[55,18],[58,22],[52,28],[12,33],[3,30]]},
 {name:'foreground-cruiser',bounds:[275,890,68,34],axis:-.13,polygon:[[4,20],[10,17],[13,15],[22,14],[23,10],[36,8],[39,4],[41,4],[42,9],[52,9],[54,15],[62,14],[65,19],[61,24],[11,31],[4,28]]}
];

export const trafficDefs=[
 {name:'eastbound-river-bus',route:[[650,865],[832,837],[1030,816]],duration:126,gap:15,offset:26,hulls:[0,1]},
 {name:'eastbound-cruiser',route:[[650,865],[832,837],[1030,816]],duration:126,gap:15,offset:99,hulls:[1,0]},
 {name:'foreground-cruiser',route:[[220,907],[332,918],[438,926]],duration:108,gap:8,offset:100,hulls:[3,0],scale:.92}
];

export const navigationZones={
 main:[[500,848],[600,830],[700,821],[800,809],[900,799],[1000,791],[1090,797],[1095,817],[1045,835],[995,851],[920,872],[867,883],[820,902],[793,912],[735,913],[650,891],[570,872],[500,861]],
 foreground:[[180,893],[242,892],[491,929],[491,941],[180,941]]
};

const smooth=(a,b,v)=>{const x=Math.max(0,Math.min(1,(v-a)/(b-a)));return x*x*(3-2*x)};
export function sampleTraffic(def,time){
 const period=def.duration+def.gap,elapsed=Math.max(0,time)+def.offset;
 const generation=Math.floor(elapsed/period),local=elapsed-generation*period;
 const p=Math.min(1,local/def.duration),q=1-p;
 const [a,b,c]=def.route;
 const x=q*q*a[0]+2*q*p*b[0]+p*p*c[0],y=q*q*a[1]+2*q*p*b[1]+p*p*c[1];
 const dx=2*q*(b[0]-a[0])+2*p*(c[0]-b[0]),dy=2*q*(b[1]-a[1])+2*p*(c[1]-b[1]);
 const alpha=local>=def.duration?0:smooth(0,8,local)*(1-smooth(def.duration-9,def.duration,local));
 return {x,y,dx,dy,alpha,progress:p,generation,local,hull:def.hulls[generation%def.hulls.length]};
}

function canvasTexture(THREE,width,height,paint){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;paint(canvas.getContext('2d'));
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.NoColorSpace;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;return t;
}
function polygon(ctx,points){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()}

export function createRiverMask(THREE){
 return canvasTexture(THREE,W,H,ctx=>{
  ctx.fillStyle='white';ctx.filter='blur(3px)';
  // Tiny bounded repairs around the old hulls/wakes; architecture stays original.
  [[269,888,83,39],[621,841,84,47],[827,829,89,52],[984,794,77,44],[902,795,54,38],[518,826,62,33]].forEach(r=>ctx.fillRect(...r));
  polygon(ctx,[[535,888],[630,862],[650,867],[551,896]]);
  polygon(ctx,[[695,892],[841,851],[866,860],[718,902]]);
  polygon(ctx,[[179,921],[282,900],[306,910],[183,930]]);
  polygon(ctx,[[952,837],[1003,813],[1017,825],[963,844]]);
 });
}

const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const hullFragment=`precision highp float;uniform sampler2D uDay,uNight,uShape;uniform vec4 uBounds;uniform float uNightMix,uOpacity;varying vec2 vUv;void main(){float a=texture2D(uShape,vUv).a*uOpacity;if(a<.002)discard;vec2 p=uBounds.xy+vec2(vUv.x,1.-vUv.y)*uBounds.zw;vec2 uv=vec2(p.x,1.-p.y);gl_FragColor=vec4(mix(texture2D(uDay,uv).rgb,texture2D(uNight,uv).rgb,uNightMix),a);}`;
const wakeFragment=`precision highp float;uniform float uOpacity,uTime,uNightMix;varying vec2 vUv;void main(){float t=vUv.x;float y=(vUv.y-.5)*2.;float spread=.12+(1.-t)*.65;float edge=exp(-pow((abs(y)-spread)/.075,2.));float centre=exp(-y*y/(.01+(1.-t)*.07));float taper=smoothstep(0.,.22,t)*(1.-smoothstep(.92,1.,t));float ripple=.65+.35*sin(t*64.-uTime*2.);float a=(edge*.12+centre*.08)*taper*ripple*uOpacity;vec3 c=mix(vec3(.91,.92,.88),vec3(.36,.57,.67),uNightMix);gl_FragColor=vec4(c,a);}`;
const reflectionFragment=`precision highp float;uniform sampler2D uDay,uNight,uShape;uniform vec4 uBounds;uniform float uNightMix,uOpacity,uTime;varying vec2 vUv;void main(){vec2 uv=vUv;float bands=.45+.55*pow(sin(uv.y*75.+uTime*1.8),2.);uv.x+=sin(uv.y*95.+uTime*1.3)*.035;vec2 source=vec2(uv.x,1.-uv.y);float a=texture2D(uShape,source).a*bands*pow(vUv.y,1.8)*mix(.08,.26,uNightMix)*uOpacity;vec2 p=uBounds.xy+vec2(source.x,1.-source.y)*uBounds.zw;vec2 at=vec2(p.x,1.-p.y);vec3 c=mix(texture2D(uDay,at).rgb,texture2D(uNight,at).rgb,uNightMix);gl_FragColor=vec4(c,a);}`;

export function createShipTraffic(THREE,scene,shared,textures){
 const geometries=[],materials=[],groups=[],readings=[];
 const shapes=hulls.map(h=>canvasTexture(THREE,h.bounds[2]*4,h.bounds[3]*4,ctx=>{ctx.scale(4,4);ctx.fillStyle='white';polygon(ctx,h.polygon)}));textures.push(...shapes);
 function mesh(w,h,fragment,uniforms){const geo=new THREE.PlaneGeometry(w,h);const mat=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthTest:false,depthWrite:false,toneMapped:false});geometries.push(geo);materials.push(mat);const m=new THREE.Mesh(geo,mat);return m}
 for(const def of trafficDefs){
  const group=new THREE.Group();scene.add(group);
  const u={uDay:shared.uDay,uNight:shared.uNight,uNightMix:shared.uNightMix,uShape:{value:shapes[0]},uBounds:{value:new THREE.Vector4()},uOpacity:{value:1},uTime:{value:0}};
  const wake=mesh(98,17,wakeFragment,u);wake.position.set(-63,-7,0);wake.renderOrder=.10;group.add(wake);
  const reflection=mesh(1,1,reflectionFragment,u);reflection.renderOrder=.12;group.add(reflection);
  const body=mesh(1,1,hullFragment,u);body.renderOrder=.15;group.add(body);
  groups.push({group,body,wake,reflection,u,def});
 }
 return {
  update(time,effects,strength){
   readings.length=0;
   groups.forEach(({group,body,wake,reflection,u,def})=>{
    const s=sampleTraffic(def,time),h=hulls[s.hull],scale=def.scale||1;
    u.uShape.value=shapes[s.hull];u.uBounds.value.set(h.bounds[0]/W,h.bounds[1]/H,h.bounds[2]/W,h.bounds[3]/H);u.uOpacity.value=s.alpha;u.uTime.value=time;
    body.scale.set(h.bounds[2],h.bounds[3],1);reflection.scale.set(h.bounds[2],h.bounds[3]*.65,1);reflection.position.set(0,-h.bounds[3]*.63,0);
    const angle=Math.atan2(def.reverse?-s.dy:s.dy,def.reverse?-s.dx:s.dx)-h.axis;
    group.position.set(s.x-W/2,H/2-s.y,0);group.rotation.set(0,0,-angle);group.scale.set(def.reverse?-scale:scale,scale,1);
    group.visible=effects>0&&s.alpha>.001;
    wake.visible=strength>0;reflection.visible=true;
    group.updateMatrixWorld(true);
    const waterline=[[-h.bounds[2]*.40,h.bounds[3]*.22],[0,h.bounds[3]*.32],[h.bounds[2]*.40,h.bounds[3]*.22]].map(([x,y])=>{const p=new THREE.Vector3(x,-y,0).applyMatrix4(group.matrixWorld);return [p.x+W/2,H/2-p.y]});
    readings.push({...s,name:def.name,visible:group.visible,position:[s.x,s.y],waterline,heading:angle,scale,route:def.route,zone:def.name==='foreground-cruiser'?'foreground':'main',hullName:h.name,bounds:[h.bounds[2]*scale,h.bounds[3]*scale]});
   });
  },
  snapshot(){return readings.map(s=>({...s}))},
  dispose(){groups.forEach(({group})=>scene.remove(group));geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose())}
 };
}
