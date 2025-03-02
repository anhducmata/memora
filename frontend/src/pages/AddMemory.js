import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Chip,
  IconButton,
  Alert,
  Stack,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Add as AddIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { memoryApi, handleApiError } from '../services/api';

export default function AddMemory() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date());
  const [media, setMedia] = useState(null);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const handleMediaChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setMedia(file);
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAddTag = (event) => {
    if (event.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
      event.preventDefault();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await memoryApi.addMemory({
        text,
        date: date.toISOString(),
        media,
        tags: tags.map(tag => ({ name: tag, type: 'custom' })),
      });
      navigate('/');
    } catch (error) {
      setError(handleApiError(error));
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add New Memory
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="What's on your mind?"
              multiline
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              fullWidth
            />

            <DateTimePicker
              label="When did this happen?"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              sx={{ width: '100%' }}
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                  />
                ))}
              </Box>
              <TextField
                label="Add tags (press Enter)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleAddTag}
                fullWidth
                size="small"
              />
            </Box>

            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="media-upload"
                type="file"
                onChange={handleMediaChange}
              />
              <label htmlFor="media-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                >
                  Add Photo
                </Button>
              </label>
              {preview && (
                <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 200 }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                    }}
                    onClick={() => {
                      setMedia(null);
                      setPreview('');
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              )}
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
            >
              Save Memory
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
} 