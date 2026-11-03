// A projected rotating wheel, separated from the stationary city/supports.
// Ring, spokes, hub, frame and capsule colours sample the original artwork.
const W=1672,H=941;
export const eyeDef={centre:[492,720],period:240,capsules:32};
// Perspective circle fitted to the source wheel; its hub stays at (492,720).
const projection=[64,-50.72,492,0,14.77,720,0,-.084967,1];
export function projectEye(x,y){const m=projection,d=m[6]*x+m[7]*y+m[8];return [(m[0]*x+m[1]*y+m[2])/d,(m[3]*x+m[4]*y+m[5])/d]}
const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const wheelVertex=`uniform mat3 uProjection;uniform float uAngle;varying vec2 vQ;void main(){vQ=position.xy;float c=cos(uAngle),s=sin(uAngle);vec2 q=mat2(c,s,-s,c)*vQ;vec3 p=uProjection*vec3(q,1.);gl_Position=vec4(2.*p.x/1672.-p.z,p.z-2.*p.y/941.,0.,p.z);}`;
const wheelFragment=`precision highp float;uniform sampler2D uDay,uNight,uWheelMatte;uniform float uNightMix;uniform mat3 uProjection;varying vec2 vQ;
float eyeLuma(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
float segment(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.));}
void main(){
 vec3 projected=uProjection*vec3(vQ,1.);vec2 p=projected.xy/projected.z,uv=vec2(p.x/1672.,1.-p.y/941.);
 vec3 day=texture2D(uDay,uv).rgb;
 float r=length(vQ),alpha=texture2D(uWheelMatte,uv).a;
 // Keep the extracted ring, but reject opaque city pixels between the fine wires.
 // A real spoke is a thin bright line continuous along the radial direction.
 vec2 radial=normalize(p-vec2(492.,720.)),perpendicular=vec2(-radial.y,radial.x);
 vec2 texel=vec2(1./1672.,-1./941.);
 float alongA=eyeLuma(texture2D(uDay,uv+radial*texel*1.7).rgb),alongB=eyeLuma(texture2D(uDay,uv-radial*texel*1.7).rgb);
 float acrossA=eyeLuma(texture2D(uDay,uv+perpendicular*texel*1.25).rgb),acrossB=eyeLuma(texture2D(uDay,uv-perpendicular*texel*1.25).rgb);
 float line=min(eyeLuma(day),min(alongA,alongB)+.045)-(acrossA+acrossB)*.5;
 float saturation=(max(day.r,max(day.g,day.b))-min(day.r,min(day.g,day.b)))/max(.01,max(day.r,max(day.g,day.b)));
 float wire=smoothstep(.007,.078,line)*(1.-smoothstep(.28,.55,saturation));
 float paleMetal=smoothstep(.39,.63,eyeLuma(day))*(1.-smoothstep(.24,.43,saturation));
 alpha*=max(smoothstep(.62,.72,r)*paleMetal,wire);
 alpha*=smoothstep(.12,.16,r)*(1.-smoothstep(1.045,1.075,r));
 float support=min(segment(p,vec2(488.,727.),vec2(453.,807.)),segment(p,vec2(496.,726.),vec2(479.,809.)));
 alpha*=smoothstep(2.8,4.,support);
 if(alpha<.003)discard;
 gl_FragColor=vec4(mix(day,texture2D(uNight,uv).rgb,uNightMix),alpha);
}`;
const frameFragment=`precision highp float;uniform sampler2D uDay,uNight,uShape;uniform float uNightMix;uniform vec4 uBounds;varying vec2 vUv;void main(){float a=texture2D(uShape,vUv).a;if(a<.003)discard;vec2 p=uBounds.xy+vec2(vUv.x,1.-vUv.y)*uBounds.zw;vec2 uv=vec2(p.x,1.-p.y);gl_FragColor=vec4(mix(texture2D(uDay,uv).rgb,texture2D(uNight,uv).rgb,uNightMix),a);}`;
const capsuleFragment=`precision highp float;uniform sampler2D uDay,uNight;uniform float uNightMix;varying vec2 vUv;void main(){vec2 q=(vUv-.5)*2.;float a=1.-smoothstep(.70,1.,length(q*vec2(1.,.9)));if(a<.003)discard;vec2 p=vec2(496.5,639.5)+vec2(vUv.x,1.-vUv.y)*vec2(9.,7.);vec2 uv=vec2(p.x/1672.,1.-p.y/941.);gl_FragColor=vec4(mix(texture2D(uDay,uv).rgb,texture2D(uNight,uv).rgb,uNightMix),a);}`;

