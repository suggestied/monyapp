import { useEffect, useState } from 'react'
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from 'lib/supabase'
import { LearningUnits } from 'types/global'

export default function ModuleUnitsPage() {
  const { moduleId } = useLocalSearchParams()
  const router = useRouter()
  const [units, setUnits] = useState<LearningUnits[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUnits = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('learning_units')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true })

      if (error) console.error('Error loading units:', error)
      else setUnits(data as LearningUnits[])

      setLoading(false)
    }

    if (moduleId) fetchUnits()
  }, [moduleId])

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-gray-500">Loading units...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={units}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/learn/${moduleId}/unit/${item.id}`)}
            style={styles.unitItem}
          >
            <Text style={styles.unitTitle}>{item.title}</Text>
            <Text style={styles.unitType}>{item.type}</Text>
          </Pressable>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
  unitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  unitType: {
    marginTop: 4,
    color: '#555',
    textTransform: 'capitalize',
  },
})