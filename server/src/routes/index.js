const express = require('express');
const router = express.Router();

const quizRouter = require('./routes/quiz');
const studentsRouter = require('./students');

router.use('/api/quiz', quizRouter);
router.use('/api/students', studentsRouter);

module.exports = router;