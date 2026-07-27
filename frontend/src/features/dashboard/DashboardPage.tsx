import { MoreHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'

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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
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
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Input
          placeholder="Search resumes..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-xs"
        />
        <CreateResumeDialog />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Last updated</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          )}
          {!isPending && data?.items.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                {search
                  ? 'No resumes match your search.'
                  : 'No resumes yet — create your first one.'}
              </TableCell>
            </TableRow>
          )}
          {data?.items.map((resume) => (
            <TableRow key={resume.id}>
              <TableCell className="font-medium">{resume.title}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(resume.updated_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setResumeToRename(resume)}>
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicateResume.mutate(resume.id)}>
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setResumeToDelete(resume)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
                if (resumeToDelete) deleteResume.mutate(resumeToDelete.id)
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
