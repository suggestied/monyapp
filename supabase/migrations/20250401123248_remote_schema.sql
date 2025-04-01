

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."after_response_check_rewards"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  insert into events (user_id, event_type, metadata)
  values (new.user_id, 'scenario_choice', jsonb_build_object('unit_id', new.unit_id, 'choice_id', new.choice_id));

  update users set xp = xp + 10, last_active = current_date
  where id = new.user_id;

  return new;
end;
$$;


ALTER FUNCTION "public"."after_response_check_rewards"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.users (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'New User'));
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."investment_purchase"("p_user_id" "uuid", "p_investment_type" "text", "p_investment_name" "text", "p_amount" numeric, "p_purchase_price" numeric) RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_balance NUMERIC;
  new_investment_id UUID;
BEGIN
  -- Get current user balance
  SELECT balance INTO user_balance FROM users WHERE id = p_user_id;
  
  -- Check if user has enough balance
  IF user_balance < p_purchase_price * p_amount THEN
    RETURN json_build_object('success', false, 'message', 'Insufficient funds');
  END IF;
  
  -- Create the investment
  INSERT INTO investments (
    user_id, 
    investment_type, 
    name, 
    amount, 
    purchase_price, 
    current_price
  ) VALUES (
    p_user_id,
    p_investment_type,
    p_investment_name,
    p_amount,
    p_purchase_price,
    p_purchase_price
  ) RETURNING id INTO new_investment_id;
  
  -- Update user balance
  UPDATE users 
  SET balance = balance - (p_purchase_price * p_amount)
  WHERE id = p_user_id;
  
  -- Log the event
  INSERT INTO events (
    user_id, 
    event_type, 
    metadata
  ) VALUES (
    p_user_id,
    'investment_made',
    jsonb_build_object(
      'investment_type', p_investment_type,
      'investment_name', p_investment_name,
      'amount', p_amount,
      'price', p_purchase_price
    )
  );
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Investment purchased successfully',
    'investment_id', new_investment_id
  );
END;
$$;


ALTER FUNCTION "public"."investment_purchase"("p_user_id" "uuid", "p_investment_type" "text", "p_investment_name" "text", "p_amount" numeric, "p_purchase_price" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_xp"("user_id" "uuid", "amount" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Update the user's XP
  UPDATE public.users
  SET xp = xp + amount,
      last_active = CURRENT_DATE
  WHERE id = user_id;
  
  -- Insert an event record
  INSERT INTO public.events (user_id, event_type, metadata)
  VALUES (user_id, 'xp_earned', jsonb_build_object('amount', amount));
END;
$$;


ALTER FUNCTION "public"."log_xp"("user_id" "uuid", "amount" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_xp"("user_id" "uuid", "amount" integer, "multiplier" numeric DEFAULT 1) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  final_amount integer;
BEGIN
  -- Calculate the final XP amount with the multiplier
  final_amount := amount * multiplier;
  
  -- Update the user's XP
  UPDATE public.users
  SET xp = xp + final_amount,
      last_active = CURRENT_DATE
  WHERE id = user_id;
  
  -- Insert an event record
  INSERT INTO public.events (user_id, event_type, metadata)
  VALUES (user_id, 'xp_earned', jsonb_build_object('amount', final_amount, 'base_amount', amount, 'multiplier', multiplier));
END;
$$;


ALTER FUNCTION "public"."log_xp"("user_id" "uuid", "amount" integer, "multiplier" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_on_xp_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
  old_level INTEGER;
  new_level INTEGER;
  reward_amount DECIMAL(10, 2);
BEGIN
  -- Calculate old and new levels
  old_level := FLOOR(SQRT(COALESCE(old.xp, 0) / 100)) + 1;
  new_level := FLOOR(SQRT(new.xp / 100)) + 1;
  
  -- If user leveled up
  IF new_level > old_level THEN
    -- Base reward is $10 * level
    reward_amount := 10.00 * new_level;
    
    -- Update user balance
    UPDATE public.users
    SET balance = balance + reward_amount
    WHERE id = new.id;
    
    -- Log the level up event
    INSERT INTO public.events (user_id, event_type, metadata)
    VALUES (
      new.id, 
      'level_up', 
      jsonb_build_object(
        'old_level', old_level,
        'new_level', new_level,
        'reward_amount', reward_amount
      )
    );
  END IF;
  
  RETURN new;
END;
$_$;


ALTER FUNCTION "public"."update_user_on_xp_change"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."badges" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "type" "text",
    "trigger" "jsonb",
    CONSTRAINT "badges_type_check" CHECK (("type" = ANY (ARRAY['scenario'::"text", 'progress'::"text", 'secret'::"text"])))
);


ALTER TABLE "public"."badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."classes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "school_id" "uuid",
    "name" "text" NOT NULL,
    "year" integer
);


ALTER TABLE "public"."classes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "event_type" "text",
    "metadata" "jsonb",
    "timestamp" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."goals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "target_amount" numeric NOT NULL,
    "progress" numeric DEFAULT 0,
    "shared_with_parent" boolean DEFAULT false
);


