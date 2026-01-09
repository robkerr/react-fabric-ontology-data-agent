import { Card } from '@/components/ui/card';
import sampleQuestionsData from '@/config/sampleQuestions.json';

interface SampleQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

export function SampleQuestions({ onSelectQuestion }: SampleQuestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="max-w-3xl w-full space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Fabric Data Agent</h2>
          <p className="text-muted-foreground">
            Get started by selecting a sample question or type your own
          </p>
        </div>

        <div className="grid gap-4">
          {sampleQuestionsData.questions.map((question, index) => (
            <Card
              key={index}
              className="p-4 cursor-pointer hover:bg-accent transition-colors"
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
