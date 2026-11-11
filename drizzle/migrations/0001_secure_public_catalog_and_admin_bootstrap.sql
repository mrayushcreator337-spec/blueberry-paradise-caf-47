DROP POLICY "Public read menu items" ON public.menu_items;
CREATE POLICY "Public read available active menu" ON public.menu_items FOR SELECT TO anon, authenticated USING (is_available AND EXISTS (SELECT 1 FROM public.menu_categories c WHERE c.id = category_id AND c.is_active));
CREATE OR REPLACE FUNCTION public.claim_first_admin() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN RETURN false; END $$;
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon, authenticated;
ALTER TABLE public.enquiries ADD CONSTRAINT enquiries_phone_length CHECK (phone IS NULL OR char_length(phone) <= 30) NOT VALID;
ALTER TABLE public.enquiries ADD CONSTRAINT enquiries_payload_size CHECK (octet_length(payload::text) <= 20000) NOT VALID;
COMMENT ON FUNCTION public.claim_first_admin() IS 'DEPRECATED: owner-approved role assignment only; public bootstrap disabled.';