import seedLeads from '../data/seedLeads.json';
const STORAGE_KEY='solar-planner-leads-v1';
export const firebaseConfigured=()=>import.meta.env.VITE_ENABLE_FIREBASE==='true'&&Boolean(import.meta.env.VITE_FIREBASE_API_KEY&&import.meta.env.VITE_FIREBASE_PROJECT_ID&&import.meta.env.VITE_FIREBASE_APP_ID);
function makeSeed(){ return seedLeads.map(lead=>({...lead,notes:lead.notes||[],statusHistory:lead.statusHistory||[],results:lead.results||{},inputs:lead.inputs||{}})); }
export function readLocalLeads(storage=globalThis.localStorage){try{const raw=storage?.getItem(STORAGE_KEY);return raw?JSON.parse(raw):makeSeed();}catch{return makeSeed();}}
function writeLocal(leads,storage=globalThis.localStorage){try{storage?.setItem(STORAGE_KEY,JSON.stringify(leads));}catch{}return leads;}
function firestoreConfig(){return {apiKey:import.meta.env.VITE_FIREBASE_API_KEY,authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,appId:import.meta.env.VITE_FIREBASE_APP_ID};}
async function firestore(){const {initializeApp,getApps}=await import('firebase/app');const {getFirestore}=await import('firebase/firestore');const app=getApps().length?getApps()[0]:initializeApp(firestoreConfig());return {db:getFirestore(app),fs:await import('firebase/firestore')};}
export async function listLeads({storage=globalThis.localStorage}={}){
 if(firebaseConfigured()){const {db,fs}=await firestore();const snap=await fs.getDocs(fs.collection(db,'leads'));return snap.docs.map(d=>({id:d.id,...d.data()}));}
 const current=readLocalLeads(storage);try{if(storage&&!storage.getItem(STORAGE_KEY))writeLocal(current,storage);}catch{}return current;
}
export async function getLead(id,opts={}){return (await listLeads(opts)).find(lead=>String(lead.id)===String(id)||String(lead.clientId)===String(id)||String(lead.proposalId)===String(id))||null;}
export async function upsertLead(lead,{storage=globalThis.localStorage}={}){
 const id=String(lead.id||lead.clientId||lead.proposalId||`lead-${Date.now()}`);const safe={...lead,id,updatedAt:lead.updatedAt||new Date().toISOString()};
 if(firebaseConfigured()){const {db,fs}=await firestore();await fs.setDoc(fs.doc(db,'leads',id),safe,{merge:true});return safe;}
 const rows=readLocalLeads(storage);writeLocal([safe,...rows.filter(x=>x.id!==id)],storage);return safe;
}
export async function updateLead(id,patch,opts={}){const current=await getLead(id,opts);if(!current)throw new Error('Lead not found.');return upsertLead({...current,...patch,id:current.id,updatedAt:patch.updatedAt||new Date().toISOString()},opts);}
export async function addLeadNote(id,text,by='Admin',opts={}){const current=await getLead(id,opts);if(!current)throw new Error('Lead not found.');const note={text:String(text).trim(),by,at:new Date().toISOString()};return updateLead(id,{notes:[...(current.notes||[]),note]},opts);}
export async function deleteLead(id,opts={}){const current=await getLead(id,opts);if(!current)return {deleted:false};if(firebaseConfigured()){const {db,fs}=await firestore();await fs.deleteDoc(fs.doc(db,'leads',current.id));return {deleted:true};}
 const rows=readLocalLeads(opts.storage);writeLocal(rows.filter(x=>x.id!==current.id),opts.storage);return {deleted:true};}
// Phase 6 compatibility: capture the consented customer lead from proposal-email requests.
export async function saveLead(lead,{storage=globalThis.localStorage}={}){
 const existing=readLocalLeads(storage).find(item=>item.proposalId===lead.proposalId);
 const record={...(existing||{}),id:existing?.id||String(lead.proposalId||`lead-${Date.now()}`),clientId:existing?.clientId||String(lead.proposalId||''),proposalId:String(lead.proposalId||''),name:String(lead.name||''),phone:String(lead.phone||''),email:String(lead.email||''),consentGiven:Boolean(lead.consentGiven),state:String(lead.state||''),city:String(lead.city||''),status:existing?.status||lead.status||'Lead',createdAt:String(lead.createdAt||new Date().toISOString()),updatedAt:new Date().toISOString(),inputs:existing?.inputs||lead.inputs||{},results:existing?.results||{systemKW:Number(lead.systemKW||0),netCost:Number(lead.netCost||0)},revenueEstimate:existing?.revenueEstimate||0,notes:existing?.notes||[],statusHistory:existing?.statusHistory||[],assignedTo:existing?.assignedTo||'Unassigned'};
 try { const saved=await upsertLead(record,{storage});return {saved:true,mode:firebaseConfigured()?'firebase':'local',lead:saved}; }
 catch { const rows=readLocalLeads(storage);writeLocal([record,...rows.filter(x=>x.id!==record.id)],storage);return {saved:true,mode:'local-fallback',lead:record}; }
}
export {readLocalLeads as getSeedOrLocalLeads};
