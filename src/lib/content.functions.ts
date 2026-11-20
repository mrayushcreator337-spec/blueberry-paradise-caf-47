import { createServerFn } from "@tanstack/react-start";
import { enquirySchema } from "./restaurant";

export const getContent = createServerFn({ method: "GET" }).handler(async () => {
  const { loadPublicContent } = await import("./content.server");
  return loadPublicContent({
    url: process.env["SUPABASE_URL"],
    key: process.env["SUPABASE_PUBLISHABLE_KEY"],
  });
});

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => enquirySchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
    const url = process.env["SUPABASE_URL"];
    if (!key || !url) throw new Error("Please contact us on WhatsApp.");
    const { publicDbClient } = await import("./content.server");
    const db = publicDbClient(url, key);
    const { error } = await db
      .from("enquiries")
      .insert({ ...data, payload: JSON.parse(JSON.stringify(data.payload)), status: "new" });
    if (error) {
      console.error("[enquiry] insert failed:", error.message);
      throw new Error("Could not save your request. Please use WhatsApp.");
    }
    return { ok: true };
  });
