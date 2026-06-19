import { defaultLocaleValue } from '../../../../shared-components/locale-input';

const SpeakerModel = () => ({
  name: defaultLocaleValue(),
  bio: defaultLocaleValue(),
  description: defaultLocaleValue(),
  speaker_image: '',
  linkedin_url: '',
  twitter_url: '',
  facebook_url: '',
  website_url: '',
  gallery: [],
  video_link: '',
  email: '',
  phone: '',
  featured: false,
  active: true,
});

export default SpeakerModel;
