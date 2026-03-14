export type ImportJobStatus = "idle" | "validating" | "applying" | "done" | "failed";

export interface ImportJobPlaceholder {
  id: string;
  source: "excel";
  status: ImportJobStatus;
  createdAt: Date;
}

export function getImportModuleRoadmap() {
  return {
    parser: "xlsx -> normalized rows",
    validator: "zod per-sheet rules",
    diffEngine: "sku-based compare with current catalog",
    applier: "transactional upsert + inventory movements",
    reporter: "summary + row-level errors"
  };
}
