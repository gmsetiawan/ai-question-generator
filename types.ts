export interface GenerateParams {
  isMultipleChoice: boolean;
  selectedLevel: string;
  selectedClass: string;
  selectedSubject: string;
  selectedDifficulty: string;
  description?: string;
  prompt: string;
}

export interface BaseQuestion {
  question: string;
  explanation: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  choices: string[];
  answer: string;
}

export interface EssayQuestion extends BaseQuestion {
  sampleAnswer: string;
}

export interface QuestionData {
  questions: (MultipleChoiceQuestion | EssayQuestion)[];
}

export interface QuestionDisplayProps {
  questionsData: QuestionData;
  isMultipleChoice: boolean;
}
