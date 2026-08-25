export type ItemRecord = {
  id: string;
  visibility: boolean;
} & Record<string, unknown>;

export function toItemRecords(
  rows: readonly object[] | null | undefined,
): ItemRecord[] {
  return (rows ?? []).map((r) => r as unknown as ItemRecord);
}
