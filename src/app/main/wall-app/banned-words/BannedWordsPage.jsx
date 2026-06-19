import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Paper,
  Typography,
} from '@mui/material';
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
  const { data, isLoading } = useGetWallBannedWordsQuery();
  const [addWord, { isLoading: isAdding }] = useAddWallBannedWordMutation();
  const [deleteWord, { isLoading: isDeleting }] = useDeleteWallBannedWordMutation();
  const [word, setWord] = useState('');
  const [lang, setLang] = useState('all');

  const items = extractItems(data);

  const handleAdd = async (e) => {
    e.preventDefault();
    const w = word.trim();
    if (!w) return;
    await addWord({ word: w, lang });
    setWord('');
  };

  const handleDelete = async (id) => {
    if (!id || !window.confirm('Remove this banned word?')) return;
    await deleteWord(id);
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
          Add a word to filter (Arabic / English / both). Backend will enforce rules later.
        </Typography>
        <Box component="form" onSubmit={handleAdd} className="flex flex-wrap items-end gap-2">
          <TextField
            size="small"
            label="Word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            sx={{ minWidth: 220 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Language</InputLabel>
            <Select value={lang} label="Language" onChange={(e) => setLang(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ar">Arabic</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" disabled={isAdding || !word.trim()}>
            Add
          </Button>
        </Box>
      </Paper>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <CircularProgress size={24} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-gray-600">No banned words yet.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((row) => (
              <Chip
                key={row.id}
                label={`${row.word} (${row.lang})`}
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
