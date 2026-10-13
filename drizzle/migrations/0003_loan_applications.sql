CREATE TABLE public.lending_policy(id boolean PRIMARY KEY DEFAULT true CHECK(id), require_income boolean NOT NULL DEFAULT true, require_guarantor boolean NOT NULL DEFAULT true, updated_at timestamptz NOT NULL DEFAULT now());
INSERT INTO public.lending_policy(id) VALUES(true);
GRANT SELECT ON public.lending_policy TO authenticated; GRANT UPDATE(require_income,require_guarantor) ON public.lending_policy TO authenticated; GRANT ALL ON public.lending_policy TO service_role;
ALTER TABLE public.lending_policy ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_policy ON public.lending_policy FOR SELECT TO authenticated USING(true);
CREATE POLICY admin_policy ON public.lending_policy FOR UPDATE TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE TRIGGER audit_lending_policy BEFORE UPDATE ON public.lending_policy FOR EACH ROW EXECUTE FUNCTION public.audit_change();

CREATE TABLE public.loan_applications(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id),
 membership_number text NOT NULL CHECK(length(trim(membership_number)) BETWEEN 1 AND 40),
 amount numeric(14,0) NOT NULL CHECK(amount>0 AND amount<=1000000000),
 term_months integer NOT NULL CHECK(term_months BETWEEN 1 AND 600),
 purpose text NOT NULL CHECK(length(trim(purpose)) BETWEEN 3 AND 1000),
 phone text NOT NULL CHECK(length(trim(phone)) BETWEEN 6 AND 30),
 email text NOT NULL CHECK(length(email) BETWEEN 3 AND 255),
 address text NOT NULL DEFAULT '' CHECK(length(address)<=300),
 monthly_income numeric(14,0) CHECK(monthly_income IS NULL OR monthly_income>=0),
 occupation text NOT NULL DEFAULT '' CHECK(length(occupation)<=160),
 employer text NOT NULL DEFAULT '' CHECK(length(employer)<=160),
 guarantor_name text NOT NULL DEFAULT '' CHECK(length(guarantor_name)<=160),
 guarantor_phone text NOT NULL DEFAULT '' CHECK(length(guarantor_phone)<=30),
 guarantor_relationship text NOT NULL DEFAULT '' CHECK(length(guarantor_relationship)<=80),
 status text NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','under_review','info_requested','approved','declined')),
 reviewer_note text NOT NULL DEFAULT '' CHECK(length(reviewer_note)<=2000),
 reviewed_by uuid, reviewed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX loan_applications_user ON public.loan_applications(user_id,created_at DESC);
GRANT SELECT, INSERT ON public.loan_applications TO authenticated; GRANT UPDATE(status,reviewer_note) ON public.loan_applications TO authenticated; GRANT ALL ON public.loan_applications TO service_role;
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
INSERT INTO public.role_permissions(role,permission) VALUES('admin','loans.review') ON CONFLICT DO NOTHING;
CREATE POLICY own_or_reviewer_read ON public.loan_applications FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_permission('loans.review'));
CREATE POLICY member_submit ON public.loan_applications FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND status='submitted' AND reviewer_note='' AND reviewed_by IS NULL);
CREATE POLICY reviewer_update ON public.loan_applications FOR UPDATE TO authenticated USING(public.has_permission('loans.review')) WITH CHECK(public.has_permission('loans.review'));

CREATE FUNCTION public.loan_application_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.lending_policy;
BEGIN
 IF TG_OP='INSERT' THEN
  SELECT * INTO p FROM public.lending_policy LIMIT 1;
  IF p.require_income AND (NEW.monthly_income IS NULL OR trim(NEW.occupation)='') THEN RAISE EXCEPTION 'Income details are required'; END IF;
  IF p.require_guarantor AND (trim(NEW.guarantor_name)='' OR trim(NEW.guarantor_phone)='') THEN RAISE EXCEPTION 'Guarantor details are required'; END IF;
  IF (SELECT count(*) FROM public.loan_applications WHERE user_id=NEW.user_id AND created_at>now()-interval '1 day')>=3 THEN RAISE EXCEPTION 'Daily application limit reached'; END IF;
 ELSE
  NEW.reviewed_by=auth.uid(); NEW.reviewed_at=now();
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.loan_application_guard() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER loan_application_guard BEFORE INSERT OR UPDATE ON public.loan_applications FOR EACH ROW EXECUTE FUNCTION public.loan_application_guard();
CREATE TRIGGER audit_loan_applications BEFORE INSERT OR UPDATE ON public.loan_applications FOR EACH ROW EXECUTE FUNCTION public.audit_change();