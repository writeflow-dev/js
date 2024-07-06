import type { ExtendedBlock, Notion } from "@writeflow/types";

export type ContentProperties = {
  Category: Notion.PickPageProperty<"select">;
  order: Notion.PickPageProperty<"number">;
  Status: Notion.PickPageProperty<"status">;
  slug: Notion.PickPageProperty<"rich_text">;
  Name: Notion.PickPageProperty<"title">;
};

export type ContentBody = ExtendedBlock[];

export type Content = {
  id: string;
  title: string;
  slug: string;
  md: string;
  properties: ContentProperties;
  body: ContentBody;
};

export type ContentFields = {
  id?: boolean;
  title?: boolean;
  slug?: boolean;
  md?: boolean;
  properties?: boolean;
  body?: boolean;
};

export type PickContentFields<T extends ContentFields> = {
  [K in keyof T as T[K] extends true
    ? K extends keyof Content
      ? K
      : never
    : never]: K extends keyof Content ? Content[K] : never;
};

export const writeflow = ({
  apiKey,
  baseUrl,
}: {
  apiKey: string;
  baseUrl?: string;
}) => {
  const fetcher = (path: string, init?: Parameters<typeof fetch>[1]) =>
    fetch(
      baseUrl ? `${baseUrl}/v0${path}` : `https://api.writeflow.dev/v0${path}`,
      {
        ...init,
        headers: { ...init?.headers, "X-API-KEY": apiKey },
      }
    );

  return {
    content: {
      list: async <T extends ContentFields>(fields: T) => {
        const res = await fetcher(
          `/contents?fields=${Object.entries(fields)
            .filter(([_, v]) => v)
            .map(([field]) => field)
            .join(",")}`
        );

        if (!res.ok) {
          throw new WriteflowApiError(res.status, await res.text());
        }

        return (await res.json()) as PickContentFields<T>[];
      },
      byId: async <T extends ContentFields>(id: string, fields: T) => {
        const res = await fetcher(
          `/contents/${id}?fields=${Object.entries(fields)
            .filter(([_, v]) => v)
            .map(([field]) => field)
            .join(",")}`
        );

        if (!res.ok) {
          throw new WriteflowApiError(res.status, await res.text());
        }

        return (await res.json()) as PickContentFields<T>;
      },
      bySlug: async <T extends ContentFields>(slug: string, fields: T) => {
        const res = await fetcher(
          `/contents/slug/${slug}?fields=${Object.entries(fields)
            .filter(([_, v]) => v)
            .map(([field]) => field)
            .join(",")}`
        );

        if (!res.ok) {
          throw new WriteflowApiError(res.status, await res.text());
        }

        return (await res.json()) as PickContentFields<T>;
      },
    },
  };
};

export class WriteflowApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
