export const IMAGE_ALIGNMENTS = ['left', 'center', 'right'];

function getJustifyContent(align) {
  if (align === 'center') return 'center';
  if (align === 'right') return 'flex-end';
  return 'flex-start';
}

export function applyImageContainerAlign(container, align = 'left') {
  if (!container) return;

  const safeAlign = IMAGE_ALIGNMENTS.includes(align) ? align : 'left';

  container.dataset.align = safeAlign;
  container.style.display = 'flex';
  container.style.width = '100%';
  container.style.maxWidth = '100%';
  container.style.marginTop = '0.75rem';
  container.style.marginBottom = '0.75rem';
  container.style.marginLeft = '0';
  container.style.marginRight = '0';
  container.style.justifyContent = getJustifyContent(safeAlign);

  const wrapper = container.querySelector('[data-resize-wrapper]');
  if (wrapper instanceof HTMLElement) {
    wrapper.style.width = 'fit-content';
    wrapper.style.maxWidth = '100%';
    wrapper.style.flexShrink = '0';
  }
}
