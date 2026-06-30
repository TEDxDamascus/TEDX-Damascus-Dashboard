import { useEffect, useState } from 'react';
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
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Youtube from '@tiptap/extension-youtube';
import { ImagePickerDialog } from '../image-picker';
import FontSize from './FontSize';
import ResizableImage from './ResizableImage';
import ImageToolbar from './ImageToolbar';
import UrlInputDialog from './UrlInputDialog';
import { isYoutubeUrl, normalizeUrl } from './urlUtils';
import ToolbarTooltip, { ToolbarButton } from './ToolbarTooltip';

const HEADING_OPTIONS = [
  { value: '0', label: 'Paragraph' },
  { value: '1', label: 'Heading 1' },
  { value: '2', label: 'Heading 2' },
  { value: '3', label: 'Heading 3' },
  { value: '4', label: 'Heading 4' },
  { value: '5', label: 'Heading 5' },
  { value: '6', label: 'Heading 6' },
];

const FONT_SIZE_OPTIONS = [
  { value: '', label: 'Default' },
  { value: '12px', label: '12px' },
  { value: '14px', label: '14px' },
  { value: '16px', label: '16px' },
  { value: '18px', label: '18px' },
  { value: '20px', label: '20px' },
  { value: '24px', label: '24px' },
  { value: '28px', label: '28px' },
  { value: '32px', label: '32px' },
  { value: '36px', label: '36px' },
];

const toolbarSelect =
  'rounded border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700';

function getActiveHeadingLevel(editor) {
  for (let level = 1; level <= 6; level += 1) {
    if (editor.isActive('heading', { level })) return String(level);
  }
  return '0';
}

