import { defaultLocaleValue } from '../../../../shared-components/locale-input';

const TeamMemberModel = () => ({
  name: defaultLocaleValue(),
  bio: defaultLocaleValue(),
  image: '',
  year: new Date().getFullYear().toString(),
  event_id: '',
  linkedin_url: '',
  twitter_url: '',
  facebook_url: '',
  website_url: '',
});

export default TeamMemberModel;
