const { PrismaClient } = require('@prisma/client');
const questions = require('../data/questions.json');

const db = new PrismaClient();

async function loadQuestions() {
  for (const question of questions) {
    await db.question.create({ data: question });
  }
}

loadQuestions()
  .catch(e => console.error(e))
  .finally(() => db.$disconnect());