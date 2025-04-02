import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LearningModules } from 'types/global';

interface ModuleCardProps {
  module: LearningModules;
  onPress: () => void;
}

export default function ModuleCard({ module, onPress }: ModuleCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{module.title}</Text>
      {module.topic && <Text style={styles.topic}>Topic: {module.topic}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  topic: {
    marginTop: 4,
    color: '#555',
  },
});