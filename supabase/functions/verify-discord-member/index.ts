import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GUILD_ID = '1376840674049265734' // E.M.S. | LJ Life

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ authorized: false, reason: 'unauthenticated' }, 401)

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userErr } = await callerClient.auth.getUser()
    if (userErr || !userData.user) return json({ authorized: false, reason: 'unauthenticated' }, 401)

    const { providerToken } = await req.json()
    if (!providerToken) return json({ authorized: false, reason: 'missing_token' })

    const memberRes = await fetch(`https://discord.com/api/v10/users/@me/guilds/${GUILD_ID}/member`, {
      headers: { Authorization: `Bearer ${providerToken}` },
    })

    if (memberRes.status === 404) return json({ authorized: false, reason: 'not_member' })
    if (!memberRes.ok) {
      console.error('Discord member lookup failed', memberRes.status, await memberRes.text())
      return json({ authorized: false, reason: 'discord_error' })
    }

    const member = await memberRes.json()
    const roleIds: string[] = member.roles ?? []

    const admin = createClient(supabaseUrl, serviceKey)
    const { data: roleMap, error: mapErr } = await admin
      .from('discord_role_map')
      .select('role_id, staff_role, is_gate, priority')
      .in('role_id', roleIds.length > 0 ? roleIds : ['0'])

    if (mapErr) {
      console.error('discord_role_map query failed', mapErr.message)
      return json({ authorized: false, reason: 'server_error' })
    }

    const hasGate = (roleMap ?? []).some((r) => r.is_gate)
    if (!hasGate) return json({ authorized: false, reason: 'no_gate_role' })

    const ranks = (roleMap ?? [])
      .filter((r) => r.staff_role)
      .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999))

    const newRole = ranks[0]?.staff_role ?? 'membre'

    const meta = userData.user.user_metadata
    // Prefer the per-server nickname (member.nick) over the global Discord
    // display name: on this RP server nicknames are set to the character's
    // "Prénom Nom", which is the identity staff actually want shown here.
    const displayName: string | null = member.nick || meta.full_name || meta.name || null
    const { error: updateErr } = await admin.from('staff').update({
      role: newRole,
      discord_id: meta.provider_id ?? meta.sub ?? null,
      full_name: displayName ?? 'Agent',
      avatar_url: meta.avatar_url ?? null,
    }).eq('id', userData.user.id)

    if (updateErr) {
      console.error('staff update failed', updateErr.message)
      return json({ authorized: false, reason: 'server_error' })
    }

    return json({ authorized: true, role: newRole })
  } catch (e) {
    console.error('verify-discord-member crashed', e)
    return json({ authorized: false, reason: 'server_error', message: e instanceof Error ? e.message : String(e) })
  }
})
