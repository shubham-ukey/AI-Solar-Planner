import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
const I18nContext=createContext(null);
export function I18nProvider({children}){
 const [language,setLanguage]=useState(()=>{try{return localStorage.getItem('solar-language')==='hi'?'hi':'en'}catch{return 'en'}});
 useEffect(()=>{document.documentElement.lang=language;try{localStorage.setItem('solar-language',language)}catch{}},[language]);
 const value=useMemo(()=>({language,setLanguage,t:(key)=>((language==='hi'?hi:en)[key]??en[key]??key)}),[language]);
 return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
export function useI18n(){const ctx=useContext(I18nContext);return ctx||{language:'en',setLanguage:()=>{},t:(key)=>en[key]??key};}
