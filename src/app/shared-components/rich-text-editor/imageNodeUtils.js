import { NodeSelection } from '@tiptap/pm/state';

export function getSelectedImagePos(editor) {
  const { selection } = editor.state;

  if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
    return selection.from;
  }

  return null;
}

export function updateSelectedImageAttrs(editor, attrs) {
  const pos = getSelectedImagePos(editor);
  if (pos == null) return false;

  const node = editor.state.doc.nodeAt(pos);
  if (!node || node.type.name !== 'image') return false;

  editor.view.dispatch(
    editor.state.tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      ...attrs,
    })
  );

  return true;
}

export function getImageDomAtPos(editor, pos) {
  const dom = editor.view.nodeDOM(pos);
  return dom instanceof HTMLElement ? dom : null;
}

export function keepEditorFocus(event) {
  event.preventDefault();
}
