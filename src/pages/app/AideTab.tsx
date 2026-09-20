import { useCallback, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { supabase, isDirection, type HelpArticle } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { AnimatedList, AnimatedListItem } from '@/components/ui/AnimatedList'

export function AideTab() {
  const { staff } = useAuth()
  const [articles, setArticles] = useState<HelpArticle[]>([])
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchArticles = useCallback(async () => {
    const { data } = await supabase.from('help_articles').select('*').order('position').order('created_at')
    if (data) setArticles(data)
  }, [])

  useEffect(() => {
    fetchArticles()
    const channel = supabase
      .channel('aide-tab')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'help_articles' }, fetchArticles)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchArticles])

  async function handleAdd() {
    if (!title.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    const { error: err } = await supabase.from('help_articles').insert({
      title: title.trim(),
      image_url: imageUrl.trim() || null,
      content: content.trim() || null,
      position: articles.length,
    })
    setSubmitting(false)
    if (err) {
      setError(err.message)
      return
    }
    setTitle('')
    setImageUrl('')
    setContent('')
    await fetchArticles()
  }

  async function handleDelete(id: number) {
    await supabase.from('help_articles').delete().eq('id', id)
    await fetchArticles()
  }

  const canManage = isDirection(staff?.role)

  return (
    <div className="flex flex-col gap-6">
      {canManage && (
        <Card className="p-5">
          <h2 className="text-[var(--ink)] font-bold text-sm mb-4">Ajouter une fiche d'aide</h2>
          {error && <p className="text-red-300 text-xs mb-3 animate-pop-in">{error}</p>}
          <div className="grid gap-4 mb-4">
            <Field label="Titre">
              <Input placeholder="ex: Comment prendre son service" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="URL de l'image (optionnel)">
              <Input placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </Field>
            <Field label="Texte (optionnel)">
              <Textarea rows={3} placeholder="Explication..." value={content} onChange={(e) => setContent(e.target.value)} />
            </Field>
          </div>
          <Button variant="red" className="w-full" disabled={submitting || !title.trim()} onClick={handleAdd}>
            Ajouter
          </Button>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        <AnimatedList className="flex flex-col gap-4">
          {articles.map((a) => (
            <AnimatedListItem key={a.id}>
              <Card className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-[var(--ink)] font-bold text-sm">{a.title}</h3>
                  {canManage && (
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)}>
                      <Trash2 size={13} />
                    </Button>
                  )}
                </div>
                {a.image_url && (
                  <img src={a.image_url} alt={a.title} className="w-full rounded-xl border border-[var(--ink)]/8 mb-3 object-cover" />
                )}
                {a.content && <p className="text-[var(--ink)]/60 text-sm leading-relaxed whitespace-pre-wrap">{a.content}</p>}
              </Card>
            </AnimatedListItem>
          ))}
        </AnimatedList>
        {articles.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-[var(--ink)]/30 text-sm">
              Aucune fiche d'aide pour le moment.
              {canManage ? " Ajoute la première ci-dessus." : ' La Direction peut en ajouter.'}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
