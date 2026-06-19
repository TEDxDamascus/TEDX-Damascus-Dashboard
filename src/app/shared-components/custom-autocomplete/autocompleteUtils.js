export function debounce(fn, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      fn(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function normalizeOption(option) {
  if (!option) return null;
  return {
    ...option,
    id: option.id ?? option.value,
    label: option.label ?? option.name ?? option.title ?? String(option.id ?? option.value ?? ''),
  };
}

export function getOptionLabel(option) {
  if (!option) return '';
  return option.label ?? option.name ?? option.title ?? String(option.id ?? option.value ?? '');
}

export function isOptionEqualToValue(option, value) {
  if (!option || !value) return false;
  const optId = option.id ?? option.value;
  const valId = value.id ?? value.value;
  return optId === valId;
}
