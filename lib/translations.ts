export type Language = 'uz' | 'ru' | 'en' | 'fa';
export type Key =
  | 'feed' | 'explore' | 'create' | 'orders' | 'profile'
  | 'verified' | 'realCamera' | 'ships' | 'welcome' | 'tagline'
  | 'follow' | 'following' | 'followers' | 'followingCount'
  | 'forYou' | 'followingFeed' | 'noFollowingPosts';

const words: Record<Language, Record<Key, string>> = {
  uz: {
    feed: 'Lenta', explore: 'Kashf etish', create: 'Yaratish', orders: 'Buyurtmalar', profile: 'Profil',
    verified: 'Asl Tasdiqlangan', realCamera: '100% Haqiqiy kamera', ships: 'Xalqaro yetkazib berish',
    welcome: 'AslLive’ga xush kelibsiz', tagline: 'Haqiqiy odamlar. Haqiqiy mahsulotlar.',
    follow: 'Obuna bo‘lish', following: 'Obuna bo‘lingan', followers: 'Obunachilar',
    followingCount: 'Obunalar', forYou: 'Hammasi', followingFeed: 'Obunalar',
    noFollowingPosts: 'Obuna bo‘lgan sotuvchilarning postlari va jonli efirlari shu yerda ko‘rinadi.',
  },
  ru: {
    feed: 'Лента', explore: 'Обзор', create: 'Создать', orders: 'Заказы', profile: 'Профиль',
    verified: 'Проверенный продавец', realCamera: '100% Снято камерой', ships: 'Международная доставка',
    welcome: 'Добро пожаловать в AslLive', tagline: 'Реальные люди. Реальные товары.',
    follow: 'Подписаться', following: 'Вы подписаны', followers: 'Подписчики',
    followingCount: 'Подписки', forYou: 'Для вас', followingFeed: 'Подписки',
    noFollowingPosts: 'Здесь появятся публикации и эфиры продавцов, на которых вы подписаны.',
  },
  en: {
    feed: 'Feed', explore: 'Explore', create: 'Create', orders: 'Orders', profile: 'Profile',
    verified: 'Verified seller', realCamera: '100% Real Camera', ships: 'Ships internationally',
    welcome: 'Welcome to AslLive', tagline: 'Real people. Real products.',
    follow: 'Follow', following: 'Following', followers: 'Followers',
    followingCount: 'Following', forYou: 'For You', followingFeed: 'Following',
    noFollowingPosts: 'Posts and live streams from sellers you follow will appear here.',
  },
  fa: {
    feed: 'خوراک', explore: 'کاوش', create: 'ایجاد', orders: 'سفارش‌ها', profile: 'پروفایل',
    verified: 'فروشنده تأییدشده', realCamera: '۱۰۰٪ ثبت‌شده با دوربین', ships: 'ارسال بین‌المللی',
    welcome: 'به AslLive خوش آمدید', tagline: 'افراد واقعی، محصولات واقعی.',
    follow: 'دنبال کردن', following: 'دنبال می‌کنید', followers: 'دنبال‌کنندگان',
    followingCount: 'دنبال‌شده‌ها', forYou: 'برای شما', followingFeed: 'دنبال‌شده‌ها',
    noFollowingPosts: 'پست‌ها و پخش زنده فروشندگانی که دنبال می‌کنید اینجا نمایش داده می‌شوند.',
  },
};

export const tr = (language: Language, key: Key) => words[language][key] || words.en[key];
