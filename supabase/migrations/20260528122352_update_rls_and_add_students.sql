/*
  # Update RLS policies for anonymous access and add students table

  1. Changes to attendance_subjects
    - Drop existing restrictive policies
    - Add new policies that allow anonymous access (no auth required)

  2. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `name` (text, student name)
      - `created_at` (timestamp)

  3. Changes to attendance_subjects
    - Add `student_id` column (uuid, foreign key to students)
    - Update policies for anonymous access

  This enables the app to work without requiring authentication.
*/

-- Drop existing policies on attendance_subjects
DROP POLICY IF EXISTS "Anyone can read attendance data" ON attendance_subjects;
DROP POLICY IF EXISTS "Anyone can insert attendance data" ON attendance_subjects;
DROP POLICY IF EXISTS "Anyone can update attendance data" ON attendance_subjects;
DROP POLICY IF EXISTS "Anyone can delete attendance data" ON attendance_subjects;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add student_id to attendance_subjects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'attendance_subjects' AND column_name = 'student_id'
  ) THEN
    ALTER TABLE attendance_subjects ADD COLUMN student_id uuid REFERENCES students(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create anonymous-friendly policies for students
CREATE POLICY "Allow anonymous read on students"
  ON students FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anonymous insert on students"
  ON students FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on students"
  ON students FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on students"
  ON students FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create anonymous-friendly policies for attendance_subjects
CREATE POLICY "Allow anonymous read on attendance_subjects"
  ON attendance_subjects FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anonymous insert on attendance_subjects"
  ON attendance_subjects FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on attendance_subjects"
  ON attendance_subjects FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on attendance_subjects"
  ON attendance_subjects FOR DELETE
  TO anon, authenticated
  USING (true);
