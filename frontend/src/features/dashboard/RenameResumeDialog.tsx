import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useRenameResume } from '@/features/dashboard/api'
import type { Resume } from '@/features/dashboard/types'

const renameResumeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
})

type RenameResumeValues = z.infer<typeof renameResumeSchema>

// Controlled by the parent (DashboardPage) via `resume`, not a self-managed open/close
// trigger like CreateResumeDialog — this dialog only makes sense in the context of one
// specific row's "Rename" action, so the parent owns which resume (if any) is being renamed.
export function RenameResumeDialog({
  resume,
  onClose,
}: {
  resume: Resume | null
  onClose: () => void
}) {
  const renameResume = useRenameResume()
  const form = useForm<RenameResumeValues>({
    resolver: zodResolver(renameResumeSchema),
    defaultValues: { title: '' },
  })

  useEffect(() => {
    if (resume) form.reset({ title: resume.title })
  }, [resume, form])

  function onSubmit(values: RenameResumeValues) {
    if (!resume) return
    renameResume.mutate(
      { id: resume.id, title: values.title },
      {
        onSuccess: () => {
          toast.success('Resume renamed')
          onClose()
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Rename failed'),
      },
    )
  }

  return (
    <Dialog open={resume !== null} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename resume</DialogTitle>
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
            <DialogFooter>
              <Button type="submit" disabled={renameResume.isPending}>
                {renameResume.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
