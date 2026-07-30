import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCreateResume } from '@/features/dashboard/api'
import { cn } from '@/lib/utils'
import { TEMPLATES } from '@/lib/templates'

const createResumeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  template: z.enum(['blank', 'simple']),
})

type CreateResumeValues = z.infer<typeof createResumeSchema>

export function CreateResumeDialog() {
  const [open, setOpen] = useState(false)
  // Purely visual selection — the backend only has two real starter documents (see
  // `createResumeSchema`), so this just tracks which card is highlighted; the form's
  // `template` field is what actually gets submitted (set from the card's `starter`).
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].name)
  const createResume = useCreateResume()
  const form = useForm<CreateResumeValues>({
    resolver: zodResolver(createResumeSchema),
    defaultValues: { title: '', template: TEMPLATES[0].starter },
  })

  function onSubmit(values: CreateResumeValues) {
    createResume.mutate(values, {
      onSuccess: () => {
        toast.success('Resume created')
        setOpen(false)
        form.reset()
        setSelectedTemplate(TEMPLATES[0].name)
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not create resume'),
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> New resume
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New resume</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <div className="grid max-h-80 grid-cols-2 gap-3 overflow-y-auto pt-1 pr-1 sm:grid-cols-3">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => {
                          setSelectedTemplate(t.name)
                          field.onChange(t.starter)
                        }}
                        className={cn(
                          'card-lift overflow-hidden rounded-lg border text-left transition-colors',
                          selectedTemplate === t.name
                            ? 'border-primary ring-1 ring-primary/30'
                            : 'border-border',
                        )}
                      >
                        <div className="border-b border-border bg-muted/50 p-2.5">
                          <div className="mx-auto aspect-[1/1.32] w-full max-w-[80px] rounded-sm bg-white p-2 shadow-sm">
                            <div className="h-1 w-1/2 rounded-full bg-neutral-800" />
                            <div className="mt-1 h-px w-2/3 rounded-full bg-neutral-300" />
                            <div className="mt-2 space-y-0.5">
                              {[100, 90, 80, 94].map((w, k) => (
                                <div
                                  key={k}
                                  className="h-px rounded-full bg-neutral-200"
                                  style={{ width: `${w}%` }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="p-2">
                          <p className="truncate text-xs font-semibold">{t.name}</p>
                          <Badge
                            variant="secondary"
                            className="mt-1 rounded-md px-1.5 py-0 text-[10px] font-normal"
                          >
                            {t.tag}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createResume.isPending}>
                {createResume.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
