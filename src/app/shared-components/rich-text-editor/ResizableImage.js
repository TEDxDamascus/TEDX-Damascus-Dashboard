import Image from '@tiptap/extension-image';
import { ResizableNodeView } from '@tiptap/core';
import { applyImageContainerAlign } from './imageAlignUtils';
import { createImageAlignPlugin } from './imageAlignPlugin';

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent(),
      align: {
        default: 'left',
        parseHTML: (element) => {
          const value = element.getAttribute('data-align');
          if (value === 'center' || value === 'right' || value === 'left') return value;
          return 'left';
        },
        renderHTML: (attributes) => {
          const align = attributes.align || 'left';
          const styles = ['display:block', 'max-width:100%'];

          if (align === 'center') {
            styles.push('margin-left:auto', 'margin-right:auto');
          } else if (align === 'right') {
            styles.push('margin-left:auto', 'margin-right:0');
          }

          return {
            'data-align': align,
            style: styles.join(';'),
          };
        },
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const attr = element.getAttribute('width');
          if (attr) return Number.parseInt(attr, 10) || null;
          const match = element.style.width?.match(/^(\d+(?:\.\d+)?)px$/);
          return match ? Math.round(Number(match[1])) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px`,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const attr = element.getAttribute('height');
          if (attr) return Number.parseInt(attr, 10) || null;
          const match = element.style.height?.match(/^(\d+(?:\.\d+)?)px$/);
          return match ? Math.round(Number(match[1])) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) return {};
          return {
            height: attributes.height,
            style: `height: ${attributes.height}px`,
          };
        },
      },
    };
  },

  addNodeView() {
    if (!this.options.resize?.enabled || typeof document === 'undefined') {
      return null;
    }

    const { directions, minWidth, minHeight, alwaysPreserveAspectRatio } = this.options.resize;

    return ({ node, getPos, HTMLAttributes, editor }) => {
      const el = document.createElement('img');

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        if (value != null) {
          switch (key) {
            case 'width':
            case 'height':
              break;
            default:
              el.setAttribute(key, value);
              break;
          }
        }
      });

      el.src = HTMLAttributes.src;

      const nodeView = new ResizableNodeView({
        element: el,
        editor,
        node,
        getPos,
        onResize: (width, height) => {
          el.style.width = `${width}px`;
          el.style.height = `${height}px`;
        },
        onCommit: (width, height) => {
          const pos = getPos();
          if (pos === undefined) return;

          this.editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes(this.name, { width, height })
            .run();
        },
        onUpdate: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;

          applyImageContainerAlign(nodeView.dom, updatedNode.attrs.align || 'left');
          return true;
        },
        options: {
          directions,
          min: {
            width: minWidth,
            height: minHeight,
          },
          preserveAspectRatio: alwaysPreserveAspectRatio === true,
        },
      });

      const dom = nodeView.dom;
      applyImageContainerAlign(dom, node.attrs.align || 'left');

      dom.style.visibility = 'hidden';
      dom.style.pointerEvents = 'none';
      el.onload = () => {
        dom.style.visibility = '';
        dom.style.pointerEvents = '';
      };

      return nodeView;
    };
  },

  addProseMirrorPlugins() {
    return [...(this.parent?.() ?? []), createImageAlignPlugin()];
  },
}).configure({
  resize: {
    enabled: true,
    directions: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
    minWidth: 80,
    minHeight: 80,
    alwaysPreserveAspectRatio: true,
  },
});

export default ResizableImage;
