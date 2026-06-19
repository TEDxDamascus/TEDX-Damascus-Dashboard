import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import Breadcrumb from '../../../shared-components/breadcrumb';
import { LocaleInput, ensureLocaleValue } from '../../../shared-components/locale-input';
import { useSnackbar } from 'notistack';
import {
  useCreateWallAnswerMutation,
  useCreateWallQuestionMutation,
  useDeleteWallAnswerMutation,
  useDeleteWallQuestionMutation,
  useGetWallQuestionQuery,
  useSetWallAnswerFeaturedMutation,
  useUpdateWallAnswerStatusMutation,
  useUpdateWallQuestionMutation,
} from '../WallApi';

const localeObjectSchema = z.object({ ar: z.string(), en: z.string() });

const wallQuestionSchema = z.object({
  title: localeObjectSchema.refine((v) => v?.en?.trim() || v?.ar?.trim(), 'Title is required'),
  status: z.enum(['draft', 'published']),
});

function mapFromApi(raw) {
  const source = raw?.data ?? raw ?? {};
  const answers = Array.isArray(source.answers) ? source.answers : [];
  return {
    title: ensureLocaleValue(source.title),
    status: source.status === 'published' ? 'published' : 'draft',
    answers,
  };
}

function WallQuestion() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isNew = questionId === 'add';
  const { data: questionPayload, isLoading } = useGetWallQuestionQuery(questionId, { skip: isNew });
  const [createQuestion, { isLoading: isCreating }] = useCreateWallQuestionMutation();
  const [updateQuestion, { isLoading: isUpdating }] = useUpdateWallQuestionMutation();
  const [deleteQuestion, { isLoading: isDeleting }] = useDeleteWallQuestionMutation();
  const [createAnswer, { isLoading: isAddingAnswer }] = useCreateWallAnswerMutation();
  const [updateAnswerStatus] = useUpdateWallAnswerStatusMutation();
  const [setFeatured] = useSetWallAnswerFeaturedMutation();
  const [deleteAnswer] = useDeleteWallAnswerMutation();

  const [testAnswerBody, setTestAnswerBody] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(wallQuestionSchema),
    defaultValues: {
      title: ensureLocaleValue(),
      status: 'draft',
    },
  });

  useEffect(() => {
    if (questionPayload && !isNew) {
      reset(mapFromApi(questionPayload));
    }
  }, [questionPayload, isNew, reset]);

  const answers = !isNew && questionPayload?.data ? mapFromApi(questionPayload).answers : [];

  const onSubmit = async (form) => {
    const title = {
      en: String(form.title?.en || '').trim(),
      ar: String(form.title?.ar || '').trim(),
    };
    try {
      if (isNew) {
        await createQuestion({ title, status: form.status }).unwrap();
        enqueueSnackbar('Question created', { variant: 'success' });
      } else {
        await updateQuestion({ id: questionId, data: { title, status: form.status } }).unwrap();
        enqueueSnackbar('Question saved', { variant: 'success' });
      }
      navigate('/wall');
    } catch {
      enqueueSnackbar(isNew ? 'Failed to create' : 'Failed to save', { variant: 'error' });
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm('Delete this question and all answers?')) return;
    try {
      await deleteQuestion(questionId).unwrap();
      enqueueSnackbar('Deleted', { variant: 'success' });
      navigate('/wall');
    } catch {
      enqueueSnackbar('Failed to delete', { variant: 'error' });
    }
  };

  const handleAddTestAnswer = async () => {
    const body = testAnswerBody.trim();
    if (!body) return;
    try {
      await createAnswer({ questionId, body }).unwrap();
      setTestAnswerBody('');
      enqueueSnackbar('Answer added (pending)', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to add answer', { variant: 'error' });
    }
  };

  const handleApprove = async (answerId) => {
    try {
      await updateAnswerStatus({ questionId, answerId, status: 'approved' }).unwrap();
    } catch {
      enqueueSnackbar('Failed to update', { variant: 'error' });
    }
  };

  const handleReject = async (answerId) => {
    try {
      await updateAnswerStatus({ questionId, answerId, status: 'rejected' }).unwrap();
    } catch {
      enqueueSnackbar('Failed to update', { variant: 'error' });
    }
  };

  const handleFeature = async (answerId) => {
    try {
      await setFeatured({ questionId, answerId }).unwrap();
      enqueueSnackbar('Featured answer updated', { variant: 'success' });
    } catch {
      enqueueSnackbar('Only approved answers can be featured', { variant: 'error' });
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Delete this answer?')) return;
    try {
      await deleteAnswer({ questionId, answerId }).unwrap();
    } catch {
      enqueueSnackbar('Failed to delete', { variant: 'error' });
    }
  };

  if (!isNew && isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircularProgress className="text-tedx-red" />
      </div>
    );
  }

  const saving = isCreating || isUpdating;

  return (
    <div className="p-6 pt-8">
      <Breadcrumb
        items={[
          { label: 'Wall', href: '/wall' },
          { label: isNew ? 'New question' : 'Edit question' },
        ]}
      />

      <h1 className="mb-6 text-3xl font-bold text-tedx-dark">
        {isNew ? 'New Wall Question' : 'Edit Wall Question'}
      </h1>

      <Paper
        className="mb-6 p-4"
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider' }}
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <LocaleInput
                {...field}
                label="Question"
                type="textFieldMultiple"
                minRows={2}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select {...field} label="Status">
                  <MenuItem value="draft">Draft (hidden on site)</MenuItem>
                  <MenuItem value="published">Published (visible on site)</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            {!isNew && (
              <Button
                color="error"
                variant="outlined"
                disabled={isDeleting}
                onClick={handleDeleteQuestion}
              >
                Delete question
              </Button>
            )}
            <Button component={Link} to="/wall" variant="text">
              Back to list
            </Button>
          </div>
        </Box>
      </Paper>

      {!isNew && (
        <>
          <h2 className="mb-3 text-lg font-semibold text-tedx-dark">Answers (moderation)</h2>
          <Paper
            className="mb-4 p-4"
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            <p className="mb-2 text-sm text-gray-600">
              Simulate a visitor submission (mock — goes to <strong>pending</strong>).
            </p>
            <div className="flex flex-wrap gap-2">
              <TextField
                size="small"
                fullWidth
                sx={{ maxWidth: 480 }}
                placeholder="Test answer text…"
                value={testAnswerBody}
                onChange={(e) => setTestAnswerBody(e.target.value)}
                multiline
                minRows={2}
              />
              <Button
                variant="outlined"
                onClick={handleAddTestAnswer}
                disabled={isAddingAnswer || !testAnswerBody.trim()}
              >
                Add test answer
              </Button>
            </div>
          </Paper>

          <div className="space-y-3">
            {answers.length === 0 ? (
              <div className="text-gray-600">No answers yet.</div>
            ) : (
              answers.map((a) => (
                <Paper
                  key={a.id}
                  className="p-4"
                  elevation={0}
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Chip
                      size="small"
                      label={a.status}
                      sx={{
                        textTransform: 'capitalize',
                        bgcolor:
                          a.status === 'approved'
                            ? '#4CAF5018'
                            : a.status === 'rejected'
                              ? '#f4433618'
                              : '#ff980018',
                      }}
                    />
                    {a.isFeatured && (
                      <Chip size="small" color="primary" label="Featured" variant="outlined" />
                    )}
                  </div>
                  <p className="mb-3 whitespace-pre-wrap text-sm text-gray-700">{a.body}</p>
                  <div className="flex flex-wrap gap-2">
                    {a.status === 'pending' && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleApprove(a.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => handleReject(a.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {a.status === 'approved' && (
                      <Button size="small" variant="outlined" onClick={() => handleFeature(a.id)}>
                        Set as featured
                      </Button>
                    )}
                    <Button
                      size="small"
                      color="error"
                      variant="text"
                      onClick={() => handleDeleteAnswer(a.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Paper>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default WallQuestion;
