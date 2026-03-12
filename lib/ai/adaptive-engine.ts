import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const evaluationSchema = z.object({
    score: z.number().describe("Percentage score for the performance (0-100)"),
    confidence: z.number().describe("AI's confidence in the user's understanding (0-100)"),
    recommendedDifficulty: z.enum(["Easy", "Medium", "Hard"]),
    reasoning: z.string().describe("Explanation for why the difficulty was changed or kept"),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
});

export type PerformanceMetric = {
    timeTakenSeconds: number;
    attempts: number;
    isPassed: boolean;
    codeComplexity: string;
    userDifficultyRating?: number; // 1-5
};

export async function evaluatePerformance(
    currentQuestion: any,
    metrics: PerformanceMetric,
    history: any[] = []
) {
    const prompt = `
    Evaluate the user's performance on the following DSA/System Design question:
    Question: ${JSON.stringify(currentQuestion)}
    
    Performance Metrics:
    - Time Taken: ${metrics.timeTakenSeconds}s
    - Attempts: ${metrics.attempts}
    - Passed: ${metrics.isPassed}
    - Code Complexity: ${metrics.codeComplexity}
    
    Previous Performance History:
    ${JSON.stringify(history)}
    
    Based on this, determine if the user should move to a higher difficulty, lower difficulty, or stay at the same level.
    Consider speed, accuracy, and the complexity of their solution.
  `;

    try {
        const { object: evaluation } = await generateObject({
            model: google('gemini-1.5-pro'),
            schema: evaluationSchema,
            prompt: prompt,
        });

        return evaluation;
    } catch (error) {
        console.error("Error evaluating performance:", error);
        // Fallback logic
        let nextDifficulty = currentQuestion.difficulty;
        if (metrics.isPassed && metrics.timeTakenSeconds < 600) {
            if (currentQuestion.difficulty === "Easy") nextDifficulty = "Medium";
            else if (currentQuestion.difficulty === "Medium") nextDifficulty = "Hard";
        }

        return {
            score: metrics.isPassed ? 80 : 40,
            confidence: 70,
            recommendedDifficulty: nextDifficulty,
            reasoning: "Difficulty adjusted based on speed and completion status.",
            strengths: [],
            weaknesses: []
        };
    }
}
