import {
  EssayQuestion,
  MultipleChoiceQuestion,
  QuestionDisplayProps,
} from "@/types";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";

export default function QuestionDisplay({
  questionsData,
  isMultipleChoice,
}: QuestionDisplayProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [showExplanation, setShowExplanation] = useState<{
    [key: number]: boolean;
  }>({});

  if (!questionsData?.questions?.length) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No questions available. Please try generating some questions.
      </div>
    );
  }

  const handleAnswerSelect = (questionIndex: number, choice: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: choice,
    }));
  };

  const toggleExplanation = (questionIndex: number) => {
    setShowExplanation((prev) => ({
      ...prev,
      [questionIndex]: !prev[questionIndex],
    }));
  };

  return (
    <div className="container mt-4 mx-auto space-y-4">
      {questionsData.questions.map((q, questionIndex) => (
        <div
          key={questionIndex}
          className="border rounded-lg shadow-sm bg-white overflow-hidden"
        >
          <div
            className="p-4 bg-gray-50 flex justify-between items-start cursor-pointer"
            onClick={() =>
              setExpandedQuestion(
                expandedQuestion === questionIndex ? null : questionIndex
              )
            }
          >
            <div className="flex-1">
              <span className="font-semibold text-gray-700">
                Question {questionIndex + 1}:
              </span>
              <p className="mt-1 text-gray-900">{q.question}</p>
            </div>
            {expandedQuestion === questionIndex ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>

          {expandedQuestion === questionIndex && (
            <div className="p-4 space-y-4">
              {isMultipleChoice ? (
                <>
                  <div className="space-y-2">
                    {(q as MultipleChoiceQuestion).choices.map(
                      (choice, choiceIndex) => {
                        const isSelected =
                          selectedAnswers[questionIndex] === choice;
                        const isCorrect =
                          (q as MultipleChoiceQuestion).answer === choice;
                        const showResult =
                          selectedAnswers[questionIndex] != null;

                        return (
                          <button
                            key={choiceIndex}
                            onClick={() =>
                              handleAnswerSelect(questionIndex, choice)
                            }
                            className={`w-full p-3 rounded-md flex items-center justify-between ${
                              isSelected
                                ? "bg-blue-50 border-blue-200"
                                : "bg-gray-50 border-gray-200"
                            } border ${
                              showResult && isCorrect
                                ? "ring-2 ring-green-500"
                                : ""
                            }`}
                            disabled={showResult}
                          >
                            <span className="text-left">{choice}</span>
                            {showResult &&
                              (isCorrect ? (
                                <Check className="w-5 h-5 text-green-500" />
                              ) : (
                                isSelected && (
                                  <X className="w-5 h-5 text-red-500" />
                                )
                              ))}
                          </button>
                        );
                      }
                    )}
                  </div>
                  {selectedAnswers[questionIndex] && (
                    <div className="mt-4">
                      <button
                        onClick={() => toggleExplanation(questionIndex)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {showExplanation[questionIndex] ? "Hide" : "Show"}{" "}
                        Explanation
                      </button>

                      {showExplanation[questionIndex] && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-md">
                          <p className="text-gray-700">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Sample Answer:
                    </h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                      {(q as EssayQuestion).sampleAnswer}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Explanation:
                    </h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
