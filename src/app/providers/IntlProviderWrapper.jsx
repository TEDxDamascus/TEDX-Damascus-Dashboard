import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { selectLocale } from '../store/localeSlice';
import { messages, defaultLocale } from '../../locales';

export default function IntlProviderWrapper({ children }) {
  const locale = useSelector(selectLocale);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', locale);
  }, [locale]);

  return (
    <IntlProvider locale={locale} messages={messages[locale]} defaultLocale={defaultLocale}>
      {children}
    </IntlProvider>
  );
}
