export type Language='uz'|'ru'|'en'|'fa';
export type Key='feed'|'explore'|'create'|'orders'|'profile'|'verified'|'realCamera'|'ships'|'welcome'|'tagline';
const words:Record<Language,Record<Key,string>>={
 uz:{feed:'Lenta',explore:'Kashf etish',create:'Yaratish',orders:'Buyurtmalar',profile:'Profil',verified:'Asl Tasdiqlangan',realCamera:'100% Haqiqiy kamera',ships:'Xalqaro yetkazib berish',welcome:'AslLive’ga xush kelibsiz',tagline:'Haqiqiy odamlar. Haqiqiy mahsulotlar.'},
 ru:{feed:'Лента',explore:'Обзор',create:'Создать',orders:'Заказы',profile:'Профиль',verified:'Проверенный продавец',realCamera:'100% Снято камерой',ships:'Международная доставка',welcome:'Добро пожаловать в AslLive',tagline:'Реальные люди. Реальные товары.'},
 en:{feed:'Feed',explore:'Explore',create:'Create',orders:'Orders',profile:'Profile',verified:'Verified seller',realCamera:'100% Real Camera',ships:'Ships internationally',welcome:'Welcome to AslLive',tagline:'Real people. Real products.'},
 fa:{feed:'خوراک',explore:'کاوش',create:'ایجاد',orders:'سفارش‌ها',profile:'پروفایل',verified:'فروشنده تأییدشده',realCamera:'۱۰۰٪ ثبت‌شده با دوربین',ships:'ارسال بین‌المللی',welcome:'به AslLive خوش آمدید',tagline:'افراد واقعی، محصولات واقعی.'}
};
export const tr=(lang:Language,key:Key)=>words[lang][key]||words.en[key];
