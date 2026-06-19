import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Color } from '@tiptap/extension-color';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
export default function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        excludeExtensions: ['Link', 'HorizontalRule'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Write something amazing...',
      }),
      Color,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      HorizontalRule,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const url = prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="w-full rounded-[1rem] border bg-white p-4 shadow-sm">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap gap-2 border-b pb-3">
        {/* Text styles */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`border px-2 py-1 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`border px-2 py-1 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`border px-2 py-1 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
        >
          <u>U</u>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`border px-2 py-1 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
        >
          <s>S</s>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={`border px-2 py-1 ${editor.isActive('subscript') ? 'bg-gray-200' : ''}`}
        >
          X<sub>2</sub>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={`border px-2 py-1 ${editor.isActive('superscript') ? 'bg-gray-200' : ''}`}
        >
          X<sup>2</sup>
        </button>

        {/* Colors */}
        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="h-8 w-8 border"
          title="Text Color"
        />
        <input
          type="color"
          onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
          className="h-8 w-8 border"
          title="Highlight Color"
        />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`border px-2 py-1 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`border px-2 py-1 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
        >
          1. List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`border px-2 py-1 ${editor.isActive('taskList') ? 'bg-gray-200' : ''}`}
        >
          ☑ Task
        </button>

        {/* Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`border px-2 py-1 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
        >
          ⬅
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`border px-2 py-1 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
        >
          ⬌
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`border px-2 py-1 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
        >
          ➡
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`border px-2 py-1 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}`}
        >
          ⬌⬅
        </button>

        {/* Blocks */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`border px-2 py-1 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
        >
          ❝
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`border px-2 py-1 ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
        >
          &lt;/&gt;
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="border px-2 py-1"
        >
          ―
        </button>

        {/* Media */}
        <button onClick={setLink} className="border px-2 py-1">
          🔗
        </button>
        <button onClick={addImage} className="border px-2 py-1">
          🖼️
        </button>

        {/* Actions */}
        <button
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          className="border px-2 py-1"
        >
          Clear
        </button>
        <button onClick={() => editor.chain().focus().undo().run()} className="border px-2 py-1">
          ↶
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} className="border px-2 py-1">
          ↷
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="rich-text-editor-content min-h-[360px] w-full outline-none"
      />
    </div>
  );
}
