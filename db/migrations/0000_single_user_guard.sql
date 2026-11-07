-- Single-user guard: Prevent multiple signups
CREATE OR REPLACE FUNCTION public.prevent_multiple_users()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT count(*) FROM auth.users) >= 1 THEN
    RAISE EXCEPTION 'Personal OS is configured for single-user mode. Additional signups are disabled.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_multiple_users ON auth.users;
CREATE TRIGGER trg_prevent_multiple_users
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_multiple_users();
