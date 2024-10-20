"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import QuestionDisplay from "./question-display";
import { QuestionData } from "@/types";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

export default function PromptForm() {
  const [isMultipleChoice, setIsMultipleChoice] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");

  const [result, setResult] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTips, setShowTips] = useState(false);

  const data = {
    SD: [1, 2, 3, 4, 5, 6],
    SMP: [7, 8, 9],
    SMA: [10, 11, 12],
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setSelectedClass("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, isMultipleChoice }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to generate questions");
      }

      setResult(data.result);
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const promptTips = isMultipleChoice
    ? [
        "Be specific about the topic",
        "Specify the difficulty level",
        "Mention if you want conceptual or calculation-based questions",
        "Include any specific requirements for the choices",
      ]
    : [
        "Specify the desired length or depth of answers",
        "Include the type of analysis or critical thinking required",
        "Mention if you want real-world applications",
        "Specify if citations or examples should be included in answers",
      ];

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div>
        <button
          type="button"
          onClick={() => setShowTips(!showTips)}
          className="text-sm text-blue-600 hover:text-blue-700 mb-4"
        >
          {showTips ? "Hide Tips" : "Show Tips"}
        </button>

        {showTips && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="font-medium text-sm text-blue-800 mb-2">
              Tips for {isMultipleChoice ? "multiple choice" : "essay"}{" "}
              questions:
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              {promptTips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="questionType"
            checked={isMultipleChoice}
            onCheckedChange={setIsMultipleChoice}
          />
          <Label htmlFor="questionType">
            {isMultipleChoice ? "Multiple Choice" : "Essay"}
          </Label>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <Select onValueChange={handleLevelChange} value={selectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SD">Sekolah Dasar</SelectItem>
                <SelectItem value="SMP">Sekolah Menengah Pertama</SelectItem>
                <SelectItem value="SMA">Sekolah Menengah Atas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              onValueChange={setSelectedClass}
              value={selectedClass}
              disabled={!selectedLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                {selectedLevel &&
                  (data as any)[selectedLevel].map((kelas: string) => (
                    <SelectItem key={kelas} value={kelas.toString()}>
                      {kelas}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sejarah">Sejarah</SelectItem>
                <SelectItem value="Matematika">Matematika</SelectItem>
                <SelectItem value="Fisika">Fisika</SelectItem>
                <SelectItem value="Kimia">Kimia</SelectItem>
                <SelectItem value="Bahasa Inggris">Bahasa Inggris</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={selectedDifficulty}
              onValueChange={setSelectedDifficulty}
            >
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="difficult">Difficult</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Textarea
            value={description}
            rows={3}
            className="resize-none"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the topic of the question"
          />
        </div>

        <div>
          <Textarea
            id="prompt"
            value={prompt}
            rows={3}
            className="resize-none"
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Example: Generate ${
              isMultipleChoice ? "multiple choice" : "essay"
            } questions about...`}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </>
          ) : (
            "Generate Questions"
          )}
        </Button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setShowTips(true)}
            className="text-sm text-red-600 hover:text-red-700 mt-2 underline"
          >
            View tips for better results
          </button>
        </div>
      )}

      {result && (
        <QuestionDisplay
          questionsData={result}
          isMultipleChoice={isMultipleChoice}
        />
      )}
    </div>
  );
}
