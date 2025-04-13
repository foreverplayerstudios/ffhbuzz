import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bhjzzalmplvunabojnnw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoanp6YWxtcGx2dW5hYm9qbm53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3OTc5ODYsImV4cCI6MjA1OTM3Mzk4Nn0.Sf7VNOUcdjleow8M1lvC7WAbGZsg366_imyUbChwaoE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);