export function createLondonEye(THREE,scene,shared,textures){
 const geometries=[],materials=[],objects=[],capsules=[];
 const uniforms={uDay:shared.uDay,uNight:shared.uNight,uNightMix:shared.uNightMix,uWheelMatte:shared.uWheelMatte,uProjection:{value:new THREE.Matrix3().set(...projection)},uAngle:{value:0}};
 function mesh(geo,fragment,u=uniforms,vs=vertex){const mat=new THREE.ShaderMaterial({uniforms:u,vertexShader:vs,fragmentShader:fragment,transparent:true,depthTest:false,depthWrite:false,toneMapped:false});const obj=new THREE.Mesh(geo,mat);scene.add(obj);geometries.push(geo);materials.push(mat);objects.push(obj);return obj}
 const wheel=mesh(new THREE.PlaneGeometry(2.3,2.3),wheelFragment,uniforms,wheelVertex);wheel.renderOrder=.30;wheel.material.side=THREE.DoubleSide;wheel.frustumCulled=false;
 for(let i=0;i<eyeDef.capsules;i++){const capsule=mesh(new THREE.PlaneGeometry(8,5),capsuleFragment);capsule.renderOrder=.32;capsules.push(capsule)}
 // Fixed original-pixel hub/legs and foreground platform: never rotate with the rim.
 const bounds=[410,630,175,198],canvas=document.createElement('canvas');canvas.width=bounds[2]*4;canvas.height=bounds[3]*4;const ctx=canvas.getContext('2d');ctx.scale(4,4);ctx.translate(-bounds[0],-bounds[1]);ctx.strokeStyle='white';ctx.fillStyle='white';ctx.lineCap='round';
 for(const [from,to,width] of [[[488,727],[453,807],4],[[496,726],[479,809],5],[[496,726],[516,778],2]]){ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...from);ctx.lineTo(...to);ctx.stroke()}
 ctx.beginPath();ctx.ellipse(492,720.5,9,4,0,0,Math.PI*2);ctx.fill();ctx.fillRect(449,814,92,14);
 const shape=new THREE.CanvasTexture(canvas);shape.colorSpace=THREE.NoColorSpace;shape.generateMipmaps=false;shape.minFilter=THREE.LinearFilter;shape.magFilter=THREE.LinearFilter;textures.push(shape);
 const frame=mesh(new THREE.PlaneGeometry(bounds[2],bounds[3]),frameFragment,{...uniforms,uShape:{value:shape},uBounds:{value:new THREE.Vector4(bounds[0]/W,bounds[1]/H,bounds[2]/W,bounds[3]/H)}});frame.position.set(bounds[0]+bounds[2]/2-W/2,H/2-bounds[1]-bounds[3]/2,0);frame.renderOrder=.34;
 let current;
 return {
  update(time,effects){const angle=time*Math.PI*2/eyeDef.period;uniforms.uAngle.value=angle;objects.forEach(o=>o.visible=effects>0);const pods=[];capsules.forEach((pod,i)=>{const theta=i*Math.PI*2/eyeDef.capsules+angle;const p=projectEye(Math.cos(theta)*1.08,Math.sin(theta)*1.08);pod.position.set(p[0]-W/2,H/2-p[1],0);pod.rotation.set(0,0,0);pods.push({position:p,rotation:pod.rotation.toArray().slice(0,3)})});current={angle,period:eyeDef.period,visible:effects>0,hub:eyeDef.centre,supportPosition:frame.position.toArray(),supportRotation:frame.rotation.toArray().slice(0,3),capsules:pods}},
  snapshot(){return structuredClone(current)},
  dispose(){objects.forEach(o=>scene.remove(o));materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose())}
 };
}
