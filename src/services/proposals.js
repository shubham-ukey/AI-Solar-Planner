import {firebaseConfigured} from './leads.js';
const STORAGE_KEY='solar-planner-proposals-v1';
function localRecords(storage=globalThis.localStorage){try{return JSON.parse(storage?.getItem(STORAGE_KEY)||'[]')}catch{return []}}
function saveLocal(record,storage=globalThis.localStorage){const records=localRecords(storage);const next=[{...records.find(item=>item.id===record.id),...record,storageMode:'local'},...records.filter(item=>item.id!==record.id)];try{storage?.setItem(STORAGE_KEY,JSON.stringify(next))}catch{}return {saved:true,mode:'local'};}
export async function saveProposalRecord(record,{storage=globalThis.localStorage}={}){
  const previous=localRecords(storage).find(item=>item.id===record.id);
  const safe={id:String(record.id),status:String(record.status||previous?.status||'Created'),createdAt:String(record.createdAt||previous?.createdAt||new Date().toISOString()),emailSentAt:record.emailSentAt??previous?.emailSentAt??null,whatsappShared:Boolean(record.whatsappShared??previous?.whatsappShared??false),assumptionsSnapshot:record.assumptionsSnapshot??previous?.assumptionsSnapshot??null,computedPlanSnapshot:record.computedPlanSnapshot??previous?.computedPlanSnapshot??null};
  if(firebaseConfigured()){
    try{const {initializeApp,getApps}=await import('firebase/app');const {getFirestore,doc,setDoc}=await import('firebase/firestore');const config={apiKey:import.meta.env.VITE_FIREBASE_API_KEY,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,appId:import.meta.env.VITE_FIREBASE_APP_ID};const app=getApps().length?getApps()[0]:initializeApp(config);await setDoc(doc(getFirestore(app),'proposals',safe.id),safe,{merge:true});saveLocal(safe,storage);return {saved:true,mode:'firebase'}}catch{return saveLocal(safe,storage)}
  }
  return saveLocal(safe,storage);
}
export function readLocalProposals(storage=globalThis.localStorage){return localRecords(storage)}
