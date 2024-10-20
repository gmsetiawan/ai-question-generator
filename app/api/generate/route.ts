import { GenerateParams } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

function constructPrompt({
  isMultipleChoice,
  selectedLevel,
  selectedClass,
  selectedSubject,
  selectedDifficulty,
  description,
  prompt,
}: GenerateParams) {
  const basePrompt = `Generate 10 ${
    isMultipleChoice ? "multiple choice" : "essay"
  } questions.

Details:
- Subject: ${selectedSubject}
- Level: ${selectedLevel}
- Class: ${selectedClass}
- Difficulty: ${selectedDifficulty}
- Description: ${description}

Topic: ${prompt}

Requirements:
${
  isMultipleChoice
    ? `- Each question should have 4 choices
       - Include the correct answer`
    : `- Each question should be thought-provoking
       - Questions should encourage critical thinking`
}
       - Provide a detailed explanation or sample answer
       - Format the response as JSON with this structure:
    {
      "questions": [
        {
          "question": "Question text",
          ${
            isMultipleChoice
              ? `"choices": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
          "answer": "Correct choice",`
              : `"sampleAnswer": "Detailed sample answer or key points to include",`
          }
          "explanation": "Explanation text"
        }
      ]
    }

  Response (JSON only):`;

  return basePrompt;
}

function extractJSONFromText(text: string): object | null {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.log(e);
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to extract JSON:", e);
    }
    return null;
  }
}

function validateAndFormatQuestions(data: any, isMultipleChoice: boolean): any {
  if (!data.questions || !Array.isArray(data.questions)) {
    throw new Error("No valid questions array found");
  }

  data.questions = data.questions.map((q: any, index: number) => {
    if (!q.question || !q.explanation) {
      throw new Error(`Missing required fields in question ${index + 1}`);
    }

    if (isMultipleChoice) {
      if (!q.choices || !q.answer) {
        throw new Error(
          `Missing multiple choice fields in question ${index + 1}`
        );
      }

      // Ensure choices is an array
      if (!Array.isArray(q.choices)) {
        q.choices = [q.choices].flat();
      }

      // Ensure the answer is one of the choices
      if (!q.choices.includes(q.answer)) {
        q.choices.push(q.answer);
      }

      return {
        question: q.question,
        choices: q.choices,
        answer: q.answer,
        explanation: q.explanation,
      };
    } else {
      if (!q.sampleAnswer) {
        throw new Error(`Missing sample answer in question ${index + 1}`);
      }

      return {
        question: q.question,
        sampleAnswer: q.sampleAnswer,
        explanation: q.explanation,
      };
    }
  });

  return data;
}

export async function POST(request: Request) {
  try {
    const {
      isMultipleChoice,
      selectedLevel,
      selectedClass,
      selectedSubject,
      selectedDifficulty,
      description,
      prompt,
    } = await request.json();

    const enhancedPrompt = constructPrompt({
      isMultipleChoice,
      selectedLevel,
      selectedClass,
      selectedSubject,
      selectedDifficulty,
      description,
      prompt,
    });

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINIAI_API_KEY as string
    );
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    });

    const result = await model.generateContent([enhancedPrompt]);
    const responseText = await result.response.text();

    const parsedResponse = extractJSONFromText(responseText);

    if (!parsedResponse) {
      console.error("Raw response:", responseText);
      throw new Error("Could not extract valid JSON from response");
    }

    const formattedResponse = validateAndFormatQuestions(
      parsedResponse,
      isMultipleChoice
    );

    return NextResponse.json({ result: formattedResponse });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate questions",
        debug:
          process.env.NODE_ENV === "development"
            ? {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}