ALTER TABLE "public"."goals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."investment_options" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" character varying(50) NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "risk_level" integer NOT NULL,
    "potential_return" numeric(5,2) NOT NULL,
    "image_url" "text",
    "active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."investment_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."investments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "investment_type" character varying(50) NOT NULL,
    "name" character varying(100) NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "purchase_price" numeric(10,2) NOT NULL,
    "current_price" numeric(10,2) NOT NULL,
    "purchase_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_updated" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."investments" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."leaderboard" AS
SELECT
    NULL::"uuid" AS "user_id",
    NULL::"text" AS "name",
    NULL::"text" AS "school",
    NULL::"text" AS "class",
    NULL::bigint AS "badge_count",
    NULL::integer AS "xp";


ALTER TABLE "public"."leaderboard" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."learning_modules" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "target_age" "int4range",
    "topic" "text",
    "order_index" integer,
    "active" boolean DEFAULT true
);


ALTER TABLE "public"."learning_modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."learning_units" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "module_id" "uuid",
    "type" "text",
    "title" "text",
    "content" "jsonb" NOT NULL,
    "order_index" integer,
    "created_by" "uuid",
    CONSTRAINT "learning_units_type_check" CHECK (("type" = ANY (ARRAY['scenario'::"text", 'quiz'::"text", 'text'::"text", 'challenge'::"text"])))
);


ALTER TABLE "public"."learning_units" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "name" "text" DEFAULT 'Unnamed'::"text" NOT NULL,
    "role" "text" DEFAULT 'student'::"text" NOT NULL,
    "age" integer,
    "money_experience" "text",
    "learning_goal" "text",
    "learning_style" "text",
    "parent_id" "uuid",
    "school_id" "uuid",
    "class_id" "uuid",
    "xp" integer DEFAULT 0,
    "streak_days" integer DEFAULT 0,
    "last_active" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "balance" numeric(10,2) DEFAULT 0 NOT NULL,
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['student'::"text", 'parent'::"text", 'teacher'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."public_user_profiles" AS
 SELECT "users"."id",
    "users"."name",
    "users"."role",
    "users"."school_id",
    "users"."class_id",
    "users"."xp"
   FROM "public"."users";


ALTER TABLE "public"."public_user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_answers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "question_id" "uuid",
    "answer" "text",
    "is_correct" boolean DEFAULT false
);


ALTER TABLE "public"."quiz_answers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_questions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "quiz_id" "uuid",
    "question" "text",
    "order_index" integer
);


ALTER TABLE "public"."quiz_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quizzes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "unit_id" "uuid",
    "question_count" integer,
    "score_to_pass" integer
);


ALTER TABLE "public"."quizzes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schools" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "region" "text"
);


