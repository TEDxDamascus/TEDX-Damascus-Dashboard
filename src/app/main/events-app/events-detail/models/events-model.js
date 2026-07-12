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
});

export default EventModel;
