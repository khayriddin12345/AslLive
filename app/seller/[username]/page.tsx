'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { BadgeCheck } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { FollowButton } from '@/components/FollowButton';
import { useApp } from '@/context/AppContext';
import type { Profile } from '@/lib/types';

type SellerPost = { id: string; media_url: string; media_type: string; caption: string | null };
export default function PublicSellerPage() {
  const { username } = useParams<{ username: string }>();
  const sb = useMemo(() => supabaseBrowser(), []);
  const { t } = useApp();
  const [seller, setSeller] = useState<Profile | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [posts, setPosts] = useState<SellerPost[]>([]);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    void (async () => {
      const [{ data: profile }, { data: { user } }] = await Promise.all([
        sb.from('profiles').select('*').eq('username', username).eq('role', 'seller').maybeSingle(),
        sb.auth.getUser(),
      ]);
      if (!active) return;
      setViewerId(user?.id ?? null);
      if (profile) {
        setSeller(profile as Profile);
        const [{ data: postData }, { count: followers }, { count: following }] = await Promise.all([
          sb.from('posts').select('id,media_url,media_type,caption').eq('seller_id', profile.id).is('scheduled_for', null).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).order('created_at', { ascending: false }),
          sb.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
          sb.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
        ]);
        if (active) { setPosts((postData || []) as SellerPost[]); setCounts({ followers: followers || 0, following: following || 0 }); }
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [sb, username]);
  if (loading) return <p className="p-6">Loading seller…</p>;
  if (!seller) return <p className="p-6">Seller not found.</p>;
  return <section>
    <div className="border-b p-5"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">{(seller.shop_name || seller.username || 'A')[0].toUpperCase()}</div><div className="min-w-0 flex-1"><h1 className="truncate text-xl font-bold">{seller.shop_name || seller.full_name || seller.username}</h1><p className="text-sm text-gray-500">@{seller.username}</p>{seller.is_verified && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><BadgeCheck size={14} />{t('verified')}</span>}</div><FollowButton followingId={seller.id} viewerId={viewerId} /></div>
      <div className="mt-5 grid grid-cols-2 rounded-xl border py-3 text-center"><div><strong className="block">{counts.followers}</strong><span className="text-xs text-gray-500">{t('followers')}</span></div><div><strong className="block">{counts.following}</strong><span className="text-xs text-gray-500">{t('followingCount')}</span></div></div>
      {seller.ships_internationally && <p className="mt-3 text-sm">🌐 {t('ships')}</p>}
    </div>
    <div className="grid grid-cols-3 gap-0.5">{posts.map(post => <div key={post.id} className="aspect-square bg-gray-100">{post.media_type === 'video' ? <video src={post.media_url} playsInline controls className="h-full w-full object-cover" /> : <img src={post.media_url} alt={post.caption || 'Seller post'} className="h-full w-full object-cover" />}</div>)}</div>
  </section>;
}
