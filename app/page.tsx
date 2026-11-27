'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, Globe2, Radio } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { OrderModal } from '@/components/OrderModal';
import { FollowButton } from '@/components/FollowButton';

type Product = { id: string; title: string; price_uzs: number; price_usd: number; discount_price_uzs: number | null; discount_price_usd: number | null; discount_ends_at: string | null; min_order_qty: number; seller_id: string };
type Post = { id: string; media_url: string; media_type: 'image' | 'video'; caption: string | null; created_at: string; seller_id: string; product: Product | null; seller: { username: string | null; shop_name: string | null; is_verified: boolean; ships_internationally: boolean } | null };
type Stream = { id: string; title: string; room_name: string; scheduled_at: string | null; status: string; seller_id: string; seller: { username: string | null; shop_name: string | null } | null };
type FeedTab = 'all' | 'following';

export default function Home() {
  const sb = useMemo(() => supabaseBrowser(), []);
  const { currency, t } = useApp();
  const [posts, setPosts] = useState<Post[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [tab, setTab] = useState<FeedTab>('all');
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [order, setOrder] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [followedSellerIds, setFollowedSellerIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!active) return;
      setViewerId(user?.id ?? null);
      let followed: string[] = [];
      if (tab === 'following' && user) {
        const { data } = await sb.from('follows').select('following_id').eq('follower_id', user.id);
        followed = (data || []).map((row) => row.following_id as string);
      }
      if (active) setFollowedSellerIds(followed);
      if (tab === 'following' && !user) {
        setPosts([]); setStreams([]); setLoading(false); return;
      }
      if (tab === 'following' && followed.length === 0) {
        setPosts([]); setStreams([]); setLoading(false); return;
      }
      let postQuery = sb.from('posts').select('*,seller:profiles!posts_seller_id_fkey(username,shop_name,is_verified,ships_internationally),product:products(*)')
        .is('scheduled_for', null).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).order('created_at', { ascending: false }).limit(30);
      let streamQuery = sb.from('live_streams').select('*,seller:profiles!live_streams_seller_id_fkey(username,shop_name)')
        .in('status', ['live', 'scheduled']).order('scheduled_at', { ascending: true }).limit(20);
      if (tab === 'following') {
        postQuery = postQuery.in('seller_id', followed);
        streamQuery = streamQuery.in('seller_id', followed);
      }
      const [postResult, streamResult] = await Promise.all([postQuery, streamQuery]);
      if (!active) return;
      setPosts((postResult.data || []) as unknown as Post[]);
      setStreams((streamResult.data || []) as unknown as Stream[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [sb, tab]);

  return <div>
    <div className="sticky top-14 z-20 grid grid-cols-2 border-b bg-white">
      {(['all', 'following'] as const).map((value) => <button key={value} onClick={() => { setLoading(true); setTab(value); }} className={`h-12 border-b-2 text-sm font-semibold ${tab === value ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500'}`}>
        {value === 'all' ? t('forYou') : t('followingFeed')}
      </button>)}
    </div>
    <section className="border-b px-4 py-4">
      <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Live & upcoming</h2><Link href="/create" className="text-xs font-semibold text-emerald-700">Schedule a live</Link></div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {streams.map((stream) => <Link key={stream.id} href={stream.status === 'live' ? `/live/${stream.room_name}` : '/'} className="flex w-20 shrink-0 flex-col items-center text-center">
          <span className={`relative flex h-16 w-16 items-center justify-center rounded-full border-[3px] ${stream.status === 'live' ? 'animate-pulse border-rose-500' : 'border-emerald-500'}`}><span className="text-xs font-bold">{stream.status === 'live' ? 'LIVE' : 'SOON'}</span></span>
          <span className="mt-1 w-full truncate text-xs">{stream.seller?.shop_name || stream.seller?.username || stream.title}</span>
          {stream.status === 'live' && <span onClick={(event) => event.preventDefault()}><FollowButton followingId={stream.seller_id} viewerId={viewerId} compact /></span>}
          {stream.scheduled_at && <span className="text-[10px] text-gray-500">{new Date(stream.scheduled_at).toLocaleString()}</span>}
        </Link>)}
        {streams.length === 0 && <p className="text-sm text-gray-500">No live events scheduled yet.</p>}
      </div>
    </section>
    <section>
      {loading ? <p className="p-8 text-center text-sm text-gray-500">Loading feed…</p> : posts.length === 0 ? <div className="p-8 text-center">
        <p className="font-semibold">{tab === 'following' ? t('noFollowingPosts') : t('welcome')}</p>
        {tab === 'following' && !viewerId ? <Link href="/auth" className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Login to see following feed</Link> : <Link className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white" href="/create">Create a post</Link>}
      </div> : posts.map((post) => <article key={post.id} className="border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href={post.seller?.username ? `/seller/${post.seller.username}` : '/profile'} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-bold text-emerald-700">{(post.seller?.shop_name || post.seller?.username || 'A')[0]?.toUpperCase()}</Link>
          <div className="min-w-0 flex-1"><div className="flex items-center gap-1 text-sm font-semibold"><Link className="truncate" href={post.seller?.username ? `/seller/${post.seller.username}` : '/profile'}>{post.seller?.shop_name || post.seller?.username || 'AslLive seller'}</Link>{post.seller?.is_verified && <BadgeCheck size={15} className="fill-emerald-600 text-white" />}</div>
            <div className="flex gap-2 text-[10px] text-gray-500"><span>{t('realCamera')}</span>{post.seller?.ships_internationally && <span><Globe2 className="mr-0.5 inline" size={11} />{t('ships')}</span>}</div>
          </div>
          <FollowButton followingId={post.seller_id} viewerId={viewerId} compact />
        </div>
        <div className="relative aspect-[4/5] bg-gray-100">{post.media_type === 'video' ? <video src={post.media_url} controls playsInline className="h-full w-full object-cover" /> : <img src={post.media_url} alt={post.caption || 'Seller post'} className="h-full w-full object-cover" />}</div>
        {post.caption && <p className="px-4 pt-3 text-sm">{post.caption}</p>}
        {post.product && <div className="m-4 flex items-center justify-between rounded-xl border p-3"><div><div className="text-sm font-semibold">{post.product.title}</div><div className="text-sm font-bold text-emerald-700">{formatPrice(post.product, currency)}</div>{post.product.discount_ends_at && <Countdown endsAt={post.product.discount_ends_at} />}</div><button onClick={() => setOrder(post.product)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Order / Buyurtma</button></div>}
      </article>)}
    </section>
    {order && <OrderModal product={order} onClose={() => setOrder(null)} />}
  </div>;
}

function formatPrice(product: Product, currency: 'UZS' | 'USD') {
  const discountActive = !!product.discount_ends_at && new Date(product.discount_ends_at).getTime() > Date.now();
  const amount = currency === 'UZS' ? (discountActive && product.discount_price_uzs ? product.discount_price_uzs : product.price_uzs) : (discountActive && product.discount_price_usd ? product.discount_price_usd : product.price_usd);
  return currency === 'UZS' ? `${new Intl.NumberFormat('uz-UZ').format(amount)} UZS` : `$${Number(amount).toFixed(2)}`;
}
function Countdown({ endsAt }: { endsAt: string }) {
  const [, tick] = useState(0);
  useEffect(() => { const timer = setInterval(() => tick((value) => value + 1), 1000); return () => clearInterval(timer); }, []);
  const ms = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const d = Math.floor(ms / 86400000), h = Math.floor(ms % 86400000 / 3600000), m = Math.floor(ms % 3600000 / 60000);
  return <p className="mt-1 flex items-center gap-1 text-xs text-rose-600"><Radio size={12} />{d}d {String(h).padStart(2, '0')}h {String(m).padStart(2, '0')}m</p>;
}
