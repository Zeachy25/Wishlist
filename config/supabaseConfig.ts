import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqpronzcwibseqjqyqms.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcHJvbnpjd2lic2VxanF5cW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMzg0ODAsImV4cCI6MjA5MzkxNDQ4MH0.W4LT4fGFVnR8aVPORnOP1oxxx4y_JHzNRN6NPqJ7me8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