ALTER TABLE "public"."schools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_badges" (
    "user_id" "uuid" NOT NULL,
    "badge_id" "uuid" NOT NULL,
    "earned_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_progress" (
    "user_id" "uuid" NOT NULL,
    "unit_id" "uuid" NOT NULL,
    "completed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_responses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "unit_id" "uuid",
    "choice_id" "text",
    "timestamp" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_responses" OWNER TO "postgres";


ALTER TABLE ONLY "public"."badges"
    ADD CONSTRAINT "badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."goals"
    ADD CONSTRAINT "goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."investment_options"
    ADD CONSTRAINT "investment_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."investments"
    ADD CONSTRAINT "investments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."learning_modules"
    ADD CONSTRAINT "learning_modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."learning_units"
    ADD CONSTRAINT "learning_units_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_answers"
    ADD CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."schools"
    ADD CONSTRAINT "schools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_pkey" PRIMARY KEY ("user_id", "badge_id");



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_pkey" PRIMARY KEY ("user_id", "unit_id");



ALTER TABLE ONLY "public"."user_responses"
    ADD CONSTRAINT "user_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_user_badges_user" ON "public"."user_badges" USING "btree" ("user_id");



CREATE INDEX "idx_user_progress_user" ON "public"."user_progress" USING "btree" ("user_id");



CREATE INDEX "idx_user_responses_user" ON "public"."user_responses" USING "btree" ("user_id");



CREATE OR REPLACE VIEW "public"."leaderboard" AS
 SELECT "u"."id" AS "user_id",
    "u"."name",
    COALESCE("s"."name", 'No school'::"text") AS "school",
    COALESCE("c"."name", 'No class'::"text") AS "class",
    "count"(DISTINCT "ub"."badge_id") AS "badge_count",
    "u"."xp"
   FROM ((("public"."user_badges" "ub"
     JOIN "public"."users" "u" ON (("u"."id" = "ub"."user_id")))
     LEFT JOIN "public"."schools" "s" ON (("u"."school_id" = "s"."id")))
     LEFT JOIN "public"."classes" "c" ON (("u"."class_id" = "c"."id")))
  GROUP BY "u"."id", "s"."name", "c"."name", "u"."xp";



CREATE OR REPLACE TRIGGER "on_user_xp_change" AFTER UPDATE OF "xp" ON "public"."users" FOR EACH ROW WHEN (("old"."xp" IS DISTINCT FROM "new"."xp")) EXECUTE FUNCTION "public"."update_user_on_xp_change"();



CREATE OR REPLACE TRIGGER "reward_on_response" AFTER INSERT ON "public"."user_responses" FOR EACH ROW EXECUTE FUNCTION "public"."after_response_check_rewards"();



ALTER TABLE ONLY "public"."classes"
    ADD CONSTRAINT "classes_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."goals"
    ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."investments"
    ADD CONSTRAINT "investments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."learning_units"
    ADD CONSTRAINT "learning_units_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."learning_units"
    ADD CONSTRAINT "learning_units_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."learning_modules"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_answers"
    ADD CONSTRAINT "quiz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."learning_units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."learning_units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_responses"
    ADD CONSTRAINT "user_responses_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."learning_units"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_responses"
    ADD CONSTRAINT "user_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE SET NULL;



CREATE POLICY "Users can create their own investments" ON "public"."investments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own investments" ON "public"."investments" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own investments" ON "public"."investments" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own investments" ON "public"."investments" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."investments" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."after_response_check_rewards"() TO "anon";
GRANT ALL ON FUNCTION "public"."after_response_check_rewards"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."after_response_check_rewards"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."investment_purchase"("p_user_id" "uuid", "p_investment_type" "text", "p_investment_name" "text", "p_amount" numeric, "p_purchase_price" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."investment_purchase"("p_user_id" "uuid", "p_investment_type" "text", "p_investment_name" "text", "p_amount" numeric, "p_purchase_price" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."investment_purchase"("p_user_id" "uuid", "p_investment_type" "text", "p_investment_name" "text", "p_amount" numeric, "p_purchase_price" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."log_xp"("user_id" "uuid", "amount" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."log_xp"("user_id" "uuid", "amount" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_xp"("user_id" "uuid", "amount" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."log_xp"("user_id" "uuid", "amount" integer, "multiplier" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."log_xp"("user_id" "uuid", "amount" integer, "multiplier" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_xp"("user_id" "uuid", "amount" integer, "multiplier" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_on_xp_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_on_xp_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_on_xp_change"() TO "service_role";


















GRANT ALL ON TABLE "public"."badges" TO "anon";
GRANT ALL ON TABLE "public"."badges" TO "authenticated";
GRANT ALL ON TABLE "public"."badges" TO "service_role";



GRANT ALL ON TABLE "public"."classes" TO "anon";
GRANT ALL ON TABLE "public"."classes" TO "authenticated";
GRANT ALL ON TABLE "public"."classes" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."goals" TO "anon";
GRANT ALL ON TABLE "public"."goals" TO "authenticated";
GRANT ALL ON TABLE "public"."goals" TO "service_role";



GRANT ALL ON TABLE "public"."investment_options" TO "anon";
GRANT ALL ON TABLE "public"."investment_options" TO "authenticated";
GRANT ALL ON TABLE "public"."investment_options" TO "service_role";



GRANT ALL ON TABLE "public"."investments" TO "anon";
GRANT ALL ON TABLE "public"."investments" TO "authenticated";
GRANT ALL ON TABLE "public"."investments" TO "service_role";



GRANT ALL ON TABLE "public"."leaderboard" TO "anon";
GRANT ALL ON TABLE "public"."leaderboard" TO "authenticated";
GRANT ALL ON TABLE "public"."leaderboard" TO "service_role";



GRANT ALL ON TABLE "public"."learning_modules" TO "anon";
GRANT ALL ON TABLE "public"."learning_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."learning_modules" TO "service_role";



GRANT ALL ON TABLE "public"."learning_units" TO "anon";
GRANT ALL ON TABLE "public"."learning_units" TO "authenticated";
GRANT ALL ON TABLE "public"."learning_units" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."public_user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."public_user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."public_user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_answers" TO "anon";
GRANT ALL ON TABLE "public"."quiz_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_answers" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_questions" TO "anon";
GRANT ALL ON TABLE "public"."quiz_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_questions" TO "service_role";



GRANT ALL ON TABLE "public"."quizzes" TO "anon";
GRANT ALL ON TABLE "public"."quizzes" TO "authenticated";
GRANT ALL ON TABLE "public"."quizzes" TO "service_role";



GRANT ALL ON TABLE "public"."schools" TO "anon";
GRANT ALL ON TABLE "public"."schools" TO "authenticated";
GRANT ALL ON TABLE "public"."schools" TO "service_role";



GRANT ALL ON TABLE "public"."user_badges" TO "anon";
GRANT ALL ON TABLE "public"."user_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."user_badges" TO "service_role";



GRANT ALL ON TABLE "public"."user_progress" TO "anon";
GRANT ALL ON TABLE "public"."user_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."user_progress" TO "service_role";



GRANT ALL ON TABLE "public"."user_responses" TO "anon";
GRANT ALL ON TABLE "public"."user_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."user_responses" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
