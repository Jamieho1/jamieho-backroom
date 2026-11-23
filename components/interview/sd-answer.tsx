'use client';
import {useCallback,useEffect,useId,useRef,useState,useSyncExternalStore} from 'react';
import {ATTEMPT_LIMITS,capAnswer,joinDictation,speechRecognitionCtor,spokenText,type SpeechRecognitionLike} from '@/lib/interview/sd-attempt';

/** True only in browsers that ship SpeechRecognition / webkitSpeechRecognition (false on the server and while hydrating). */
export function useVoiceSupport(){return useSyncExternalStore(()=>()=>{},()=>speechRecognitionCtor()!==null,()=>false);}
const messageFor=(code?:string)=>code==='not-allowed'||code==='service-not-allowed'?'Microphone access was blocked. Allow it in your browser, or switch to text mode.':code==='no-speech'?'':code==='audio-capture'?'No microphone was found.':code==='network'?"The browser's speech service could not be reached.":'Voice input stopped.';
/**
 * Answer box for one step: plain text, or dictation through the browser's own Web Speech API.
 * Voice controls and the notice exist only where the browser supports it; the site never receives audio, only the text that is saved.
 */
export function AnswerInput({value,onChange,label}:{value:string;onChange:(next:string)=>void;label:string}){
 const supported=useVoiceSupport();const id=useId();
 const [voice,setVoice]=useState(false);const [listening,setListening]=useState(false);const [problem,setProblem]=useState('');
 const rec=useRef<SpeechRecognitionLike|null>(null);const base=useRef('');const latest=useRef(value);latest.current=value;
 const stop=useCallback(()=>{const r=rec.current;rec.current=null;if(r){r.onresult=null;r.onerror=null;r.onend=null;try{r.stop();}catch{/* already stopped */}}setListening(false);},[]);
 useEffect(()=>stop,[stop]);
 const start=()=>{
  const Ctor=speechRecognitionCtor();if(!Ctor)return;setProblem('');stop();
  const r=new Ctor();r.continuous=true;r.interimResults=true;r.lang=(typeof navigator!=='undefined'&&navigator.language)||'en-GB';base.current=latest.current;
  r.onresult=e=>onChange(capAnswer(joinDictation(base.current,spokenText(e.results))));
  r.onerror=e=>{setProblem(messageFor(e.error));if(rec.current===r){rec.current=null;setListening(false);}};
  r.onend=()=>{if(rec.current===r){rec.current=null;setListening(false);}};
  rec.current=r;try{r.start();setListening(true);}catch{rec.current=null;setProblem('Voice input could not start.');}
 };
 const inVoice=supported&&voice;
 return <div className="iv-sd-answer">
  <label htmlFor={id}>{label}</label>
  <textarea id={id} value={value} maxLength={ATTEMPT_LIMITS.answer} rows={6} onChange={e=>onChange(e.target.value)} placeholder={inVoice?'Your dictated words appear here. You can edit them.':'Type your answer, or write it on the board.'}/>
  {supported?<div className="iv-sd-voice">
   {inVoice?<>
    <button type="button" className="iv-sd-mic" aria-pressed={listening} onClick={listening?stop:start}>{listening?'Stop dictation':'Start dictation'}</button>
    <button type="button" onClick={()=>{stop();setVoice(false);}}>Switch to text mode</button>
    {listening?<span className="iv-sd-listening" role="status">Listening…</span>:null}
    <p className="iv-sd-voice-note">Voice uses your browser&apos;s speech service. Nothing is sent to this site except the text you save.</p>
   </>:<button type="button" onClick={()=>setVoice(true)}>Use voice</button>}
   {problem?<p className="iv-sd-voice-note" role="alert">{problem}</p>:null}
  </div>:null}
 </div>;
}
