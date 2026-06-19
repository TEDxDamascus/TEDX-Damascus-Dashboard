import { defaultLocaleValue } from '../../../../shared-components/locale-input';

const PartnerModel = () => ({
  name: defaultLocaleValue(),
  slug: defaultLocaleValue(),
  description: defaultLocaleValue(),
  image: '',
  partnership_type: '',
  website_url: '',
  instagram_url: '',
  linkedin_url: '',
  facebook_url: '',
});

export default PartnerModel;
