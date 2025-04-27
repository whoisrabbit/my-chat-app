import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Log the API key (first few characters only for security)
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key prefix:', apiKey ? `${apiKey.substring(0, 4)}...` : 'none');

    const { messages } = await req.json();
    console.log('Received messages:', messages);

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    console.log('OpenAI response received:', completion.choices[0].message);

    return NextResponse.json({ 
      message: completion.choices[0].message 
    });
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error processing your request' },
      { status: 500 }
    );
  }
} 