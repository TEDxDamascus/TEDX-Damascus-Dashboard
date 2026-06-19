import { apiService } from 'app/store/apiService';

export const addTagTypes = ['WallQuestions', 'WallQuestion', 'WallBannedWords'];

const wallApi = apiService.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getWallQuestions: builder.query({
      query: ({ page = 1, limit = 20, status } = {}) => ({
        url: '/wall/questions',
        method: 'GET',
        params: { page, limit, ...(status ? { status } : {}) },
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
            title: q.title,
            status: q.status ?? 'draft',
            answersCount:
              q.answers_count ??
              q.answersCount ??
              (Array.isArray(q.answers) ? q.answers.length : 0),
            createdAt: q.createdAt,
          })),
          total: response?.total ?? response?.data?.total ?? items.length,
        };
      },
      providesTags: ['WallQuestions'],
    }),

    getWallQuestion: builder.query({
      query: (questionId) => ({
        url: `/wall/questions/${questionId}`,
        method: 'GET',
      }),
      providesTags: (result, error, questionId) => [{ type: 'WallQuestion', id: questionId }],
    }),

    createWallQuestion: builder.mutation({
      query: (data) => ({
        url: '/wall/questions',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['WallQuestions'],
    }),

    updateWallQuestion: builder.mutation({
      query: ({ id, data }) => ({
        url: `/wall/questions/${id}`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: (result, error, { id }) => ['WallQuestions', { type: 'WallQuestion', id }],
    }),

    deleteWallQuestion: builder.mutation({
      query: (id) => ({
        url: `/wall/questions/${id}`,
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

    updateWallAnswerStatus: builder.mutation({
      query: ({ questionId, answerId, status }) => ({
        url: `/wall/questions/${questionId}/answers/${answerId}`,
        method: 'PATCH',
        data: { status },
      }),
      invalidatesTags: (r, e, { questionId }) => [{ type: 'WallQuestion', id: questionId }],
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
        url: '/wall/banned-words',
        method: 'GET',
      }),
      providesTags: ['WallBannedWords'],
    }),

    addWallBannedWord: builder.mutation({
      query: ({ word, lang }) => ({
        url: '/wall/banned-words',
        method: 'POST',
        data: { word, lang },
      }),
      invalidatesTags: ['WallBannedWords'],
    }),

    deleteWallBannedWord: builder.mutation({
      query: (id) => ({
        url: `/wall/banned-words/${id}`,
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
  useUpdateWallAnswerStatusMutation,
  useSetWallAnswerFeaturedMutation,
  useDeleteWallAnswerMutation,
  useGetWallBannedWordsQuery,
  useAddWallBannedWordMutation,
  useDeleteWallBannedWordMutation,
} = wallApi;

export default wallApi;
