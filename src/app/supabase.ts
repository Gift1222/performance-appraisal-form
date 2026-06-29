import { createClient } from "@supabase/supabase-js";
import { Submission } from "./store";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

let supabaseClient: any = null;

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      console.warn("Failed to initialize Supabase client:", err);
      return null;
    }
  }
  return supabaseClient;
}

/**
 * Pushes a local submission to the remote Supabase DB using absolute upsert.
 */
export async function pushSubmissionToSupabase(s: Submission): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("submissions")
      .upsert(s, { onConflict: "id" });

    if (error) {
      console.error("Supabase upsert error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to connect or push to Supabase:", err);
    return false;
  }
}

/**
 * Deletes a submission from the remote Supabase DB.
 */
export async function deleteSubmissionFromSupabase(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("submissions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to delete from Supabase:", err);
    return false;
  }
}

/**
 * Pulls all records from the remote Supabase DB.
 */
export async function fetchSubmissionsFromSupabase(): Promise<Submission[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("submittedAt", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return [];
    }
    return (data || []) as Submission[];
  } catch (err) {
    console.error("Failed to fetch from Supabase:", err);
    return [];
  }
}

