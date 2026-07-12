import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  Save,
  CheckCircle,
  Cancel,
  AccessTime,
  LocalOffer,
  CalendarToday,
  Star,
} from '@mui/icons-material';
import Breadcrumb from '../../../shared-components/breadcrumb';
import { LocaleInput, ensureLocaleValue } from '../../../shared-components/locale-input';
import { useSnackbar } from 'notistack';
import {
  useCreateWallQuestionMutation,
  useDeleteWallQuestionMutation,
  useModerateWallAnswerMutation,
  useSetActiveFeaturedAnswersMutation,
  useGetQuestionAnswersQuery,
  useGetWallQuestionQuery,
  useUpdateWallQuestionMutation,
} from '../WallApi';

/* ─── schema ─────────────────────────────────────────────── */
const localeObjectSchema = z.object({ ar: z.string(), en: z.string() });

const wallQuestionSchema = z.object({
  text: localeObjectSchema.refine((v) => v?.en?.trim() || v?.ar?.trim(), 'Question text is required'),
  expiresAt: z.string().min(1, 'Expiry date is required'),
  tags: z.array(z.string()).default([]),
});

/* ─── helpers ────────────────────────────────────────────── */
function mapFromApi(raw) {
  const source = raw?.data ?? raw ?? {};
  const rawText = source.text;
  const textLocale =
    rawText && typeof rawText === 'object'
      ? rawText
      : { en: typeof rawText === 'string' ? rawText : '', ar: '' };
  return {
    text: ensureLocaleValue(textLocale),
    expiresAt: source.expiresAt ? source.expiresAt.slice(0, 10) : '',
    tags: Array.isArray(source.tags) ? source.tags : [],
  };
}

function StatusChip({ status }) {
  const map = {
    active:   { label: 'Active',   color: '#16a34a', bg: '#dcfce7' },
    archived: { label: 'Archived', color: '#9ca3af', bg: '#f3f4f6' },
    expired:  { label: 'Expired',  color: '#dc2626', bg: '#fee2e2' },
  };
  const s = map[status] ?? { label: status, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span
      style={{ background: s.bg, color: s.color }}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
    >
      {s.label}
    </span>
  );
}

const MAX_FEATURED = 4;

