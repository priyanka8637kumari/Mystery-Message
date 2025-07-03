import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    console.log("🚀 Starting suggest-messages API call");
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OpenAI API key is not configured");
      return NextResponse.json(
        {
          success: false,
          message: "OpenAI API key is not configured.",
        },
        { status: 500 }
      );
    }

    console.log("✅ OpenAI API key found, length:", process.env.OPENAI_API_KEY.length);

    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    console.log("📝 Calling OpenAI with prompt length:", prompt.length);

    const result = streamText({
      model: openai("gpt-4o-mini"), // Using gpt-4o-mini for cost efficiency, change to "gpt-4o" if needed
      prompt,
    });

    console.log("✅ OpenAI call successful, returning stream");
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("❌ Error in suggest-messages route:", error);
    console.error("❌ Error type:", typeof error);
    console.error("❌ Error message:", error instanceof Error ? error.message : String(error));
    console.error("❌ Full error object:", JSON.stringify(error, null, 2));

    // Handle different types of errors
    if (error && typeof error === "object" && "status" in error) {
      return NextResponse.json(
        {
          success: false,
          message: "OpenAI API error occurred.",
          error: (error as any).message || "Unknown API error",
        },
        { status: (error as any).status || 500 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "An unexpected error occurred.",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  }
}
