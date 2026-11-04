const EventModel = () => ({
  title: { en: '', ar: '' },
  description: { en: '', ar: '' },
  brief: { en: '', ar: '' },
  location: { en: '', ar: '' },
  location_email: '',
  location_phone: '',
  location_description: { en: '', ar: '' },
  start_time: '',
  end_time: '',
  coordinate_lng: '',
  coordinate_lat: '',
  date: '',
  event_type: '',
  event_image: '',
  gallery: [],
  speakers: [],
  status: 'draft',
  volunteers_count: '',

  // SEO / Open Graph (mirrors the Blog model so events can rank + share well).
  meta_title: { en: '', ar: '' },
  meta_description: { en: '', ar: '' },
  meta_keywords: { en: '', ar: '' },
  canonical_url: '',
  og_title: { en: '', ar: '' },
  og_description: { en: '', ar: '' },
  og_image: '',
});

export default EventModel;
