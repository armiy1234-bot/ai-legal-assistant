-- LexAI Auto-Sync Triggers
-- Р’С‹РїРѕР»РЅРёС‚СЊ РІ SQL Editor Supabase

CREATE EXTENSION IF NOT EXISTS "pg_net";

CREATE OR REPLACE FUNCTION notify_user_change()
RETURNS TRIGGER AS `
DECLARE
  webhook_url TEXT := 'https://ai-legal-assistant-henna.vercel.app/api/webhooks/sync';
  webhook_secret TEXT := current_setting('app.sync_webhook_secret', true);
BEGIN
  PERFORM
    net.http_post(
      url := webhook_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE(webhook_secret, 'default-secret')
      ),
      body := jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'timestamp', now(),
        'record_id', COALESCE(NEW.id, OLD.id)
      )
    );
  RETURN COALESCE(NEW, OLD);
END;
` LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_change_trigger ON users;
CREATE TRIGGER user_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_change();

DROP TRIGGER IF EXISTS query_change_trigger ON legal_queries;
CREATE TRIGGER query_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON legal_queries
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_change();

DROP TRIGGER IF EXISTS consultation_change_trigger ON lawyer_consultations;
CREATE TRIGGER consultation_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON lawyer_consultations
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_change();

SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
