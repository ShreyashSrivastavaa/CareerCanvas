import { NextRequest, NextResponse } from 'next/server';
import { evaluatePerformance } from '@/lib/ai/adaptive-engine';

export async function POST(request: NextRequest) {
    try {
        const { currentQuestion, metrics, history } = await request.json();
        const evaluation = await evaluatePerformance(currentQuestion, metrics, history);
        return NextResponse.json(evaluation);
    } catch (error) {
        console.error("Error in adaptation API:", error);
        return NextResponse.json({ error: "Failed to evaluate performance" }, { status: 500 });
    }
}
