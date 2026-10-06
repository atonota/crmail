import { loadDocuments } from "../site/documents.mjs";
export const prerender = true;
export function GET() {
  return new Response(
    JSON.stringify(
      loadDocuments().map((doc) => ({
        title: doc.title,
        group: doc.group,
        href: doc.href,
        text: doc.content,
      })),
    ),
    { headers: { "Content-Type": "application/json; charset=utf-8" } },
  );
}
