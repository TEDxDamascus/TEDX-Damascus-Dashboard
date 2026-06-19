import { defaultLocaleValue } from '../../../../shared-components/locale-input';

const OrganizerModel = () => ({
  name: defaultLocaleValue(),
  bio: defaultLocaleValue(),
  image: '',
  role: '',
  linkedin_url: '',
  twitter_url: '',
  facebook_url: '',
  website_url: '',
  gallery: [],
});

export default OrganizerModel;
