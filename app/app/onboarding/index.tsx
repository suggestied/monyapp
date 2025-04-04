import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import RNDateTimePicker from '@react-native-community/datetimepicker';

type TextAnswer = {
  type: 'text';
  placeholder?: string;
  input: string;
};

type DateAnswer = {
  type: 'date';
  date: string;
};

type MultipleAnswer = {
  type: 'multiple';
  options: {
    emoji: string;
    text: string;
    subtext?: string;
  }[];
};

type Question = {
  title: string;
  description?: string;
  answer: TextAnswer | DateAnswer | MultipleAnswer;
  avatar?: string;
};

export default function Onboarding() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const slideAnim = useRef(new Animated.Value(0)).current;

  const questions: Question[] = [
    {
      title: 'What is your name?',
      answer: {
        type: 'text',
        placeholder: 'Your name',
        input: '',
      },
      avatar: 'happy',
    },
    {
      title: 'When is your birthday?',
      description: 'We need your age to provide a personalized experience.',
      answer: {
        type: 'date',
        date: '',
      },
      avatar: 'star',
    },
    {
      title: 'What is your goal?',
      answer: {
        type: 'multiple',
        options: [
          {
            emoji: '📈',
            text: 'Investing',
          },
          {
            emoji: '💰',
            text: 'Budgeting',
          },
          {
            emoji: '📊',
            text: 'Saving',
          },
          {
            emoji: '🏠',
            text: 'Buying a home',
          },
          {
            emoji: '💳',
            text: 'Other',
          },
        ],
      },
      avatar: 'money',
    },
    {
      title: 'How much do you know about finance?',
      description: 'This helps us tailor the content to your level.',
      answer: {
        type: 'multiple',
        options: [
          {
            emoji: '😐',
            text: 'Beginner',
          },
          {
            emoji: '🙂',
            text: 'Intermediate',
          },
          {
            emoji: '😎',
            text: 'Advanced',
          },
        ],
      },
      avatar: 'strong',
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      Animated.timing(slideAnim, {
        toValue: -1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        slideAnim.setValue(1);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        slideAnim.setValue(-1);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const handleFinish = async () => {
    router.push('/home');
  };

  const handleInputChange = (text: string) => {
    setAnswers({ ...answers, [currentQuestionIndex]: text });
  };

  return (
    <View
      style={{
        position: 'relative',
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 24,
      }}>
      {currentQuestionIndex > 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 72,
            left: 24,
            borderRadius: 8,
            backgroundColor: '#D1D5DB',
            padding: 16,
            opacity: slideAnim.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [0, 1, 0],
            }),
          }}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={{ textAlign: 'center', color: 'black' }}>Back</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.View
        style={{
          gap: 16,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [-500, 0, 500],
              }),
            },
          ],
        }}>
        <Text style={{ marginBottom: 24, textAlign: 'center', fontSize: 24, fontWeight: 'bold' }}>
          {currentQuestion.title}
        </Text>
        {currentQuestion.description && (
          <Text style={{ marginBottom: 16, textAlign: 'center', color: 'gray' }}>
            {currentQuestion.description}
          </Text>
        )}

        {currentQuestion.answer.type === 'text' ? (
          <TextInput
            style={{ marginBottom: 16, borderRadius: 8, borderWidth: 1, padding: 16 }}
            placeholder={currentQuestion.answer.placeholder || ''}
            value={answers[currentQuestionIndex] || ''}
            onChangeText={handleInputChange}
          />
        ) : currentQuestion.answer.type === 'date' ? (
          <RNDateTimePicker
            style={{}}
            value={new Date(answers[currentQuestionIndex] || Date.now())}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              if (date) {
                setAnswers({ ...answers, [currentQuestionIndex]: date.toISOString() });
              }
            }}
          />
        ) : (
          currentQuestion.answer.type === 'multiple' && (
            <View style={{ flexDirection: 'column', gap: 8, justifyContent: 'space-between' }}>
              {currentQuestion.answer.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    flexDirection: 'row',
                    gap: 16,
                    borderRadius: 8,
                    padding: 16,
                    backgroundColor:
                      option.text === answers[currentQuestionIndex] ? '#B794F4' : '#E2E8F0',
                  }}
                  onPress={() => handleInputChange(option.text)}>
                  <Text style={{ color: 'black' }}>{option.emoji}</Text>
                  <Text style={{ color: 'black' }}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity
            style={{ borderRadius: 8, backgroundColor: '#6B46C1', padding: 16, width: '100%' }}
            onPress={handleNext}>
            <Text style={{ textAlign: 'center', color: 'white' }}>
              {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
