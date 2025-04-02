export type BadgeType = 'scenario' | 'progress' | 'secret';

export interface Badges {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  type: BadgeType | null;
  trigger: any | null;
}

export interface Classes {
  id: string;
  school_id: string | null;
  name: string;
  year: number | null;
}

export interface Events {
  id: string;
  user_id: string | null;
  event_type: string | null;
  metadata: any | null;
  timestamp: string | null;
}

export interface Goals {
  id: string;
  user_id: string | null;
  name: string;
  target_amount: number;
  progress: number;
  shared_with_parent: boolean;
}

export interface InvestmentOptions {
  id: string;
  type: string;
  name: string;
  description: string | null;
  price: number;
  risk_level: number;
  potential_return: number;
  image_url: string | null;
  active: boolean;
}

export interface Investments {
  id: string;
  user_id: string;
  investment_type: string;
  name: string;
  amount: number;
  purchase_price: number;
  current_price: number;
  purchase_date: string;
  last_updated: string;
}

export interface Leaderboard {
  user_id: string | null;
  name: string | null;
  school: string | null;
  class: string | null;
  badge_count: number | null;
  xp: number | null;
}

export interface LearningModules {
  id: string;
  title: string;
  target_age: string | null;
  topic: string | null;
  order_index: number | null;
  active: boolean;
}

export type LearningUnitType = 'scenario' | 'quiz' | 'text' | 'challenge';

export interface LearningUnits {
  id: string;
  module_id: string | null;
  type: LearningUnitType | null;
  title: string | null;
  content: any;
  order_index: number | null;
  created_by: string | null;
}

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export interface Users {
  id: string;
  name: string;
  role: UserRole;
  age: number | null;
  money_experience: string | null;
  learning_goal: string | null;
  learning_style: string | null;
  parent_id: string | null;
  school_id: string | null;
  class_id: string | null;
  xp: number;
  streak_days: number;
  last_active: string | null;
  created_at: string;
  balance: number;
}

export interface PublicUserProfiles {
  id: string;
  name: string;
  role: UserRole;
  school_id: string | null;
  class_id: string | null;
  xp: number;
}

export interface QuizAnswers {
  id: string;
  question_id: string | null;
  answer: string | null;
  is_correct: boolean;
}

export interface QuizQuestions {
  id: string;
  quiz_id: string | null;
  question: string | null;
  order_index: number | null;
}

export interface Quizzes {
  id: string;
  unit_id: string | null;
  question_count: number | null;
  score_to_pass: number | null;
}

export interface Schools {
  id: string;
  name: string;
  region: string | null;
}

export interface UserBadges {
  user_id: string;
  badge_id: string;
  earned_at: string | null;
}

export interface UserProgress {
  user_id: string;
  unit_id: string;
  completed_at: string | null;
}

export interface UserResponses {
  id: string;
  user_id: string | null;
  unit_id: string | null;
  choice_id: string | null;
  timestamp: string | null;
}
