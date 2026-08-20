import { apiService } from 'app/store/apiService';

export const addTagTypes = ['WallQuestions', 'WallQuestion', 'WallAnswers', 'WallBannedWords'];

const wallApi = apiService.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getWallQuestions: builder.query({
      query: ({ page = 1, limit = 20, status, created_by, author_user_id } = {}) => ({
        url: '/wall-cards/questions',
        method: 'GET',
        params: {
          page,
          limit,
          ...(status ? { status } : {}),
          ...(created_by ? { created_by } : {}),
          ...(author_user_id ? { author_user_id } : {}),
        },
      }),
      transformResponse: (response) => {
        const raw = response?.data ?? response ?? {};
        const items = Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.questions)
            ? raw.questions
            : Array.isArray(raw?.results)
              ? raw.results
              : Array.isArray(raw)
                ? raw
                : [];
        return {
          items: items.map((q) => ({
            id: q._id || q.id,
            text: q.text,
            tags: Array.isArray(q.tags) ? q.tags : [],
            status: q.status ?? 'draft',
            // featured answers are now returned from the Answers API (data.featuredAnswers)
            // Do not rely on question payload for featuredAnswerIds anymore.
            expiresAt: q.expiresAt,
            publishedAt: q.publishedAt,
            archivedAt: q.archivedAt ?? null,
            replacedByQuestionId: q.replacedByQuestionId ?? null,
            createdAt: q.createdAt,
            updatedAt: q.updatedAt,
            created_by: q.created_by,
            createdBy: q.createdBy,
            user_id: q.user_id,
            author_user_id: q.author_user_id,
          })),
          total: raw?.total ?? items.length,
          page: raw?.page ?? 1,
          limit: raw?.limit ?? 10,
          totalPages: raw?.totalPages ?? 1,
          hasNextPage: raw?.hasNextPage ?? false,
          hasPreviousPage: raw?.hasPreviousPage ?? false,
        };
      },
      providesTags: ['WallQuestions'],
    }),

    getWallQuestion: builder.query({
      query: (questionId) => ({
        url: `/wall-cards/questions/${questionId}`,
        method: 'GET',
      }),
      providesTags: (result, error, questionId) => [{ type: 'WallQuestion', id: questionId }],
    }),

    createWallQuestion: builder.mutation({
      query: (data) => ({
        url: '/wall-cards/questions/publish',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['WallQuestions'],
    }),

    updateWallQuestion: builder.mutation({
      query: ({ id, data }) => ({
        url: `/wall-cards/questions/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: (result, error, { id }) => ['WallQuestions', { type: 'WallQuestion', id }],
    }),

    deleteWallQuestion: builder.mutation({
      query: (id) => ({
        url: `/wall-cards/questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WallQuestions'],
    }),

    createWallAnswer: builder.mutation({
      query: ({ questionId, body }) => ({
        url: `/wall/questions/${questionId}/answers`,
        method: 'POST',
        data: { body },
      }),
      invalidatesTags: (r, e, { questionId }) => [
        'WallQuestions',
        { type: 'WallQuestion', id: questionId },
      ],
    }),

    getPendingAnswers: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: '/wall-cards/answers/pending',
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: ['WallAnswers'],
    }),

    getQuestionAnswers: builder.query({
      query: ({ questionId, page = 1, limit = 20 } = {}) => ({
        url: `/wall-cards/questions/${questionId}/answers`,
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: (result, error, { questionId }) => [
        { type: 'WallAnswers', id: questionId },
      ],
    }),

    moderateWallAnswer: builder.mutation({
      query: ({ answerId, action }) => ({
        url: `/wall-cards/answers/${answerId}/moderate`,
        method: 'PATCH',
        data: { action }, // "approve" | "decline"
      }),
      invalidatesTags: ['WallAnswers', 'WallQuestions'],
    }),

    setActiveFeaturedAnswers: builder.mutation({
      query: (answerIds) => ({
        url: '/wall-cards/questions/active/featured-answers',
        method: 'PUT',
        data: { answerIds },
      }),
      invalidatesTags: ['WallQuestions', 'WallAnswers'],
    }),

    setWallAnswerFeatured: builder.mutation({
      query: ({ questionId, answerId }) => ({
        url: `/wall/questions/${questionId}/answers/${answerId}/feature`,
        method: 'POST',
      }),
      invalidatesTags: (r, e, { questionId }) => [{ type: 'WallQuestion', id: questionId }],
    }),

    deleteWallAnswer: builder.mutation({
      query: ({ questionId, answerId }) => ({
        url: `/wall/questions/${questionId}/answers/${answerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (r, e, { questionId }) => [{ type: 'WallQuestion', id: questionId }],
    }),

    getWallBannedWords: builder.query({
      query: () => ({
        url: '/wall-cards/blocked-words',
        method: 'GET',
      }),
      providesTags: ['WallBannedWords'],
    }),

    addWallBannedWord: builder.mutation({
      query: ({ word }) => ({
        url: '/wall-cards/blocked-words',
        method: 'POST',
        data: { word },
      }),
      invalidatesTags: ['WallBannedWords'],
    }),

    deleteWallBannedWord: builder.mutation({
      query: (id) => ({
        url: `/wall-cards/blocked-words/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WallBannedWords'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWallQuestionsQuery,
  useGetWallQuestionQuery,
  useCreateWallQuestionMutation,
  useUpdateWallQuestionMutation,
  useDeleteWallQuestionMutation,
  useCreateWallAnswerMutation,
  useGetPendingAnswersQuery,
  useGetQuestionAnswersQuery,
  useModerateWallAnswerMutation,
  useSetActiveFeaturedAnswersMutation,
  useSetWallAnswerFeaturedMutation,
  useDeleteWallAnswerMutation,
  useGetWallBannedWordsQuery,
  useAddWallBannedWordMutation,
  useDeleteWallBannedWordMutation,
} = wallApi;

export default wallApi;
