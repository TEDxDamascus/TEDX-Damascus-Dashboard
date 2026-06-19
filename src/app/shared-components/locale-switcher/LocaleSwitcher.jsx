import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { ButtonGroup, Button } from '@mui/material';
import { selectLocale, setLocale } from '../../store/localeSlice';

export default function LocaleSwitcher() {
  const dispatch = useDispatch();
  const locale = useSelector(selectLocale);
  const intl = useIntl();

  return (
    <ButtonGroup size="small" variant="outlined" sx={{ minWidth: 0 }}>
      <Button
        onClick={() => dispatch(setLocale('ar'))}
        variant={locale === 'ar' ? 'contained' : 'outlined'}
        sx={{ textTransform: 'none', px: 1.5 }}
      >
        {intl.formatMessage({ id: 'localeInput.tabAr' })}
      </Button>
      <Button
        onClick={() => dispatch(setLocale('en'))}
        variant={locale === 'en' ? 'contained' : 'outlined'}
        sx={{ textTransform: 'none', px: 1.5 }}
      >
        {intl.formatMessage({ id: 'localeInput.tabEn' })}
      </Button>
    </ButtonGroup>
  );
}
