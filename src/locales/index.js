import ar from './ar';
import en from './en';

function flatten(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? prefix + '.' : '';
    const val = obj[key];
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      Object.assign(acc, flatten(val, pre + key));
    } else {
      acc[pre + key] = val;
    }
    return acc;
  }, {});
}

export const messages = {
  ar: flatten(ar),
  en: flatten(en),
};
export const locales = ['ar', 'en'];
export const defaultLocale = 'en';
