import { Paper, Grid, Box, Typography, CircularProgress, Chip } from '@mui/material';
import {
  People,
  Event,
  CheckCircle,
  TrendingUp,
  Article,
  Assignment,
  PersonAdd,
  PublishedWithChanges,
  EventNote,
} from '@mui/icons-material';
// import { useGetAnalyticsQuery } from '../analytics-app/AnalyticsApi';

const ACTIVITY_ICONS = {
  blog_published: <Article sx={{ fontSize: 18 }} />,
  form_submission: <Assignment sx={{ fontSize: 18 }} />,
  user_created: <PersonAdd sx={{ fontSize: 18 }} />,
  event_created: <EventNote sx={{ fontSize: 18 }} />,
};

const ACTIVITY_COLORS = {
  blog_published: '#EB0028',
  form_submission: '#2196F3',
  user_created: '#4CAF50',
  event_created: '#FF9800',
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatCard({ title, value, icon, color, loading }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        transition: 'all 0.3s',
        '&:hover': { boxShadow: 3, transform: 'translateY(-4px)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={28} sx={{ color }} />
          ) : (
            <Typography variant="h3" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
          )}
        </Box>
        <Box sx={{ color, opacity: 0.25 }}>{icon}</Box>
      </Box>
    </Paper>
  );
}

function DashboardPage() {
  const summary = {};
  const recentActivity = [];
  const isLoading = false;

  const statsCards = [
    {
      title: 'Total Speakers',
      value: summary.totalSpeakers ?? '—',
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#EB0028',
    },
    {
      title: 'Total Events',
      value: summary.totalEvents ?? '—',
      icon: <Event sx={{ fontSize: 40 }} />,
      color: '#2196F3',
    },
    {
      title: 'Total Users',
      value: summary.totalUsers ?? '—',
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#4CAF50',
    },
    {
      title: 'Blog Views',
      value: summary.totalBlogViews ?? '—',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#FF9800',
    },
    {
      title: 'Published Blogs',
      value: summary.totalPublishedBlogs ?? '—',
      icon: <Article sx={{ fontSize: 40 }} />,
      color: '#9C27B0',
    },
    {
      title: 'Published Forms',
      value: summary.totalPublishedForms ?? '—',
      icon: <PublishedWithChanges sx={{ fontSize: 40 }} />,
      color: '#00BCD4',
    },
    {
      title: 'Form Submissions',
      value: summary.totalFormSubmissions ?? '—',
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#607D8B',
    },
    {
      title: 'Active Users',
      value: summary.totalActiveUsers ?? '—',
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#8BC34A',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>
        Welcome to TEDx Damascus Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...card} loading={isLoading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, minHeight: 300 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Recent Activity
            </Typography>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                <CircularProgress sx={{ color: '#EB0028' }} />
              </Box>
            ) : recentActivity.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No recent activity.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {recentActivity.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: '#fafafa',
                      border: '1px solid #f0f0f0',
                    }}
                  >
                    <Box
                      sx={{
                        color: ACTIVITY_COLORS[item.type] ?? '#777',
                        mt: '2px',
                        flexShrink: 0,
                      }}
                    >
                      {ACTIVITY_ICONS[item.type] ?? <Assignment sx={{ fontSize: 18 }} />}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ color: '#1a1a1a' }}>
                        {item.description}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(item.timestamp)}
                      </Typography>
                    </Box>
                    <Chip
                      label={item.type.replace(/_/g, ' ')}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: 20,
                        bgcolor: `${ACTIVITY_COLORS[item.type] ?? '#777'}18`,
                        color: ACTIVITY_COLORS[item.type] ?? '#777',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, minHeight: 300 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Submissions by Form
            </Typography>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                <CircularProgress sx={{ color: '#EB0028' }} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* (data?.data?.submissionsByForm ?? []).map((item, i) => ( */}
                {/* {(data?.data?.submissionsByForm ?? []).map((item, i) => ( */}
                {[].map((item, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: '#fafafa',
                      border: '1px solid #f0f0f0',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#444', flex: 1, mr: 1 }} noWrap>
                      {item.formName}
                    </Typography>
                    <Chip
                      label={item.count}
                      size="small"
                      sx={{
                        bgcolor: '#EB002812',
                        color: '#EB0028',
                        fontWeight: 700,
                        minWidth: 32,
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage;
