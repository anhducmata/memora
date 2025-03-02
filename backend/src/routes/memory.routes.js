import express from 'express';
import multer from 'multer';
import { MemoryService } from '../services/memory.service.js';
import { AppError } from '../middleware/error.middleware.js';

const router = express.Router();
const memoryService = new MemoryService();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Add a new memory
router.post('/', upload.single('media'), async (req, res, next) => {
  try {
    const { text, date, tags } = req.body;
    const userId = req.user.uid;

    if (!text) {
      throw new AppError('Text is required', 400);
    }

    const memory = await memoryService.addMemory(userId, {
      text,
      date: date || new Date().toISOString(),
      media: req.file,
      tags: JSON.parse(tags || '[]'),
    });

    res.status(201).json(memory);
  } catch (error) {
    next(error);
  }
});

// Search memories
router.get('/search', async (req, res, next) => {
  try {
    const {
      query,
      type = 'hybrid',
      tags,
      startDate,
      endDate,
    } = req.query;

    const userId = req.user.uid;
    const memories = await memoryService.searchMemories(userId, {
      query,
      type,
      tags: tags ? JSON.parse(tags) : [],
      startDate,
      endDate,
    });

    res.json(memories);
  } catch (error) {
    next(error);
  }
});

// Get timeline
router.get('/timeline', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.uid;

    if (!startDate || !endDate) {
      throw new AppError('Start date and end date are required', 400);
    }

    const timeline = await memoryService.getTimeline(userId, {
      startDate,
      endDate,
    });

    res.json(timeline);
  } catch (error) {
    next(error);
  }
});

// Get mood map
router.get('/moodmap', async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const moodMap = await memoryService.getMoodMap(userId);
    res.json(moodMap);
  } catch (error) {
    next(error);
  }
});

export { router as memoryRoutes }; 