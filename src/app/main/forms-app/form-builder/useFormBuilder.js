import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import {
  useGetFormQuery,
  useCreateFormMutation,
  useUpdateFormMutation,
  useAddQuestionMutation,
  useUpdateQuestionMutation,
  useRemoveQuestionMutation,
  usePublishFormMutation,
  useUnpublishFormMutation,
} from '../FormsApi';
import { createQuestion } from './questionUtils';

const DEFAULT_SETTINGS = {
  name: { en: '', ar: '' },
  description: { en: '', ar: '' },
  targetRole: 'Speaker',
  starts_at: '',
  ends_at: '',
  expires_at: '',
  max_submissions: '',
};

export function useFormBuilder(formId) {
  const isNew = formId === 'add';
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const didReset = useRef(false);
  const [lastAddedIndex, setLastAddedIndex] = useState(null);

  const {
    data: formResponse,
    isLoading: isFormLoading,
    refetch: refetchForm,
  } = useGetFormQuery(formId, {
    skip: isNew,
  });
  const form = formResponse?.data;

  const settingsForm = useForm({ defaultValues: DEFAULT_SETTINGS });
  const { reset } = settingsForm;

  useEffect(() => {
    if (form && !didReset.current) {
      reset({
        name: form.name ?? { en: '', ar: '' },
        description: form.description ?? { en: '', ar: '' },
        targetRole: form.targetRole ?? 'Speaker',
        starts_at: form.starts_at ? form.starts_at.slice(0, 16) : '',
        ends_at: form.ends_at ? form.ends_at.slice(0, 16) : '',
        expires_at: form.expires_at ? form.expires_at.slice(0, 16) : '',
        max_submissions: form.max_submissions ?? '',
      });
      didReset.current = true;
    }
  }, [form, reset]);

  // Strip empty-string / null config values and ensure every option has orderIndex
  const preparePayload = (question) => {
    const config = Object.fromEntries(
      Object.entries(question.config ?? {}).filter(([, v]) => v !== '' && v != null),
    );
    const options = (question.options ?? []).map((opt, i) => ({
      ...opt,
      orderIndex: opt.orderIndex ?? i,
    }));
    return { ...question, config, options };
  };

  const [createForm, { isLoading: isCreating }] = useCreateFormMutation();
  const [updateForm, { isLoading: isUpdating }] = useUpdateFormMutation();
  const [addQuestionMutation, { isLoading: isAddingQuestion }] = useAddQuestionMutation();
  const [updateQuestionMutation] = useUpdateQuestionMutation();
  const [removeQuestionMutation] = useRemoveQuestionMutation();
  const [publishFormMutation, { isLoading: isPublishing }] = usePublishFormMutation();
  const [unpublishFormMutation, { isLoading: isUnpublishing }] = useUnpublishFormMutation();

  const saveSettings = settingsForm.handleSubmit(async (values) => {
    try {
      if (isNew) {
        const res = await createForm(values).unwrap();
        enqueueSnackbar('Form created', { variant: 'success' });
        navigate(`/forms/${res.data.id}`, { replace: true });
      } else {
        await updateForm({ id: formId, data: values }).unwrap();
        enqueueSnackbar('Settings saved', { variant: 'success' });
      }
    } catch {
      enqueueSnackbar('Failed to save settings', { variant: 'error' });
    }
  });

  const handleAddQuestion = async (type, parentId = null) => {
    const allQuestions = form?.questions ?? [];
    // orderIndex = count of existing siblings under the same parent
    const orderIndex = allQuestions.filter(
      (q) => String(q.parentId ?? null) === String(parentId),
    ).length;
    // lastAddedIndex uses the flat list position so the card auto-expands
    setLastAddedIndex(allQuestions.length);
    try {
      await addQuestionMutation({
        formId,
        data: preparePayload(createQuestion(type, orderIndex, parentId)),
      }).unwrap();
    } catch {
      setLastAddedIndex(null);
      enqueueSnackbar('Failed to add question', { variant: 'error' });
    }
  };

  const handleUpdateQuestion = async (questionId, data) => {
    try {
      await updateQuestionMutation({ formId, questionId, data: preparePayload(data) }).unwrap();
    } catch (err) {
      enqueueSnackbar('Failed to update question', { variant: 'error' });
      throw err; // re-throw so QuestionCard can stay dirty on failure
    }
  };

  const handleRemoveQuestion = async (questionId) => {
    try {
      await removeQuestionMutation({ formId, questionId }).unwrap();
    } catch {
      enqueueSnackbar('Failed to remove question', { variant: 'error' });
    }
  };

  const handlePublish = async () => {
    try {
      await publishFormMutation(formId).unwrap();
      enqueueSnackbar('Form published', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to publish form', { variant: 'error' });
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishFormMutation(formId).unwrap();
      enqueueSnackbar('Form unpublished', { variant: 'info' });
    } catch {
      enqueueSnackbar('Failed to unpublish form', { variant: 'error' });
    }
  };

  const questions = (form?.questions ?? []).map((q) => ({
    ...q,
    id: q.id ?? q._id,
  }));

  return {
    isNew,
    form,
    isFormLoading,
    refetchForm,
    settingsForm,
    saveSettings,
    isSavingSettings: isCreating || isUpdating,
    questions,
    lastAddedIndex,
    isAddingQuestion,
    handleAddQuestion,
    handleUpdateQuestion,
    handleRemoveQuestion,
    handlePublish,
    handleUnpublish,
    isPublishing,
    isUnpublishing,
  };
}
