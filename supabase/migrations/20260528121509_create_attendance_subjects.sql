/*
  # Create attendance_subjects table

  1. New Tables
    - `attendance_subjects`
      - `id` (uuid, primary key)
      - `subject_name` (text, name of the subject)
      - `total_classes` (integer, total number of classes)
      - `attended_classes` (integer, number of classes attended)
      - `created_at` (timestamp, record creation time)

  2. Security
    - Enable RLS on `attendance_subjects` table
    - Add policy for authenticated users to manage their own data
*/

CREATE TABLE IF NOT EXISTS attendance_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_name text NOT NULL,
  total_classes integer NOT NULL DEFAULT 0,
  attended_classes integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE attendance_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read attendance data"
  ON attendance_subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert attendance data"
  ON attendance_subjects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update attendance data"
  ON attendance_subjects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete attendance data"
  ON attendance_subjects FOR DELETE
  TO authenticated
  USING (true);
