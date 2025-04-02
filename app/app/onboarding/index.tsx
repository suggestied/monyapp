import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

type TextAnswer = {
  placeholder?: string;
  input: string;
};

type DateAnswer = {
  date: string;
};

type MultipleAnswer = {
  options: {
    emoji: string;
    text: string;
  }[];
};

type Question = {
  title: string;
  description?: string;
  type: 'text' | 'date' | 'multiple';
  answer: TextAnswer | DateAnswer | MultipleAnswer;
};

const questions: Question[] = [
  {
    title: 'What is your name?',
    type: 'text',
    answer: {
      placeholder: 'Your name',
      input: '',
    },
  },
  {
    title: 'What is your birthday?',
    description: 'We need your age to provide a personalized experience.',
    type: 'text',
    answer: {
      placeholder: 'Your age',
      input: '',
    },
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const currentQuestion = questions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = async () => {};

  const handleInputChange = (text: string) => {
    setAnswers({ ...answers, [currentQuestionIndex]: text });
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-6 text-center text-2xl font-bold">{currentQuestion.title}</Text>
      {currentQuestion.description && (
        <Text className="mb-4 text-center text-gray-600">{currentQuestion.description}</Text>
      )}

      {currentQuestion.type === 'text' && (
        <TextInput
          className="mb-4 rounded-lg border p-4"
          placeholder={
            currentQuestion.type === 'text' && 'placeholder' in currentQuestion.answer
              ? currentQuestion.answer.placeholder || ''
              : ''
          }
          value={answers[currentQuestionIndex] || ''}
          onChangeText={handleInputChange}
        />
      )}

      <View className="flex-row justify-between">
        {currentQuestionIndex > 0 && (
          <TouchableOpacity className="rounded-lg bg-gray-300 p-4" onPress={handleBack}>
            <Text className="text-center text-black">Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity className="rounded-lg bg-purple-600 p-4" onPress={handleNext}>
          <Text className="text-center text-white">
            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
