import { Pressable, StyleSheet, Text } from 'react-native';
import { LearningUnits } from 'types/global';

interface UnitItemProps {
  unit: LearningUnits;
  onPress: () => void;
}

export default function UnitItem({ unit, onPress }: UnitItemProps) {
  return (
    <Pressable style={styles.unitItem} onPress={onPress}>
      <Text style={styles.unitTitle}>{unit.title}</Text>
      <Text style={styles.unitType}>{unit.type}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  unitItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  unitTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  unitType: {
    fontSize: 14,
    color: '#666',
  },
});