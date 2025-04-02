import { Link, router } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function OnboardingScreen() {
  return (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="mb-2 text-2xl font-bold">Welcome to Our App</Text>
      <Text className="mb-10 text-base text-gray-600">Let's get started!</Text>
      
      <View className="mb-5 w-full">
        <Button
          title="Get Started"
          onPress={() => router.push('/onboarding')}
        />
      </View>

      <View className="flex-row mt-5">
        <Text>Already have an account? </Text>
        <Link href="/login" className="font-bold text-blue-500">Sign In</Link>
      </View>
    </View>
  );
}