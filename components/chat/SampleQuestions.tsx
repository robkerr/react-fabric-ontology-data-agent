import { Card } from '@/components/ui/card';
import sampleQuestionsData from '@/config/sampleQuestions.json';

interface SampleQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

export function SampleQuestions({ onSelectQuestion }: SampleQuestionsProps) {
  return (
    <div className="flex h-full flex-col items-center overflow-y-auto p-8">
      <div className="w-full max-w-3xl space-y-6">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-semibold">Welcome to Fabric Data Agent</h2>
          <p className="text-muted-foreground">
            Get started by selecting a sample question or type your own
          </p>
        </div>

        <div className="grid gap-4">
          {sampleQuestionsData.questions.map((question, index) => (
            <Card
              key={index}
              className="cursor-pointer p-4 transition-colors hover:bg-accent"
              onClick={() => onSelectQuestion(question)}
            >
              <p className="text-sm">{question}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
