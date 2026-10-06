import express from 'express';
import { getRoutineRecommendation } from '../controllers/routineController.js';

const router = express.Router();

// Generate customized AM/PM regimen from quiz responses
router.post('/recommend', getRoutineRecommendation);

export default router;