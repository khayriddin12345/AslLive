'use client';
import {createContext,useContext,useEffect,useMemo,useState, type ReactNode} from 'react';
import {tr,type Language,type Key} from '@/lib/translations';
type Ctx={currency:'UZS'|'USD';language:Language;setCurrency:(v:'UZS'|'USD')=>void;setLanguage:(v:Language)=>void;t:(k:Key)=>string};
const Context=createContext<Ctx|null>(null);
export function AppProvider({children}:{children:ReactNode}){const[currency,setCurrencyState]=useState<'UZS'|'USD'>('UZS');const[language,setLanguageState]=useState<Language>('uz');const[ready,setReady]=useState(false);
 useEffect(()=>{const c=localStorage.getItem('asllive:currency');const l=localStorage.getItem('asllive:language') as Language|null;if(c==='USD'||c==='UZS')setCurrencyState(c);if(l&&['uz','ru','en','fa'].includes(l))setLanguageState(l);setReady(true);},[]);
 useEffect(()=>{if(ready){document.documentElement.lang=language;document.documentElement.dir=language==='fa'?'rtl':'ltr';}},[language,ready]);
 const value=useMemo<Ctx>(()=>({currency,language,setCurrency(v){setCurrencyState(v);localStorage.setItem('asllive:currency',v)},setLanguage(v){setLanguageState(v);localStorage.setItem('asllive:language',v)},t:(k)=>tr(language,k)}),[currency,language]);return <Context.Provider value={value}>{children}</Context.Provider>}
export const useApp=()=>{const v=useContext(Context);if(!v)throw new Error('useApp must be inside AppProvider');return v};
