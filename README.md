# Deliberate Feedback Service

AI-powered feedback service for algorithm practice sessions.

## Features

- **Pattern Accuracy**: Validates if the chosen algorithm pattern matches the problem
- **Complexity Analysis**: Checks time/space complexity correctness and optimality
- **Brainstorming Direction**: Evaluates if solution approach is on track
- **Overall Assessment**: Provides comprehensive scoring and feedback

## Setup

1. **Install Dependencies**:
   ```bash
   npm install openai @types/react @types/react-dom
   ```

2. **Environment Variables**:
   Create `.env.local` with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Usage**:
   ```typescript
   import { FeedbackEngine } from '@/services/deliberate-feedback';
   
   const engine = new FeedbackEngine();
   const feedback = await engine.evaluateExploreSolutions(problem, patterns);
   ```

## API Endpoints

- `POST /api/feedback/explore` - Evaluate explore phase solutions
- `POST /api/feedback/planning` - Evaluate planning phase (planned)
- `POST /api/feedback/implementation` - Evaluate implementation (planned)

## Cost Estimation

- **OpenAI GPT-5**: ~$0.05 per feedback check (estimated)
- **Monthly estimate**: $75-300 depending on usage
- **Optimization**: Caching and batching can reduce costs

## Next Steps

1. Add planning phase feedback
2. Add implementation phase feedback
3. Implement response caching
4. Add error handling and fallbacks
5. Create feedback analytics dashboard