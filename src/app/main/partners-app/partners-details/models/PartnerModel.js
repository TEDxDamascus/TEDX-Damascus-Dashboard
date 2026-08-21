import { defaultLocaleValue } from '../../../../shared-components/locale-input';

const PartnerModel = () => ({
  name: defaultLocaleValue(),
  slug: defaultLocaleValue(),
  image: '',
  partner_ship_type: '',
  custom_card_size: '',
  year: new Date().getFullYear(),
  short_description: defaultLocaleValue(),
  long_description: defaultLocaleValue(),
  social_links: [''],
  contact_info: {
    address: defaultLocaleValue(),
    phone: '',
    email: '',
  },

  services: [
    {
      title: defaultLocaleValue(),
      description: defaultLocaleValue(),
    },
  ],
});

export default PartnerModel;