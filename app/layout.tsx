import type {Metadata,Viewport} from 'next';import './globals.css';import '@livekit/components-styles';import {AppProvider} from '@/context/AppContext';import {AppShell} from '@/components/AppShell';
export const metadata:Metadata={title:'AslLive — Real people. Real products.',description:'Authentic social and live commerce.',manifest:'/manifest.json',appleWebApp:{capable:true,statusBarStyle:'default',title:'AslLive'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#ffffff'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="uz"><body className="min-h-screen bg-white text-gray-950 antialiased"><AppProvider><AppShell>{children}</AppShell></AppProvider></body></html>}
