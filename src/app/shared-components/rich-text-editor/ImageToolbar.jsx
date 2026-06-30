import { useEffect, useState } from 'react';
import { applyImageContainerAlign } from './imageAlignUtils';
import {
  getImageDomAtPos,
  getSelectedImagePos,
  keepEditorFocus,
  updateSelectedImageAttrs,
} from './imageNodeUtils';
import ToolbarTooltip from './ToolbarTooltip';

const ALIGN_OPTIONS = [
  { label: 'يسار', value: 'left', icon: '⬅' },
  { label: 'وسط', value: 'center', icon: '⬌' },
  { label: 'يمين', value: 'right', icon: '➡' },
];

const WIDTH_PRESETS = [
  { label: '25%', value: 25, tooltip: 'عرض 25%' },
  { label: '50%', value: 50, tooltip: 'عرض 50%' },
  { label: '75%', value: 75, tooltip: 'عرض 75%' },
  { label: '100%', value: 100, tooltip: 'عرض 100%' },
];

function getImageAspectRatio(editor, attrs) {
  const storedWidth = Number(attrs.width);
  const storedHeight = Number(attrs.height);
  if (storedWidth > 0 && storedHeight > 0) {
    return storedWidth / storedHeight;
  }

  const pos = getSelectedImagePos(editor);
  const dom = pos != null ? getImageDomAtPos(editor, pos) : null;
  const selectedImg = dom?.querySelector('img');

  if (selectedImg?.naturalWidth && selectedImg?.naturalHeight) {
    return selectedImg.naturalWidth / selectedImg.naturalHeight;
  }

  return 16 / 9;
}

export default function ImageToolbar({ editor }) {
  const [, setRevision] = useState(0);

  useEffect(() => {
    if (!editor) return undefined;

    const refresh = () => setRevision((value) => value + 1);
    editor.on('selectionUpdate', refresh);
    editor.on('transaction', refresh);

    return () => {
      editor.off('selectionUpdate', refresh);
      editor.off('transaction', refresh);
    };
  }, [editor]);

  if (!editor?.isActive('image')) return null;

  const attrs = editor.getAttributes('image');
  const currentWidth = Number(attrs.width) || null;
  const activeAlign = attrs.align || 'left';

  const applyAlign = (align) => {
    const pos = getSelectedImagePos(editor);
    if (pos == null) return;

    updateSelectedImageAttrs(editor, { align });

    const dom = getImageDomAtPos(editor, pos);
    applyImageContainerAlign(dom, align);
  };

  const applyWidthPercent = (percent) => {
    const pos = getSelectedImagePos(editor);
    if (pos == null) return;

    const contentWidth = editor.view.dom.clientWidth || 640;
    const aspectRatio = getImageAspectRatio(editor, attrs);
    const newWidth = Math.max(80, Math.round(contentWidth * (percent / 100)));
    const newHeight = Math.round(newWidth / aspectRatio);

    updateSelectedImageAttrs(editor, { width: newWidth, height: newHeight });
  };

  const deleteImage = () => {
    const pos = getSelectedImagePos(editor);
    if (pos == null) return;

    editor.view.dispatch(editor.state.tr.delete(pos, pos + 1));
  };

  return (
    <div
      onMouseDown={keepEditorFocus}
      className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2"
    >
      <span className="text-xs font-semibold text-blue-900">الصورة</span>

      <div className="flex flex-wrap gap-1">
        {ALIGN_OPTIONS.map((option) => (
          <ToolbarTooltip key={option.value} title={`محاذاة ${option.label}`}>
            <button
              type="button"
              onClick={() => applyAlign(option.value)}
              className={[
                'rounded border px-2 py-0.5 text-xs transition-colors',
                activeAlign === option.value
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-blue-200 bg-white text-blue-900 hover:bg-blue-100',
              ].join(' ')}
            >
              {option.icon}
            </button>
          </ToolbarTooltip>
        ))}
      </div>

      <div className="flex flex-wrap gap-1">
        {WIDTH_PRESETS.map((preset) => (
          <ToolbarTooltip key={preset.value} title={preset.tooltip}>
            <button
              type="button"
              onClick={() => applyWidthPercent(preset.value)}
              className="rounded border border-blue-200 bg-white px-2 py-0.5 text-xs text-blue-900 transition-colors hover:bg-blue-100"
            >
              {preset.label}
            </button>
          </ToolbarTooltip>
        ))}
      </div>

      {currentWidth ? (
        <span className="text-xs text-blue-700">العرض: {currentWidth}px</span>
      ) : null}

      <ToolbarTooltip title="حذف الصورة">
        <button
          type="button"
          onClick={deleteImage}
          className="ml-auto rounded border border-red-200 bg-white px-2 py-0.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          حذف
        </button>
      </ToolbarTooltip>

      <span className="w-full text-xs text-blue-600/80">
        اسحب الزوايا لتغيير الحجم · أو اضغط Delete للحذف
      </span>
    </div>
  );
}
