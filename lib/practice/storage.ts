export const codeKey=(viewer:string,problem:number)=>`jamieho.practice.v1.${viewer}.${problem}`;
export function readCode(viewer:string,problem:number):string|null {
 try{return localStorage.getItem(codeKey(viewer,problem));}catch{return null;}
}
export function storeCode(viewer:string,problem:number,code:string):boolean {
 try{localStorage.setItem(codeKey(viewer,problem),code);return true;}catch{return false;}
}
