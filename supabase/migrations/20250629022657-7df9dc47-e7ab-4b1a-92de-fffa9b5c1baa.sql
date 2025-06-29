
-- Create device_tokens table to store push notification tokens
CREATE TABLE public.device_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Add Row Level Security (RLS) to ensure users can only manage their own tokens
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for device_tokens
CREATE POLICY "Users can view their own device tokens" 
  ON public.device_tokens 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own device tokens" 
  ON public.device_tokens 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own device tokens" 
  ON public.device_tokens 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own device tokens" 
  ON public.device_tokens 
  FOR DELETE 
  USING (auth.uid() = user_id);
