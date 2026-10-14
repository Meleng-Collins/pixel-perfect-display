CREATE TABLE public.membership_requests (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id),
 phone text NOT NULL CHECK (length(phone) BETWEEN 5 AND 40),
 address text NOT NULL CHECK (length(address) BETWEEN 1 AND 500),
 membership_number text NOT NULL DEFAULT '' CHECK (length(membership_number) <= 80),
 status text NOT NULL DEFAULT 'submitted' CHECK (status = 'submitted'),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.membership_requests TO authenticated;
GRANT ALL ON public.membership_requests TO service_role;
ALTER TABLE public.membership_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY membership_read ON public.membership_requests FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY membership_insert ON public.membership_requests FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND status='submitted');
CREATE POLICY membership_update ON public.membership_requests FOR UPDATE TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid() AND status='submitted');
CREATE TRIGGER audit_membership AFTER INSERT OR UPDATE ON public.membership_requests FOR EACH ROW EXECUTE FUNCTION public.audit_change();
CREATE TABLE public.member_documents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id),
 object_path text NOT NULL UNIQUE CHECK (length(object_path)<=200),
 file_name text NOT NULL CHECK (length(file_name) BETWEEN 1 AND 180),
 category text NOT NULL CHECK (category IN ('identity','address','other')),
 mime_type text NOT NULL CHECK (mime_type IN ('application/pdf','image/jpeg','image/png','image/webp')),
 size_bytes integer NOT NULL CHECK (size_bytes BETWEEN 1 AND 5242880),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.member_documents TO authenticated;
GRANT ALL ON public.member_documents TO service_role;
ALTER TABLE public.member_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_read ON public.member_documents FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY documents_insert ON public.member_documents FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND split_part(object_path,'/',1)=auth.uid()::text);
CREATE POLICY documents_delete ON public.member_documents FOR DELETE TO authenticated USING (user_id=auth.uid());
CREATE TRIGGER audit_documents AFTER INSERT OR DELETE ON public.member_documents FOR EACH ROW EXECUTE FUNCTION public.audit_change();
CREATE POLICY member_files_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='member-documents' AND (storage.foldername(name))[1]=auth.uid()::text AND lower(storage.extension(name)) IN ('pdf','jpeg','png','webp') AND (metadata->>'size')::bigint BETWEEN 1 AND 5242880);
CREATE POLICY member_files_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id='member-documents' AND ((storage.foldername(name))[1]=auth.uid()::text OR public.has_role(auth.uid(),'admin')));
CREATE POLICY member_files_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id='member-documents' AND (storage.foldername(name))[1]=auth.uid()::text);