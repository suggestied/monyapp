import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from 'lib/supabase';
import { LearningUnits } from 'types/global';

export default function UnitDetailPage() {
  const { unitId } = useLocalSearchParams();
  const [unit, setUnit] = useState<LearningUnits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnit = async () => {
      if (!unitId || typeof unitId !== 'string') return;

      const { data, error } = await supabase
        .from('learning_units')
        .select('*')
        .eq('id', unitId)
        .single();

      if (error) console.error('[Unit Fetch Error]', error);
      else setUnit(data);

      setLoading(false);
    };

    fetchUnit();
  }, [unitId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading unit...</Text>
      </View>
    );
  }

  if (!unit) {
    return (
      <View style={styles.centered}>
        <Text>Unit not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{unit.title}</Text>
      <Text style={styles.type}>Type: {unit.type}</Text>
      <Text style={styles.content}>{JSON.stringify(unit.content, null, 2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  type: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  content: {
    fontFamily: 'monospace',
  },
});
