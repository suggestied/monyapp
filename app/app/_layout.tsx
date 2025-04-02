// app/layout.tsx or src/layout.tsx (depending on structure)
import '../global.css';
import { Slot } from 'expo-router';

export default function Layout() {
  return <Slot />;
}
