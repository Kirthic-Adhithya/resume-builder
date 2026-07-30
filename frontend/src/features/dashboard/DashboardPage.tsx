import { Copy, FilePlus2, MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreateResumeDialog } from '@/features/dashboard/CreateResumeDialog'
import { RenameResumeDialog } from '@/features/dashboard/RenameResumeDialog'
import { useDeleteResume, useDuplicateResume, useResumes } from '@/features/dashboard/api'
import type { Resume } from '@/features/dashboard/types'

const PAGE_SIZE = 10

export function DashboardPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [resumeToRename, setResumeToRename] = useState<Resume | null>(null)
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null)

  // Debounce search-as-you-type so we're not firing a request on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const { data, isPending } = useResumes(search, page, PAGE_SIZE)
  const duplicateResume = useDuplicateResume()
  const deleteResume = useDeleteResume()

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Resumes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data?.total ?? 0} document{data?.total === 1 ? '' : 's'}
          </p>
        </div>
        <CreateResumeDialog />
      </div>

      <div className="mt-6">
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search resumes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Title</TableHead>
              <TableHead>Last updated</TableHead>
              <TableHead className="w-12 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-2/3" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))}

            {!isPending && data?.items.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3}>
                  <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                    <span className="grid size-10 place-items-center rounded-lg border border-border bg-muted text-muted-foreground">
                      <FilePlus2 className="size-5" />
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold">
                        {search ? 'No resumes match' : 'No resumes yet'}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {search
                          ? 'Try a different search term.'
                          : 'Create your first resume to get started.'}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {data?.items.map((resume) => (
              <TableRow key={resume.id} className="group">
                <TableCell className="font-medium">
                  <Link
                    to={`/resumes/${resume.id}`}
                    className="text-foreground transition-colors duration-150 group-hover:text-primary"
                  >
                    {resume.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(resume.updated_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                        aria-label={`Actions for ${resume.title}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => setResumeToRename(resume)}>
                        <Pencil className="size-4" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          duplicateResume.mutate(resume.id, {
                            onSuccess: () => toast.success('Resume duplicated'),
                            onError: (err) =>
                              toast.error(err instanceof Error ? err.message : 'Duplicate failed'),
                          })
                        }
                      >
                        <Copy className="size-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setResumeToDelete(resume)}
                      >
                        <Trash2 className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {page} of {totalPages} ({data?.total ?? 0} total)
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <RenameResumeDialog resume={resumeToRename} onClose={() => setResumeToRename(null)} />

      <AlertDialog
        open={resumeToDelete !== null}
        onOpenChange={(open) => !open && setResumeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{resumeToDelete?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. The resume will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (resumeToDelete) {
                  const title = resumeToDelete.title
                  deleteResume.mutate(resumeToDelete.id, {
                    onSuccess: () => toast.success(`Deleted "${title}"`),
                    onError: (err) =>
                      toast.error(err instanceof Error ? err.message : 'Delete failed'),
                  })
                }
                setResumeToDelete(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
