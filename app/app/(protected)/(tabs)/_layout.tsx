import { Tabs } from 'expo-router';
import { BookIcon, HomeIcon, MedalIcon } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'orange' }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} size={24} />,
          
        }}
      />
      {/* Learn */}
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color }) => <BookIcon color={color} size={24} />,
        }}
      />
      {/* Leaderboard */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color }) => <MedalIcon color={color} size={24} />,
        }}
      />
      
    </Tabs>
  );
}
