import { ReactNode } from "react";

export type Column<T> = {
  header: string;
  accessor: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
};

export function DataTable<T>({
  columns,
  data,
  keyField,
}: {
  columns: Column<T>[];
  data: T[];
  keyField: (row: T) => string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50">
            {columns.map((col) => (
              <th
                key={col.header}
                className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-600 ${
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                    ? "text-center"
                    : "text-left"
                } ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={keyField(row)}
              className="border-b border-stone-100 last:border-0 hover:bg-stone-50/70"
            >
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={`whitespace-nowrap px-4 py-3.5 text-text-700 ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left"
                  } ${col.className ?? ""}`}
                >
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="p-10 text-center text-sm text-text-400">No records to show.</div>
      )}
    </div>
  );
}
