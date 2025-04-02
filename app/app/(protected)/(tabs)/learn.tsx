import { useEffect, useState } from 'react'
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import { supabase } from 'lib/supabase'
import { LearningModules } from 'types/global'
import { useRouter } from 'expo-router'

export default function LearnModulesPage() {
  const [modules, setModules] = useState<LearningModules[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchModules = async () => {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) console.error('Error fetching modules:', error)
      else setModules(data as LearningModules[])

      setLoading(false)
    }

    fetchModules()
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-gray-500">Loading modules...</Text>
      </View>
    )
  }

  return (
      <FlatList
      data={modules}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => router.push(`/learning/${item.id}`)}
        >
          <Text style={styles.title}>{item.title}</Text>
          {item.topic && <Text style={styles.topic}>Topic: {item.topic}</Text>}
        </Pressable>
      )}
    />
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
})