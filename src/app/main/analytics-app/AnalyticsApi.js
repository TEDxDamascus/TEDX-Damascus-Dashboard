import { apiService } from 'app/store/apiService';

export const addTagTypes = ['Analytics'];

const wait = (ms = 200) => new Promise((r) => setTimeout(r, ms));

// ── Mock analytics data ────────────────────────────────────────────────────────
// No backend Analytics entity provided yet.
// Ask backend team to implement an analytics/stats endpoint (see gap report).
const mockAnalytics = {
  summary: {
    totalSpeakers: 5,
    totalEvents: 3,
    totalBlogs: 2,
    totalPublishedBlogs: 1,
    totalForms: 2,
    totalPublishedForms: 1,
    totalFormSubmissions: 2,
    totalUsers: 4,
    totalActiveUsers: 3,
    totalBlogViews: 142,
  },
  recentActivity: [
    {
      id: 'act-1',
      type: 'blog_published',
      description: 'Blog "TEDx Damascus Launch" was published',
      timestamp: '2025-03-01T10:00:00Z',
    },
    {
      id: 'act-2',
      type: 'form_submission',
      description: 'New speaker application submitted by Nour Al-Rashid',
      timestamp: '2025-03-15T10:30:00Z',
    },
    {
      id: 'act-3',
      type: 'form_submission',
      description: 'New speaker application submitted by Rami Barakat',
      timestamp: '2025-03-18T14:00:00Z',
    },
    {
      id: 'act-4',
      type: 'user_created',
      description: 'New user "Layla Coordinator" was added',
      timestamp: '2025-03-15T12:00:00Z',
    },
    {
      id: 'act-5',
      type: 'event_created',
      description: 'Event "TEDx Damascus Salon — Tech Edition" was created',
      timestamp: '2025-02-15T08:00:00Z',
    },
  ],
  blogViewsOverTime: [
    { month: 'Jan', views: 0 },
    { month: 'Feb', views: 0 },
    { month: 'Mar', views: 142 },
    { month: 'Apr', views: 0 },
  ],
  submissionsByForm: [
    { formName: 'Speaker Application 2025', count: 2 },
    { formName: 'Attendee Registration', count: 0 },
  ],
};

const analyticsApi = apiService.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      async queryFn() {
        await wait();
        return { data: { data: mockAnalytics } };
      },
      providesTags: ['Analytics'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAnalyticsQuery } = analyticsApi;
export default analyticsApi;
