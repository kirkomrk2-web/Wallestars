-- Enable net extension if not enabled (required for http_post)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to trigger webhook
CREATE OR REPLACE FUNCTION trigger_wallester_registration()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://n8n.srv1201204.hstgr.cloud/webhook/wallester-registration-v3',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object('owner_id', NEW.id, 'triggered_by', 'db_trigger')::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_owner_verified ON verified_business_profiles;
CREATE TRIGGER on_owner_verified
  AFTER INSERT ON verified_business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_wallester_registration();
