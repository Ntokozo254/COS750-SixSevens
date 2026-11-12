# API Documentation

## GET /api/quiz/questions

Fetches quiz questions for a specific module.

### Parameters
- `module` (required): The module to fetch questions for. Should be one of "basics", "insert", "search", "update", or "delete".

### Response
An array of question objects, each containing:
- `id`: The unique identifier for the question
- `text`: The question text
- `options`: An array of possible answer options
- `explanation`: An explanation of the correct answer

### Authentication
None required.

## POST /api/quiz/answer

Submits a student's answer to a quiz question and returns feedback.

### Request Body
- `studentId` (required): The ID of the student submitting the answer
- `questionId` (required): The ID of the question being answered
- `selectedOption` (required): The option the student selected

### Response
An object containing:
- `isCorrect`: A boolean indicating whether the selected option was correct
- `misconception`: If the answer was incorrect and corresponds to a known misconception, this field will contain the misconception text. Otherwise, it will be null.

### Authentication
None required.

## POST /api/students/:id/progress

Updates a student's progress in a specific module.

### Parameters
- `id` (required): The ID of the student whose progress is being updated

### Request Body
- `module` (required): The name of the module the progress is for
- `completed` (required): A boolean indicating whether the student has completed the module

### Response
The updated or newly created progress record.

### Authentication
None required.