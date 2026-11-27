'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { FollowButton } from '@/components/FollowButton';
import { useApp } from '@/context/AppContext';
import type { Profile } from '@/lib/types';

export default function ProfilePage() {
  const sb = useMemo(() => supabaseBrowser(), []);
  const { t } = useApp();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!active) return;
      setViewerId(user?.id ?? null);
      if (user) {
        const [{ data: profileData }, { count: followers }, { count: following }] = await Promise.all([
          sb.from('profiles').select('*').eq('id', user.id).maybeSingle(),
          sb.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
          sb.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id),
        ]);
        if (active) {
          setProfile(profileData as Profile | null);
          setCounts({ followers: followers || 0, following: following || 0 });
        }
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [sb]);

  if (loading) return <p className="p-6">Loading…</p>;
  if (!profile) return <div className="p-6"><h1 className="text-xl font-bold">Your profile</h1><Link href="/auth" className="mt-3 inline-block rounded bg-emerald-600 px-4 py-2 text-white">Login / register</Link></div>;

  return <section className="p-5"><div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">{(profile.full_name || profile.username || 'A')[0].toUpperCase()}</div><div className="min-w-0 flex-1"><h1 className="text-xl font-bold">{profile.full_name || profile.shop_name || profile.username}</h1><p className="text-sm text-gray-500">@{profile.username} · {profile.role}</p>{profile.is_verified && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><BadgeCheck size={14} />{t('verified')}</span>}</div><FollowButton followingId={profile.id} viewerId={viewerId} /></div>
    <div className="mt-5 grid grid-cols-2 rounded-xl border py-3 text-center"><div><strong className="block">{counts.followers}</strong><span className="text-xs text-gray-500">{t('followers')}</span></div><div><strong className="block">{counts.following}</strong><span className="text-xs text-gray-500">{t('followingCount')}</span></div></div>
    {profile.ships_internationally && <p className="mt-4 text-sm">🌐 {t('ships')}</p>}
    {profile.role === 'seller' && <Link href="/profile/products" className="mt-5 block rounded-xl border p-4 font-semibold">Manage products →</Link>}
    <button onClick={async () => { await sb.auth.signOut(); location.href = '/auth'; }} className="mt-4 rounded-lg border border-rose-200 px-4 py-2 text-rose-700">Log out</button>
  </section>;
}
