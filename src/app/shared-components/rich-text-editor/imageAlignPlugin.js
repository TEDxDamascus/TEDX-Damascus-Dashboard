import { Plugin, PluginKey } from '@tiptap/pm/state';
import { applyImageContainerAlign } from './imageAlignUtils';

function syncImageAlignments(view) {
  view.state.doc.descendants((node, pos) => {
    if (node.type.name !== 'image') return;

    const dom = view.nodeDOM(pos);
    if (dom instanceof HTMLElement) {
      applyImageContainerAlign(dom, node.attrs.align || 'left');
    }
  });
}

export const imageAlignPluginKey = new PluginKey('imageAlignSync');

export function createImageAlignPlugin() {
  return new Plugin({
    key: imageAlignPluginKey,
    view: (view) => ({
      update: () => {
        syncImageAlignments(view);
      },
    }),
  });
}
