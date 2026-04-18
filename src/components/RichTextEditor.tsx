'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useEffect } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder: 'Write your blog content here...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4 border rounded-lg',
      },
    },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="h-[300px] border rounded-lg animate-pulse bg-gray-50" />

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 mb-2 p-2 border rounded-t-lg bg-gray-50">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${editor?.isActive('bold') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
        >
          Bold
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded ${editor?.isActive('italic') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
        >
          Italic
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
        >
          H2
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${editor?.isActive('bulletList') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
        >
          List
        </button>
        <button
          onClick={() => {
            const url = window.prompt('Enter image URL')
            if (url) editor?.chain().focus().setImage({ src: url }).run()
          }}
          className="px-2 py-1 rounded hover:bg-gray-200"
        >
          Image
        </button>
      </div>
      <EditorContent editor={editor} className="border rounded-b-lg" />
    </div>
  )
}