export default function RichTextEditor({ value, onChange, placeholder }) {
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  const [linkDialogInitial, setLinkDialogInitial] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        excludeExtensions: ['Link', 'HorizontalRule'],
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
          class: 'rich-text-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Write something amazing...',
      }),
      Color,
      TextStyle,
      FontSize,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      ResizableImage,
      Youtube.configure({
        width: 640,
        height: 360,
        nocookie: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      HorizontalRule,
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || '';
    if (next !== current) {
      editor.commands.setContent(next, false);
    }
  }, [editor, value]);

  if (!editor) return null;

  const handleHeadingChange = (event) => {
    const level = event.target.value;
    if (level === '0') {
      editor.chain().focus().setParagraph().run();
      return;
    }
    editor
      .chain()
      .focus()
      .setHeading({ level: Number(level) })
      .run();
  };

  const handleFontSizeChange = (event) => {
    const size = event.target.value;
    if (!size) {
      editor.chain().focus().unsetFontSize().run();
      return;
    }
    editor.chain().focus().setFontSize(size).run();
  };

  const openLinkDialog = () => {
    setLinkDialogInitial(editor.getAttributes('link').href || '');
    setLinkDialogOpen(true);
  };

  const handleLinkSubmit = (rawUrl) => {
    if (!rawUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const url = normalizeUrl(rawUrl);
    if (!url) {
      window.alert('يرجى إدخال رابط صحيح (مثال: https://example.com).');
      return;
    }

    const { empty } = editor.state.selection;

    if (empty) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
        .run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleYoutubeSubmit = (rawUrl) => {
    const url = normalizeUrl(rawUrl);
    if (!url) return;

    if (!isYoutubeUrl(url)) {
      window.alert('يرجى إدخال رابط YouTube صحيح (youtube.com أو youtu.be).');
      return;
    }

    editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const handleImageSelect = ({ url }) => {
    if (!url) {
      setImagePickerOpen(false);
      return;
    }

    const contentWidth = editor.view.dom.clientWidth || 640;
    const defaultWidth = Math.round(contentWidth * 0.5);
    const preload = new window.Image();

    preload.onload = () => {
      const aspectRatio = preload.naturalWidth / preload.naturalHeight || 1;
      const width = Math.min(defaultWidth, preload.naturalWidth || defaultWidth);
      const height = Math.round(width / aspectRatio);

      editor.chain().focus().setImage({ src: url, width, height, align: 'left' }).run();
    };

    preload.onerror = () => {
      editor.chain().focus().setImage({ src: url, align: 'left' }).run();
    };

    preload.src = url;
    setImagePickerOpen(false);
  };

  const activeFontSize = editor.getAttributes('textStyle').fontSize || '';

  return (
    <div className="w-full rounded-[1rem] border bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap gap-2 border-b pb-3">
        <ToolbarTooltip title="نوع النص (فقرة أو عنوان)">
          <select
            value={getActiveHeadingLevel(editor)}
            onChange={handleHeadingChange}
            className={toolbarSelect}
          >
            {HEADING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </ToolbarTooltip>

        <ToolbarTooltip title="حجم الخط">
          <select
            value={activeFontSize}
            onChange={handleFontSizeChange}
            className={toolbarSelect}
          >
            {FONT_SIZE_OPTIONS.map((option) => (
              <option key={option.value || 'default'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </ToolbarTooltip>

        <ToolbarButton
          tooltip="غليظ"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          tooltip="مائل"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          tooltip="تحته خط"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton
          tooltip="خط في الوسط"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </ToolbarButton>
        <ToolbarButton
          tooltip="أسفل السطر"
          active={editor.isActive('subscript')}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          X<sub>2</sub>
        </ToolbarButton>
        <ToolbarButton
          tooltip="أعلى السطر"
          active={editor.isActive('superscript')}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
          X<sup>2</sup>
        </ToolbarButton>

        <ToolbarTooltip title="لون النص">
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="h-8 w-8 cursor-pointer rounded border border-gray-200"
          />
        </ToolbarTooltip>
        <ToolbarTooltip title="لون التظليل">
          <input
            type="color"
            onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
            className="h-8 w-8 cursor-pointer rounded border border-gray-200"
          />
        </ToolbarTooltip>

        <ToolbarButton
          tooltip="قائمة نقطية"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          tooltip="قائمة مرقّمة"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          tooltip="قائمة مهام"
          active={editor.isActive('taskList')}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          ☑ Task
        </ToolbarButton>

        <ToolbarButton
          tooltip="محاذاة لليسار"
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          ⬅
        </ToolbarButton>
        <ToolbarButton
          tooltip="محاذاة للوسط"
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          ⬌
        </ToolbarButton>
        <ToolbarButton
          tooltip="محاذاة لليمين"
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          ➡
        </ToolbarButton>
        <ToolbarButton
          tooltip="ضبط النص"
          active={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          ⬌⬅
        </ToolbarButton>

        <ToolbarButton
          tooltip="اقتباس"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          ❝
        </ToolbarButton>
        <ToolbarButton
          tooltip="كتلة كود"
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          &lt;/&gt;
        </ToolbarButton>
        <ToolbarButton
          tooltip="خط أفقي"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          ―
        </ToolbarButton>

        <ToolbarButton tooltip="إضافة رابط" onClick={openLinkDialog}>
          🔗
        </ToolbarButton>
        <ToolbarButton tooltip="إضافة صورة" onClick={() => setImagePickerOpen(true)}>
          🖼️
        </ToolbarButton>
        <ToolbarButton tooltip="تضمين فيديو YouTube" onClick={() => setYoutubeDialogOpen(true)}>
          ▶ YT
        </ToolbarButton>

        <ToolbarButton
          tooltip="مسح التنسيق"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        >
          Clear
        </ToolbarButton>
        <ToolbarButton tooltip="تراجع" onClick={() => editor.chain().focus().undo().run()}>
          ↶
        </ToolbarButton>
        <ToolbarButton tooltip="إعادة" onClick={() => editor.chain().focus().redo().run()}>
          ↷
        </ToolbarButton>
      </div>

      <ImageToolbar editor={editor} />

      <EditorContent
        editor={editor}
        className="rich-text-editor-content min-h-[360px] w-full outline-none"
      />

      <ImagePickerDialog
        open={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onSelect={handleImageSelect}
        currentValue={{ id: '', url: '' }}
      />

      <UrlInputDialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onSubmit={handleLinkSubmit}
        title="إضافة رابط"
        description="لربط نص موجود: حدّده ثم أدخل الرابط. لإدراج رابط جديد: ضع المؤشر في المكان المناسب وأدخل الرابط."
        initialValue={linkDialogInitial}
        placeholder="https://example.com"
        submitLabel="تطبيق الرابط"
      />

      <UrlInputDialog
        open={youtubeDialogOpen}
        onClose={() => setYoutubeDialogOpen(false)}
        onSubmit={handleYoutubeSubmit}
        title="تضمين فيديو YouTube"
        description="الصق رابط YouTube. سيظهر الفيديو في المقال للقرّاء."
        placeholder="https://www.youtube.com/watch?v=..."
        submitLabel="تضمين الفيديو"
      />
    </div>
  );
}
