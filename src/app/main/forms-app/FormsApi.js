import axiosInstance from '../../services/axiosInstance';
import { apiService } from 'app/store/apiService';

export const addTagTypes = ['Forms', 'Form', 'FormSubmissions', 'FormSubmission'];

const formsApi = apiService.enhanceEndpoints({ addTagTypes }).injectEndpoints({
  endpoints: (builder) => ({
    getForms: builder.query({
      query: ({ created_by, author_user_id } = {}) => ({
        url: '/forms',
        method: 'GET',
        params: {
          ...(created_by ? { created_by } : {}),
          ...(author_user_id ? { author_user_id } : {}),
        },
      }),
      transformResponse: (response) => {
        const items = (response?.data ?? []).map((f) => ({ ...f, id: f._id || f.id }));
        return { data: items };
      },
      providesTags: ['Forms'],
    }),

    getForm: builder.query({
      query: (formId) => ({ url: `/forms/${formId}`, method: 'GET' }),
      transformResponse: (response) => {
        const f = response?.data ?? response;
        const questions = (f.questions ?? []).map((q) => ({ ...q, id: q._id || q.id }));
        return { data: { ...f, id: f._id || f.id, questions } };
      },
      providesTags: ['Form'],
    }),

    createForm: builder.mutation({
      query: (data) => ({ url: '/forms', method: 'POST', data }),
      transformResponse: (response) => {
        const f = response?.data ?? response;
        return { data: { ...f, id: f._id || f.id } };
      },
      invalidatesTags: ['Forms'],
    }),

    updateForm: builder.mutation({
      query: ({ id, data }) => ({ url: `/forms/${id}`, method: 'PATCH', data }),
      transformResponse: (response) => {
        const f = response?.data ?? response;
        return { data: { ...f, id: f._id || f.id } };
      },
      invalidatesTags: ['Forms', 'Form'],
    }),

    deleteForm: builder.mutation({
      query: (id) => ({ url: `/forms/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Forms'],
    }),

    // POST response returns the full updated form — use it to patch the cache directly
    // so questions appear immediately without a separate GET.
    addQuestion: builder.mutation({
      query: ({ formId, data }) => ({
        url: `/forms/${formId}/questions`,
        method: 'POST',
        data,
      }),
      async onQueryStarted({ formId }, { dispatch, queryFulfilled }) {
        try {
          const { data: response } = await queryFulfilled;
          const f = response?.data ?? response;
          if (Array.isArray(f?.questions)) {
            dispatch(
              apiService.util.updateQueryData('getForm', formId, (draft) => {
                draft.data.questions = f.questions.map((q) => ({
                  ...q,
                  id: q._id || q.id,
                }));
              }),
            );
          }
        } catch {
          // mutation error is already handled in useFormBuilder
        }
      },
    }),

    // Optimistic update: patch the question in cache immediately, undo on failure.
    updateQuestion: builder.mutation({
      query: ({ formId, questionId, data }) => ({
        url: `/forms/${formId}/questions/${questionId}`,
        method: 'PATCH',
        data,
      }),
      async onQueryStarted({ formId, questionId, data }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          apiService.util.updateQueryData('getForm', formId, (draft) => {
            const q = (draft.data.questions ?? []).find((q) => q.id === questionId);
            if (q) Object.assign(q, data);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    // Optimistic update: remove from cache immediately, undo on failure.
    removeQuestion: builder.mutation({
      query: ({ formId, questionId }) => ({
        url: `/forms/${formId}/questions/${questionId}`,
        method: 'DELETE',
      }),
      async onQueryStarted({ formId, questionId }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          apiService.util.updateQueryData('getForm', formId, (draft) => {
            if (draft.data.questions) {
              draft.data.questions = draft.data.questions.filter((q) => q.id !== questionId);
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),

    publishForm: builder.mutation({
      query: (formId) => ({ url: `/forms/${formId}/publish`, method: 'POST' }),
      invalidatesTags: ['Forms', 'Form'],
    }),

    unpublishForm: builder.mutation({
      query: (formId) => ({ url: `/forms/${formId}/unpublish`, method: 'POST' }),
      invalidatesTags: ['Forms', 'Form'],
    }),

    getFormSubmission: builder.query({
      query: ({ formId, submissionId }) => ({
        url: `/forms/${formId}/submissions/${submissionId}`,
        method: 'GET',
      }),
      transformResponse: (response) => {
        const schema = response?.data?.schema ?? {};
        const submission = response?.data?.submission ?? {};
        const questions = (schema.questions ?? []).map((q) => ({ ...q, id: q._id || q.id }));
        return {
          data: {
            schema: { ...schema, id: schema._id || schema.id, questions },
            submission: { ...submission, id: submission._id || submission.id },
          },
        };
      },
      providesTags: ['FormSubmission'],
    }),

    exportSubmissionPdf: builder.mutation({
      queryFn: async ({ formId, body }) => {
        try {
          const result = await axiosInstance({
            url: `/forms/${formId}/submissions/export/pdf`,
            method: 'POST',
            data: body,
            responseType: 'blob',
          });
          return { data: result.data };
        } catch (error) {
          return {
            error: {
              status: error.response?.status,
              data: error.response?.data || error.message,
            },
          };
        }
      },
    }),

    getFormSubmissions: builder.query({
      query: ({ formId, page = 1, pageSize = 10 }) => ({
        url: `/forms/${formId}/submissions`,
        method: 'GET',
        params: { page, limit: pageSize },
      }),
      transformResponse: (response) => {
        // Handle both { data: [...] } and { data: { items: [...], total, page, limit } }
        const raw = response?.data;
        const itemsArr = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
        const items = itemsArr.map((s) => ({ ...s, id: s._id || s.id }));
        return {
          data: {
            items,
            total: raw?.total ?? response?.total ?? items.length,
            page: raw?.page ?? response?.page ?? 1,
            pageSize: raw?.limit ?? response?.limit ?? 10,
          },
        };
      },
      providesTags: ['FormSubmissions'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFormsQuery,
  useGetFormQuery,
  useCreateFormMutation,
  useUpdateFormMutation,
  useDeleteFormMutation,
  useAddQuestionMutation,
  useUpdateQuestionMutation,
  useRemoveQuestionMutation,
  usePublishFormMutation,
  useUnpublishFormMutation,
  useGetFormSubmissionsQuery,
  useLazyGetFormSubmissionsQuery,
  useGetFormSubmissionQuery,
  useExportSubmissionPdfMutation,
} = formsApi;

export default formsApi;