/* ─── component ──────────────────────────────────────────── */
export default function WallQuestion() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const isNew = questionId === 'add';
  const questionFromState = location.state?.question ?? null;

  // If the route didn't provide the question object, fetch it so this page works when opened directly
  const { data: fetchedQuestionData } = useGetWallQuestionQuery(questionId, { skip: isNew || !!questionFromState });
  const fetchedQuestion = fetchedQuestionData?.data ?? fetchedQuestionData ?? null;
  const effectiveQuestion = questionFromState ?? fetchedQuestion;
  const isActive = effectiveQuestion?.status === 'active';

  /* mutations */
  const [createQuestion, { isLoading: isCreating }] = useCreateWallQuestionMutation();
  const [updateQuestion, { isLoading: isUpdating }] = useUpdateWallQuestionMutation();
  const [deleteQuestion, { isLoading: isDeleting }] = useDeleteWallQuestionMutation();
  const [moderateAnswer, { isLoading: isModerating }] = useModerateWallAnswerMutation();
  const [setFeaturedAnswers] = useSetActiveFeaturedAnswersMutation();

  /* answers for this question (pending/approved/declined) */
  const [answersPage, setAnswersPage] = useState(1);
  const {
    data: answersData,
    isLoading: answersLoading,
    isFetching: answersFetching,
    refetch: refetchAnswers,
  } = useGetQuestionAnswersQuery(
    { questionId: effectiveQuestion?.id ?? effectiveQuestion?._id ?? (questionId && questionId !== 'add' ? questionId : null), page: answersPage, limit: 50 },
    { skip: isNew || !(effectiveQuestion?.id ?? effectiveQuestion?._id ?? questionId), refetchOnMountOrArgChange: true },
  );

  const allAnswers = answersData?.data?.items ?? answersData?.items ?? answersData ?? [];
  // Normalize API status values to our UI categories
  const normalizeStatus = (s) => {
    const st = (s ?? '').toString().toLowerCase();
    if (!st || st === 'pending') return 'pending';
    if (st === 'public' || st === 'approved' || st === 'accepted') return 'approved';
    if (st === 'declined' || st === 'rejected') return 'declined';
    if (st === 'archived' || st === 'removed') return 'archived';
    return st;
  };

  const pendingAnswers = allAnswers.filter((a) => normalizeStatus(a.status ?? a.state) === 'pending');
  const approvedAnswers = allAnswers.filter((a) => normalizeStatus(a.status ?? a.state) === 'approved');
  const declinedAnswers = allAnswers.filter((a) => normalizeStatus(a.status ?? a.state) === 'declined');
  const answersTotal = allAnswers.length;

  /* featured answer selection — prefer the Answers API featured list, fallback to question's featured ids */
  const getInitialFeatured = () => {
    const fa = answersData?.data?.featuredAnswers ?? answersData?.featuredAnswers;
    if (Array.isArray(fa)) return fa.map((a) => (a?.id ?? a?._id ?? a));
    return effectiveQuestion?.featuredAnswerIds ?? [];
  };

  const [selectedFeatured, setSelectedFeatured] = useState(getInitialFeatured);
  // keep in sync if answersData or effectiveQuestion changes (route state or fetched)
  useEffect(() => {
    const fa = answersData?.data?.featuredAnswers ?? answersData?.featuredAnswers;
    if (Array.isArray(fa)) {
      setSelectedFeatured(fa.map((a) => (a?.id ?? a?._id ?? a)));
    } else {
      setSelectedFeatured(effectiveQuestion?.featuredAnswerIds ?? []);
    }
  }, [answersData, effectiveQuestion]);

  const toggleFeatured = async (id) => {
    let nextList;
    setSelectedFeatured((prev) => {
      if (prev.includes(id)) {
        nextList = prev.filter((x) => x !== id);
      } else if (prev.length >= MAX_FEATURED) {
        enqueueSnackbar(`Maximum ${MAX_FEATURED} featured answers allowed`, { variant: 'warning' });
        nextList = prev;
      } else {
        nextList = [...prev, id];
      }
      return nextList;
    });
    // wait one tick for state to flush
    await new Promise((r) => setTimeout(r, 0));
    try {
      await setFeaturedAnswers(nextList).unwrap();
      enqueueSnackbar('Featured answers saved ✓', { variant: 'success' });
      // ensure the answers list (which now includes featuredAnswers) is up to date
      try { await refetchAnswers(); } catch (e) { /* ignore refetch errors */ }
    } catch {
      enqueueSnackbar('Failed to update featured answers', { variant: 'error' });
    }
  };

  /* tag input */
  const [tagInput, setTagInput] = useState('');

  /* form */
  const {
    control, handleSubmit, reset, watch, setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(wallQuestionSchema),
    defaultValues: { text: ensureLocaleValue(), expiresAt: '', tags: [] },
  });

  const currentTags = watch('tags');

  useEffect(() => {
    if (effectiveQuestion && !isNew) reset(mapFromApi(effectiveQuestion));
  }, [effectiveQuestion, isNew, reset]);

  const handleAddTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !currentTags.includes(t)) setValue('tags', [...currentTags, t]);
    setTagInput('');
  };
  const handleRemoveTag = (tag) => setValue('tags', currentTags.filter((t) => t !== tag));

  const onSubmit = async (form) => {
    const text = {
      en: String(form.text?.en || '').trim(),
      ar: String(form.text?.ar || '').trim(),
    };
    const expiresAt =
      form.expiresAt.length === 10 ? `${form.expiresAt}T23:59:59.000Z` : form.expiresAt;
    try {
      if (isNew) {
        await createQuestion({ text, expiresAt, tags: form.tags }).unwrap();
        enqueueSnackbar('Question published', { variant: 'success' });
      } else {
        await updateQuestion({ id: questionId, data: { text, expiresAt, tags: form.tags } }).unwrap();
        enqueueSnackbar('Question saved', { variant: 'success' });
      }
      navigate('/wall');
    } catch {
      enqueueSnackbar(isNew ? 'Failed to publish' : 'Failed to save', { variant: 'error' });
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

  const handleModerate = async (answer, action) => {
    const answerId = answer.id ?? answer._id;
    try {
      await moderateAnswer({ answerId, action }).unwrap();
      enqueueSnackbar(
        action === 'approve' ? 'Answer approved ✓' : 'Answer declined',
        { variant: action === 'approve' ? 'success' : 'info' },
      );
      // refetch answers for this question so UI shows updated status (approved/declined)
  try { refetchAnswers(); } catch { /* ignore */ }
    } catch {
      enqueueSnackbar('Action failed', { variant: 'error' });
    }
  };

  const saving = isCreating || isUpdating;

  /* ── render ── */
  return (
    <div className="p-6 pt-8 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Wall', href: '/wall' },
          { label: isNew ? 'New question' : 'Question detail' },
        ]}
      />

      {/* title + status */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-tedx-dark">
          {isNew ? 'New Wall Question' : 'Question Detail'}
        </h1>
        {!isNew && questionFromState?.status && (
          <StatusChip status={questionFromState.status} />
        )}
      </div>

      {/* info cards */}
      {!isNew && questionFromState && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <CalendarToday sx={{ fontSize: 18, color: '#9ca3af' }} />
            <div>
              <p className="text-xs text-gray-400">Published</p>
              <p className="text-sm font-medium text-gray-700">
                {questionFromState.publishedAt
                  ? new Date(questionFromState.publishedAt).toLocaleDateString()
                  : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <AccessTime sx={{ fontSize: 18, color: '#9ca3af' }} />
            <div>
              <p className="text-xs text-gray-400">Expires</p>
              <p className="text-sm font-medium text-gray-700">
                {questionFromState.expiresAt
                  ? new Date(questionFromState.expiresAt).toLocaleDateString()
                  : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <LocalOffer sx={{ fontSize: 18, color: '#9ca3af' }} />
            <div>
              <p className="text-xs text-gray-400 mb-1">Tags</p>
              <div className="flex flex-wrap gap-1">
                {questionFromState.tags?.length > 0
                  ? questionFromState.tags.map((t) => (
                      <span key={t} className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        {t}
                      </span>
                    ))
                  : <span className="text-xs text-gray-400 italic">none</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit form ── */}
      <Paper className="mb-6 p-5" elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          {isNew ? 'Question details' : 'Edit question'}
        </h2>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="text"
            control={control}
            render={({ field }) => (
              <LocaleInput {...field} label="Question" type="textFieldMultiple" minRows={2}
                error={!!errors.text} helperText={errors.text?.message} />
            )}
          />

          <Controller
            name="expiresAt"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Expires At" type="date" size="small"
                sx={{ minWidth: 220 }} InputLabelProps={{ shrink: true }}
                error={!!errors.expiresAt} helperText={errors.expiresAt?.message} />
            )}
          />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <TextField size="small" label="Add tag" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                sx={{ minWidth: 180 }} />
              <Button variant="outlined" size="small" onClick={handleAddTag} disabled={!tagInput.trim()}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {currentTags.map((tag) => (
                <Chip key={tag} label={tag} size="small" onDelete={() => handleRemoveTag(tag)}
                  sx={{ bgcolor: '#fde8e8', color: '#b91c1c' }} />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" variant="contained" startIcon={<Save />} disabled={saving}
              sx={{ bgcolor: 'var(--color-primary)', '&:hover': { bgcolor: 'var(--color-primary-dark)' } }}>
              {saving ? 'Saving…' : isNew ? 'Publish' : 'Save changes'}
            </Button>
            {!isNew && (
              <Button color="error" variant="outlined" disabled={isDeleting} onClick={handleDeleteQuestion}>
                Delete question
              </Button>
            )}
            <Button component={Link} to="/wall" variant="text">Back to list</Button>
          </div>
        </Box>
      </Paper>

  {/* ── Featured Answers (active question only) ── */}
      {!isNew && isActive && (
        <Paper className="mb-6 p-5" elevation={0}
          sx={{ border: '2px solid', borderColor: '#fbbf24', borderRadius: 3, bgcolor: '#fffbeb' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star sx={{ color: '#f59e0b' }} />
              <h2 className="text-base font-semibold text-amber-800">
                Featured Answers
              </h2>
              <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                {selectedFeatured.length} / {MAX_FEATURED} selected
              </span>
            </div>
          </div>

          <p className="text-xs text-amber-700 mb-4">
            Select up to <strong>{MAX_FEATURED}</strong> <strong>approved</strong> answers to feature on the wall.
            Only approved answers can be featured. You cannot add more than {MAX_FEATURED} featured answers.
          </p>

          {/* Current featured IDs */}
          {selectedFeatured.length > 0 ? (
            <div className="space-y-3">
              {selectedFeatured.map((id) => {
                const answer = allAnswers.find((a) => (a.id ?? a._id) === id);
                if (!answer) {
                  return (
                    <Chip key={id} label={id} size="small" icon={<Star style={{ fontSize: 14, color: '#f59e0b' }} />} onDelete={() => toggleFeatured(id)} sx={{ bgcolor: '#fef3c7' }} />
                  );
                }
                const aid = answer.id ?? answer._id;
                return (
                  <Paper key={aid} elevation={0}
                    sx={{ border: '1px solid', borderColor: '#fbbf24', borderRadius: 3, bgcolor: '#fffbeb' }}
                    className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {(answer.authorName || answer.submittedBy) && (
                          <p className="text-xs text-gray-400 mb-1">{answer.authorName ?? answer.submittedBy}</p>
                        )}
                        <p className="text-sm text-amber-800 whitespace-pre-wrap leading-relaxed">{answer.text ?? answer.body ?? answer.content ?? '(no content)'}</p>
                        {answer.createdAt && <p className="mt-1 text-xs text-gray-400">{new Date(answer.createdAt).toLocaleString()}</p>}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Tooltip title="Remove from featured">
                          <span>
                            <button onClick={() => toggleFeatured(aid)} className="rounded-full p-2 text-amber-500 bg-amber-100 hover:bg-amber-200">
                              <Star style={{ fontSize: 22 }} />
                            </button>
                          </span>
                        </Tooltip>
                      </div>
                    </div>
                  </Paper>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-amber-600 italic">No featured answers selected.</p>
          )}
        </Paper>
      )}

      {/* ── Answers (Pending / Approved / Declined) ── */}
      {!isNew && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-tedx-dark">
              Answers
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                Pending: {pendingAnswers.length}
              </span>
              <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                Approved: {approvedAnswers.length}
              </span>
              {/* Declined count hidden by request */}
            </h2>
            {answersFetching && <CircularProgress size={18} />}
          </div>

          {answersLoading ? (
            <div className="flex justify-center py-12"><CircularProgress /></div>
          ) : answersTotal === 0 ? (
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
              className="flex flex-col items-center justify-center py-12 text-gray-400">
              <CheckCircle sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
              <p className="text-sm">No answers yet.</p>
            </Paper>
          ) : (
            <div className="space-y-3">
              {/* Pending */}
              {pendingAnswers.map((answer) => {
                const id = answer.id ?? answer._id;
                return (
                  <Paper key={id} elevation={0}
                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'white' }}
                    className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {(answer.authorName || answer.submittedBy) && (
                          <p className="text-xs text-gray-400 mb-1">
                            {answer.authorName ?? answer.submittedBy}
                          </p>
                        )}
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {answer.text ?? answer.body ?? answer.content ?? '(no content)'}
                        </p>
                        {answer.createdAt && (
                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(answer.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Approve / Decline */}
                        <Tooltip title="Approve">
                          <span>
                            <Button size="small" variant="contained" color="success"
                              startIcon={<CheckCircle sx={{ fontSize: 16 }} />}
                              disabled={isModerating}
                              onClick={() => handleModerate(answer, 'approve')}
                              sx={{ minWidth: 100, textTransform: 'none' }}>
                              Approve
                            </Button>
                          </span>
                        </Tooltip>
                        <Tooltip title="Decline">
                          <span>
                            <Button size="small" variant="outlined" color="error"
                              startIcon={<Cancel sx={{ fontSize: 16 }} />}
                              disabled={isModerating}
                              onClick={() => handleModerate(answer, 'decline')}
                              sx={{ minWidth: 100, textTransform: 'none' }}>
                              Decline
                            </Button>
                          </span>
                        </Tooltip>
                      </div>
                    </div>
                  </Paper>
                );
              })}

              {/* Approved */}
              {approvedAnswers.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Approved</h3>
                  <div className="space-y-2">
                    {approvedAnswers.map((answer) => {
                      const id = answer.id ?? answer._id;
                      const isFeatured = selectedFeatured.includes(id);
                      return (
                        <Paper key={id} elevation={0}
                          sx={{
                            border: '1px solid',
                            borderColor: isFeatured ? '#fbbf24' : '#bbf7d0',
                            borderRadius: 3,
                            bgcolor: isFeatured ? '#fffbeb' : '#f0fdf4',
                          }}
                          className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {(answer.authorName || answer.submittedBy) && (
                                <p className="text-xs text-gray-400 mb-1">
                                  {answer.authorName ?? answer.submittedBy}
                                </p>
                              )}
                              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                {answer.text ?? answer.body ?? answer.content ?? '(no content)'}
                              </p>
                              {answer.createdAt && (
                                <p className="mt-1 text-xs text-gray-400">
                                  {new Date(answer.createdAt).toLocaleString()}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Star toggle for featuring */}
                              {isActive && (
                                <Tooltip title={isFeatured ? 'Remove from featured' : selectedFeatured.length >= MAX_FEATURED ? `Max ${MAX_FEATURED} reached` : 'Add to featured'}>
                                  <span>
                                    <button
                                      onClick={() => toggleFeatured(id)}
                                      disabled={!isFeatured && selectedFeatured.length >= MAX_FEATURED}
                                      className={[
                                        'rounded-full p-2 transition-colors',
                                        isFeatured
                                          ? 'text-amber-500 bg-amber-100 hover:bg-amber-200'
                                          : 'text-gray-400 bg-white hover:bg-amber-50 hover:text-amber-400',
                                        !isFeatured && selectedFeatured.length >= MAX_FEATURED
                                          ? 'opacity-40 cursor-not-allowed'
                                          : 'cursor-pointer',
                                      ].join(' ')}
                                    >
                                      <Star style={{ fontSize: 22 }} />
                                    </button>
                                  </span>
                                </Tooltip>
                              )}
                              {/* Approved badge */}
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                <CheckCircle style={{ fontSize: 12 }} /> Approved
                              </span>
                            </div>
                          </div>
                        </Paper>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Declined */}
              {declinedAnswers.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Declined</h3>
                  <div className="space-y-2">
                    {declinedAnswers.map((answer) => {
                      const id = answer.id ?? answer._id;
                      return (
                        <Paper key={id} elevation={0}
                          sx={{ border: '1px solid', borderColor: '#fee2e2', borderRadius: 3, bgcolor: '#fff7f7' }}
                          className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {(answer.authorName || answer.submittedBy) && (
                                <p className="text-xs text-gray-400 mb-1">
                                  {answer.authorName ?? answer.submittedBy}
                                </p>
                              )}
                              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                {answer.text ?? answer.body ?? answer.content ?? '(no content)'}
                              </p>
                              {answer.createdAt && (
                                <p className="mt-1 text-xs text-gray-400">
                                  {new Date(answer.createdAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                                <Cancel style={{ fontSize: 12 }} /> Declined
                              </span>
                            </div>
                          </div>
                        </Paper>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* simple paging controls (if API supports paging) */}
              {answersTotal > 50 && (
                <>
                  <Divider />
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <Button size="small" variant="outlined" disabled={answersPage <= 1}
                      onClick={() => setAnswersPage((p) => p - 1)}>Previous</Button>
                    <span className="text-sm text-gray-500">
                      Page {answersPage}
                    </span>
                    <Button size="small" variant="outlined"
                      onClick={() => setAnswersPage((p) => p + 1)}>Next</Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Approved answers are shown in the main Answers section above (no local-only list) */}
    </div>
  );
}

/* ─── helper sub-component ───────────────────────────────── */
function AddAnswerIdInput({ onAdd, disabled, alreadySelected }) {
  const [val, setVal] = useState('');
  const trimmed = val.trim();
  const alreadyIn = alreadySelected.includes(trimmed);

  const handleAdd = () => {
    if (trimmed && !alreadyIn) {
      onAdd(trimmed);
      setVal('');
    }
  };

  return (
    <div className="mt-4 flex items-center gap-2">
      <TextField
        size="small"
        label="Add answer ID"
        placeholder="Paste answer ID…"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
        disabled={disabled}
        error={alreadyIn}
        helperText={alreadyIn ? 'Already in selection' : ''}
        sx={{ minWidth: 280, fontFamily: 'monospace' }}
        inputProps={{ style: { fontFamily: 'monospace', fontSize: 12 } }}
      />
      <Button variant="outlined" size="small" onClick={handleAdd}
        disabled={disabled || !trimmed || alreadyIn}
        sx={{ borderColor: '#f59e0b', color: '#d97706', '&:hover': { borderColor: '#d97706', bgcolor: '#fffbeb' } }}>
        Add
      </Button>
    </div>
  );
}
