import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Timeline as MuiTimeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { memoryApi, handleApiError } from '../services/api';

export default function Timeline() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    fetchTimelineMemories();
  }, [selectedMonth]);

  const fetchTimelineMemories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await memoryApi.getTimeline({
        startDate: startOfMonth(selectedMonth).toISOString(),
        endDate: endOfMonth(selectedMonth).toISOString(),
      });
      setMemories(response);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const groupMemoriesByDate = (memories) => {
    const groups = {};
    memories.forEach(memory => {
      const date = format(new Date(memory.date), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(memory);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Month Selector */}
        <Card elevation={2}>
          <CardContent>
            <DatePicker
              label="Select Month"
              value={selectedMonth}
              onChange={setSelectedMonth}
              views={['year', 'month']}
              sx={{ width: '100%' }}
            />
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

        {/* Timeline */}
        {!loading && memories.length === 0 ? (
          <Typography variant="h6" textAlign="center" color="text.secondary">
            No memories found for this month
          </Typography>
        ) : (
          <MuiTimeline>
            {groupMemoriesByDate(memories).map(([date, dayMemories]) => (
              <React.Fragment key={date}>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="primary" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="div">
                      {format(new Date(date), 'PPPP')}
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      {dayMemories.map((memory) => (
                        <Card key={memory.id} variant="outlined">
                          <CardContent>
                            <Typography variant="body1" gutterBottom>
                              {memory.text}
                            </Typography>
                            {memory.mediaUrl && (
                              <Box
                                component="img"
                                src={memory.mediaUrl}
                                alt="Memory"
                                sx={{
                                  width: '100%',
                                  maxHeight: 200,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                  mt: 1,
                                }}
                              />
                            )}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="div"
                              sx={{ mt: 1 }}
                            >
                              {format(new Date(memory.date), 'p')}
                            </Typography>
                            {memory.tags && memory.tags.length > 0 && (
                              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {memory.tags.map((tag) => (
                                  <Typography
                                    key={tag.name}
                                    variant="caption"
                                    color="primary"
                                    sx={{ mr: 1 }}
                                  >
                                    #{tag.name}
                                  </Typography>
                                ))}
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </TimelineContent>
                </TimelineItem>
                <Divider sx={{ my: 2 }} />
              </React.Fragment>
            ))}
          </MuiTimeline>
        )}
      </Stack>
    </Box>
  );
} 