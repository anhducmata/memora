import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
} from '@mui/material';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { memoryApi, handleApiError } from '../services/api';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const memory = payload[0].payload;
    return (
      <Card sx={{ maxWidth: 300, p: 1 }}>
        <Typography variant="body2" gutterBottom>
          {memory.text}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {format(new Date(memory.date), 'PPpp')}
        </Typography>
        {memory.tags && memory.tags.length > 0 && (
          <Box sx={{ mt: 1 }}>
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
      </Card>
    );
  }
  return null;
};

const MOOD_CLUSTERS = [
  { x: 0.2, y: 0.8, label: 'Joy' },
  { x: 0.8, y: 0.8, label: 'Excitement' },
  { x: 0.2, y: 0.2, label: 'Calm' },
  { x: 0.8, y: 0.2, label: 'Nostalgia' },
];

export default function MoodMap() {
  const theme = useTheme();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    fetchMoodMap();
  }, []);

  const fetchMoodMap = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await memoryApi.getMoodMap();
      setMemories(response);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const normalizeData = (data) => {
    return data.map(memory => ({
      ...memory,
      x: memory.position.x,
      y: memory.position.y,
      z: 1,
    }));
  };

  return (
    <Box>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Memory Mood Map
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Explore your memories clustered by emotional similarity
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box ref={containerRef} sx={{ width: '100%', height: 600 }}>
              <ResponsiveContainer>
                <ScatterChart
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                  }}
                >
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="x"
                    domain={[0, 1]}
                    hide
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="y"
                    domain={[0, 1]}
                    hide
                  />
                  <ZAxis
                    type="number"
                    dataKey="z"
                    range={[50, 400]}
                  />
                  <RechartsTooltip
                    content={<CustomTooltip />}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Scatter
                    name="Memories"
                    data={normalizeData(memories)}
                    fill={theme.palette.primary.main}
                  />
                  {/* Render mood cluster labels */}
                  {MOOD_CLUSTERS.map((cluster, index) => (
                    <Scatter
                      key={index}
                      name={cluster.label}
                      data={[{ x: cluster.x, y: cluster.y, z: 1 }]}
                      fill="transparent"
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
              {/* Render mood labels */}
              {MOOD_CLUSTERS.map((cluster, index) => (
                <Tooltip key={index} title={cluster.label}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      position: 'absolute',
                      left: `${cluster.x * 100}%`,
                      top: `${(1 - cluster.y) * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                    }}
                  >
                    {cluster.label}
                  </Typography>
                </Tooltip>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
} 