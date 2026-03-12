import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const reportSchema = z.object({
    name: z.string(),
    position: z.string(),
    date: z.string(),
    overallScore: z.number(),
    skills: z.array(z.object({
        name: z.string(),
        score: z.number()
    })),
    technicalBreakdown: z.array(z.object({
        name: z.string(),
        score: z.number()
    })),
    performanceOverTime: z.array(z.object({
        question: z.number(),
        difficulty: z.string(),
        score: z.number(),
        avgScore: z.number()
    })),
    feedback: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        const { sessionData, candidateName = "User", targetPosition = "Software Engineer" } = await request.json();

        const prompt = `
      Generat a comprehensive interview performance report for ${candidateName} who interviewed for the position of ${targetPosition}.
      
      Session Data:
      ${JSON.stringify(sessionData)}
      
      The report should include:
      1. Overall Score (0-100)
      2. Skills breakdown (Technical Knowledge, Problem Solving, Communication, etc.)
      3. Technical breakdown (Specific languages/tools like React, JavaScript, System Design)
      4. Performance over time (Question by question analysis)
      5. Qualitative feedback summary.
      
      Be objective and helpful. If data is sparse, provide reasonable estimates based on the available performance.
    `;

        const { object: report } = await generateObject({
            model: google('gemini-1.5-pro'),
            schema: reportSchema,
            prompt: prompt,
        });

        return NextResponse.json(report);
    } catch (error) {
        console.error("Error generating insights report:", error);
        return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }
}
