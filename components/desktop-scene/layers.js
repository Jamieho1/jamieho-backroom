export const W=1672,H=941;
export const actorDefs=[
 {name:'owner',id:1,bounds:[25,130,750,510],pivot:[762,274],a:0,duration:3.8,phase:.12,angle:.010,contact:true},
 {name:'robot-ensemble',id:2,bounds:[775,145,897,425],pivot:[789,277],a:0,duration:3.4,phase:.6,angle:.004,contact:true},
];
// All overlapping robots share one unbroken rigid layer. A single ownership seam
// sits in the empty gap between the owner's fingertip and the robot's hand.
export function ownershipTexture(THREE){
 const canvas=document.createElement('canvas');canvas.width=W;canvas.height=1;const ctx=canvas.getContext('2d');
 ctx.fillStyle='rgb(2,0,0)';ctx.fillRect(0,0,W,1);ctx.fillStyle='rgb(1,0,0)';ctx.fillRect(0,0,775,1);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.NoColorSpace;texture.minFilter=THREE.NearestFilter;texture.magFilter=THREE.NearestFilter;texture.generateMipmaps=false;return texture;
}
