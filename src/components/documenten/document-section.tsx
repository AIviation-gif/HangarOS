'use client'

import { useActionState, useRef } from 'react'
import { uploadDocument, deleteDocument, DocumentUploadState } from '@/app/actions/documents'
import { PlusIcon, FileIcon, Trash2Icon } from 'lucide-react'

type Document = {
  id: string
  name: string
  file_url: string
  created_at: string
}

type Props = {
  documents: Document[]
  category: 'aircraft' | 'member' | 'club'
  relatedId: string
  revalidatePath: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function DocumentSection({ documents, category, relatedId, revalidatePath: path }: Props) {
  const formRef = useRef<HTMLFormElement>(null)

  async function upload(state: DocumentUploadState, formData: FormData): Promise<DocumentUploadState> {
    const result = await uploadDocument(state, formData)
    if (result && 'success' in result) formRef.current?.reset()
    return result
  }

  const [state, formAction, pending] = useActionState(upload, undefined)

  return (
    <div className="space-y-3">
      {documents.length === 0 ? (
        <p className="text-sm text-gray-400">Nog geen documenten.</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {documents.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-3">
              <FileIcon className="h-4 w-4 shrink-0 text-gray-400" />
              <div className="flex-1 min-w-0">
                <a
                  href={d.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline truncate block"
                >
                  {d.name}
                </a>
                <p className="text-xs text-gray-400">{formatDate(d.created_at)}</p>
              </div>
              <button
                onClick={() => deleteDocument(d.id, path)}
                className="shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                title="Verwijderen"
              >
                <Trash2Icon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} encType="multipart/form-data" className="flex flex-col gap-2">
        <input type="hidden" name="category"    value={category} />
        <input type="hidden" name={category === 'aircraft' ? 'aircraft_id' : 'member_id'} value={relatedId} />

        {state && 'error' in state && (
          <p className="text-xs text-red-600">{state.error}</p>
        )}

        <div className="flex gap-2 flex-wrap">
          <input
            name="name" type="text" required placeholder="Naam document (bijv. ARC 2025)"
            className="flex-1 min-w-40 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="file" type="file" required
            className="text-sm text-gray-500 file:mr-2 file:rounded file:border-0 file:bg-blue-50 file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            type="submit" disabled={pending}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            {pending ? 'Uploaden…' : 'Uploaden'}
          </button>
        </div>
      </form>
    </div>
  )
}
