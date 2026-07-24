import { defaultLocaleValue } from '../../../../shared-components/locale-input';

const PartnerModel = () => ({
  name: defaultLocaleValue(),
  slug: defaultLocaleValue(),
  image: '', 
  partnership_type: '',
  card_size: '',
  short_description: defaultLocaleValue(),
  long_description: defaultLocaleValue(),
  social_links: [''], 
  contact_info: {
    address: defaultLocaleValue(),
    phone: '',
    email: '',
  },
  services: [], 
});

export default PartnerModel;