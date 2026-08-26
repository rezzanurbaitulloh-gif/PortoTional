import { redirect } from "next/navigation";
import { getCurrentProfile, getPlan } from "@/services/identity";
import { listAssets } from "@/actions/assets";
import { AssetManager } from "@/features/assets/manager";

export const metadata = { title: "Asset Library" };

type FileRow = {
  id: string;
  file_name: string;
  mime_type: string;
  size: number;
  category: string;
  created_at: string;
  storage_path: string;
};

export default async function AssetsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [assets, plan] = await Promise.all([
    listAssets(),
    getPlan(profile.user_id),
  ]);

  const publicUrl = (row: FileRow) => {
    if (String(row.storage_path).startsWith(`${profile.user_id}/asset-`)) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/work-images/${row.storage_path}`;
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-4xl">
      <AssetManager
        initial={assets.map((a) => ({
          id: a.id,
          file_name: a.file_name,
          mime_type: a.mime_type,
          size: a.size,
          category: a.category,
          created_at: a.created_at,
          url: publicUrl(a as FileRow) ?? "",
        }))}
        plan={plan}
      />
    </div>
  );
}
