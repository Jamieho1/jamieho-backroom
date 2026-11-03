export const stormLocations=[[.744,.642],[.155,.648],[.918,.604],[.383,.633],[.638,.607]];
const smooth=(a,b,v)=>{const x=Math.max(0,Math.min(1,(v-a)/(b-a)));return x*x*(3-2*x)};
export function sampleStorm(time){const event=Math.floor(Math.max(0,time)/9),phase=Math.max(0,time)-event*9;return {event,phase,duration:4,interval:9,centre:stormLocations[event%stormLocations.length],intensity:.35*smooth(0,.16,phase)*(1-smooth(.8,4,phase))}}
export function sampleBirds(time){const phase=(Math.max(0,time)+8)%48,p=Math.min(1,phase/30),q=1-p;return {phase,duration:30,interval:48,visible:phase<30,alpha:smooth(0,4,phase)*(1-smooth(24,30,phase)),centre:[q*q*(-.04)+2*q*p*.28+p*p*.53,q*q*.14+2*q*p*.055+p*p*.11]}}

export function sampleSun(time){const cycle=Math.floor(time*.003/.23),offset=time*.003-cycle*.23;return {clockwiseRadians:time*.003,beams:Array.from({length:9},(_,i)=>{const id=i-cycle,seed=Math.sin(id*12.9898+78.233)*43758.5453,hash=seed-Math.floor(seed);return {angle:-.17+i*.23+offset,intensity:.32+.68*(.5+.5*Math.sin(time*(.12+.013*hash)+hash*6.2831853))}})}}
// Polar rays advance clockwise in screen coordinates. At a wrap, beam IDs shift
// with the pattern so their independent brightness envelopes stay continuous.
export const sunlightGLSL=`
float sunHash(float id){return fract(sin(id*12.9898+78.233)*43758.5453);}
float sunIntensity(vec2 p,float time){
 vec2 q=vec2(p.x-.003,(p.y-.096)*.562799);
 float theta=atan(q.y,q.x),r=length(q),advance=time*.003,cycle=floor(advance/.23),offset=advance-cycle*.23;
 float rays=0.;
 for(int i=0;i<9;i++){
  float fi=float(i),seed=sunHash(fi-cycle),angle=-.17+fi*.23+offset;
  float width=.012+.014*seed,delta=theta-angle;
  float power=.32+.68*(.5+.5*sin(time*(.12+.013*seed)+seed*6.2831853));
  rays+=(exp(-delta*delta/(width*width))*.78+exp(-delta*delta/(width*width*12.))*.16)*power;
 }
 float fan=smoothstep(-.02,.06,theta)*(1.-smoothstep(1.44,1.57,theta));
 return rays*fan*smoothstep(.012,.075,r)*(1.-smoothstep(.48,1.2,r));
}`;

export const stormGLSL=`
float stormLine(vec2 p,vec2 a,vec2 b){vec2 q=p-a,d=b-a;return length(q-d*clamp(dot(q,d)/dot(d,d),0.,1.));}
float stormBolt(vec2 p,vec2 centre){
 vec2 q=vec2(p.x-centre.x,(p.y-centre.y)*.562799);
 float d=stormLine(q,vec2(-.023,-.019),vec2(-.006,-.008));
 d=min(d,stormLine(q,vec2(-.006,-.008),vec2(-.015,-.003)));
 d=min(d,stormLine(q,vec2(-.015,-.003),vec2(.010,.010)));
 d=min(d,stormLine(q,vec2(.010,.010),vec2(.002,.013)));
 d=min(d,stormLine(q,vec2(.002,.013),vec2(.023,.026)));
 d=min(d,stormLine(q,vec2(-.010,-.005),vec2(.008,-.011)));
 d=min(d,stormLine(q,vec2(.008,-.011),vec2(.019,-.005)));
 return (1.-smoothstep(.00045,.00105,d))*.95+exp(-d*680.)*.42;
}`;
export const birdsGLSL=`
float birdLine(vec2 p,vec2 a,vec2 b){vec2 q=p-a,d=b-a;return length(q-d*clamp(dot(q,d)/dot(d,d),0.,1.));}
float birdFlock(vec2 p,float time){
 float phase=mod(time+8.,48.),t=min(1.,phase/30.),q=1.-t;
 if(phase>=30.)return 0.;
 vec2 centre=vec2(q*q*(-.04)+2.*q*t*.28+t*t*.53,q*q*.14+2.*q*t*.055+t*t*.11);
 vec2 local=vec2(p.x-centre.x,(p.y-centre.y)*.562799);
 if(abs(local.x)>.10||abs(local.y)>.055)return 0.;
 float a=0.;
 for(int i=0;i<7;i++){
  float fi=float(i),side=mod(fi,2.)<.5?-1.:1.;
  vec2 at=vec2(-fi*.011,ceil(fi*.5)*.006*side);
  vec2 b=local-at;float flap=sin(time*4.8+fi*.82),size=1.-fi*.035;
  vec2 left=vec2(-.0062,-.001-flap*.0023)*size,right=vec2(.0062,-.001-flap*.0023)*size;
  float d=birdLine(b,left,vec2(-.0025,-.0002)*size);
  d=min(d,birdLine(b,vec2(-.0025,-.0002)*size,vec2(0.,.0012)*size));
  d=min(d,birdLine(b,vec2(0.,.0012)*size,vec2(.0025,-.0002)*size));
  d=min(d,birdLine(b,vec2(.0025,-.0002)*size,right));
  float body=1.-smoothstep(.0006,.0014,length(b-vec2(0.,.0008)*size));
  a=max(a,max(1.-smoothstep(.00025,.00065,d),body));
 }
 return a*smoothstep(0.,4.,phase)*(1.-smoothstep(24.,30.,phase));
}`;
