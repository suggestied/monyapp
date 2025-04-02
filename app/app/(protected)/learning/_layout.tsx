import { Stack } from 'expo-router'

export default function LearnLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="[moduleId]/index" options={{ title: 'Module Units' }} />
      {/* [moduleId]/unit/[unitId]/[index] */}
      <Stack.Screen name="[moduleId]/unit/[unitId]/index" options={{ title: 'Unit' }} />
    </Stack>
  )
}
