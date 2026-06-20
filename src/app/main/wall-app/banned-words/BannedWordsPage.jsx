import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Paper,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import Breadcrumb from '../../../shared-components/breadcrumb';
import {
  useAddWallBannedWordMutation,
  useDeleteWallBannedWordMutation,
  useGetWallBannedWordsQuery,
} from '../WallApi';

function extractItems(raw) {
  const candidates = [raw?.data?.items, raw?.data, raw?.items];
  const match = candidates.find((c) => Array.isArray(c));
  return match ?? [];
}

function BannedWordsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { data, isLoading, isError } = useGetWallBannedWordsQuery();
  const [addWord, { isLoading: isAdding }] = useAddWallBannedWordMutation();
  const [deleteWord, { isLoading: isDeleting }] = useDeleteWallBannedWordMutation();
  const [word, setWord] = useState('');

  const items = extractItems(data);

  const handleAdd = async (e) => {
    e.preventDefault();
    const w = word.trim();
    if (!w) return;
    try {
      await addWord({ word: w }).unwrap();
      setWord('');
      enqueueSnackbar('Banned word added', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error?.data?.message || 'Failed to add banned word', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!id || !window.confirm('Remove this banned word?')) return;
    try {
      await deleteWord(id).unwrap();
      enqueueSnackbar('Banned word removed', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error?.data?.message || 'Failed to remove banned word', { variant: 'error' });
    }
  };

  return (
    <div className="p-6 pt-8">
      <Breadcrumb items={[{ label: 'Wall', href: '/wall' }, { label: 'Banned words' }]} />

      <Typography variant="h4" className="mb-6 font-bold text-tedx-dark">
        Banned words
      </Typography>

      <Paper
        className="mb-6 p-4"
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider' }}
      >
        <Typography variant="subtitle2" className="mb-3 text-gray-600">
          Add a word to filter from wall submissions.
        </Typography>
        <Box component="form" onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
          <TextField
            size="small"
            label="Word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            sx={{ minWidth: 220 }}
          />
          <Button type="submit" variant="contained" disabled={isAdding || !word.trim()}>
            {isAdding ? 'Adding…' : 'Add'}
          </Button>
        </Box>
      </Paper>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <CircularProgress size={24} />
          </div>
        ) : isError ? (
          <Alert severity="error">Failed to load banned words.</Alert>
        ) : items.length === 0 ? (
          <div className="text-gray-600">No banned words yet.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((row) => (
              <Chip
                key={row.id}
                label={row.word}
                onDelete={() => handleDelete(row.id)}
                disabled={isDeleting}
                variant="outlined"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BannedWordsPage;
