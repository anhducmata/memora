import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { memoryApi, handleApiError } from '../services/api';

export default function Home() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('hybrid');
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    fetchMemories();
  }, [searchQuery, searchType, selectedTags]);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await memoryApi.searchMemories({
        query: searchQuery,
        type: searchType,
        tags: selectedTags,
      });
      setMemories(response);
      
      // Extract unique tags from memories
      const tags = new Set();
      response.forEach(memory => {
        memory.tags?.forEach(tag => tags.add(tag.name));
      });
      setAllTags(Array.from(tags));
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Search and Filters */}
        <Card elevation={2}>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Search memories"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Search Type</InputLabel>
                  <Select
                    value={searchType}
                    label="Search Type"
                    onChange={(e) => setSearchType(e.target.value)}
                  >
                    <MenuItem value="hybrid">Hybrid Search</MenuItem>
                    <MenuItem value="vector">Feeling Search</MenuItem>
                    <MenuItem value="graph">Connection Search</MenuItem>
                  </Select>
                </FormControl>
                <FormControl sx={{ flexGrow: 1 }}>
                  <InputLabel>Filter by Tags</InputLabel>
                  <Select
                    multiple
                    value={selectedTags}
                    label="Filter by Tags"
                    onChange={(e) => setSelectedTags(e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {allTags.map((tag) => (
                      <MenuItem key={tag} value={tag}>
                        {tag}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Memories Grid */}
        {!loading && memories.length === 0 ? (
          <Typography variant="h6" textAlign="center" color="text.secondary">
            No memories found
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {memories.map((memory) => (
              <Grid item xs={12} sm={6} md={4} key={memory.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {memory.mediaUrl && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={memory.mediaUrl}
                      alt="Memory"
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" gutterBottom>
                      {memory.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="div"
                      gutterBottom
                    >
                      {format(new Date(memory.date), 'PPpp')}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {memory.tags?.map((tag) => (
                        <Chip
                          key={`${memory.id}-${tag.name}`}
                          label={tag.name}
                          size="small"
                          onClick={() => {
                            if (!selectedTags.includes(tag.name)) {
                              setSelectedTags([...selectedTags, tag.name]);
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Box>
  );
} 