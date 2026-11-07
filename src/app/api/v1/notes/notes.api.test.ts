import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as listNotesRoute, POST as createNoteRoute } from "./route";
import {
  GET as getNoteRoute,
  PATCH as updateNoteRoute,
  DELETE as deleteNoteRoute,
} from "./[id]/route";
import { POST as togglePinRoute } from "./[id]/pin/route";
import { POST as toggleArchiveRoute } from "./[id]/archive/route";
import {
  GET as getLinksRoute,
  POST as createLinkRoute,
  DELETE as deleteLinkRoute,
} from "./[id]/links/route";
import { GET as getTagsRoute } from "./tags/route";

describe("Notes API Route Handlers", () => {
  it("creates, retrieves, filters, links, pins, archives, and deletes notes", async () => {
    // 1. Create first note
    const createReq1 = new NextRequest("http://localhost:3000/api/v1/notes", {
      method: "POST",
      body: JSON.stringify({
        title: "Microservices & Distributed Systems",
        content: "# Architectural Guidelines\n\n- Message buses\n- CQRS",
        note_type: "concept",
        tags: ["architecture", "systems"],
        is_pinned: false,
      }),
    });

    const createRes1 = await createNoteRoute(createReq1);
    expect(createRes1.status).toBe(201);
    const json1 = await createRes1.json();
    expect(json1.data.title).toBe("Microservices & Distributed Systems");
    expect(json1.data.tags).toContain("architecture");
    const note1Id = json1.data.id;

    // 2. Create second note
    const createReq2 = new NextRequest("http://localhost:3000/api/v1/notes", {
      method: "POST",
      body: JSON.stringify({
        title: "CQRS Implementation Reference",
        content: "# CQRS Patterns in Practice",
        note_type: "reference",
        tags: ["cqrs", "architecture"],
      }),
    });
    const createRes2 = await createNoteRoute(createReq2);
    expect(createRes2.status).toBe(201);
    const json2 = await createRes2.json();
    const note2Id = json2.data.id;

    // 3. List notes with search filter
    const searchReq = new NextRequest(
      "http://localhost:3000/api/v1/notes?search=distributed"
    );
    const searchRes = await listNotesRoute(searchReq);
    expect(searchRes.status).toBe(200);
    const searchJson = await searchRes.json();
    expect(searchJson.data.some((n: { id: string }) => n.id === note1Id)).toBe(true);

    // 4. List tags
    const tagsReq = new NextRequest("http://localhost:3000/api/v1/notes/tags");
    const tagsRes = await getTagsRoute(tagsReq);
    expect(tagsRes.status).toBe(200);
    const tagsJson = await tagsRes.json();
    expect(tagsJson.data).toContain("architecture");

    // 5. Link note 1 -> note 2
    const linkReq = new NextRequest(
      `http://localhost:3000/api/v1/notes/${note1Id}/links`,
      {
        method: "POST",
        body: JSON.stringify({
          target_note_id: note2Id,
          link_type: "references",
        }),
      }
    );
    const linkRes = await createLinkRoute(linkReq, {
      params: Promise.resolve({ id: note1Id }),
    });
    expect(linkRes.status).toBe(201);

    // 6. Get note links
    const getLinksReq = new NextRequest(
      `http://localhost:3000/api/v1/notes/${note1Id}/links`
    );
    const getLinksRes = await getLinksRoute(getLinksReq, {
      params: Promise.resolve({ id: note1Id }),
    });
    expect(getLinksRes.status).toBe(200);
    const getLinksJson = await getLinksRes.json();
    expect(getLinksJson.data.outward_links).toHaveLength(1);
    expect(getLinksJson.data.outward_links[0].target_note.title).toBe(
      "CQRS Implementation Reference"
    );

    // 7. Toggle pin
    const pinReq = new NextRequest(
      `http://localhost:3000/api/v1/notes/${note1Id}/pin`,
      { method: "POST" }
    );
    const pinRes = await togglePinRoute(pinReq, {
      params: Promise.resolve({ id: note1Id }),
    });
    expect(pinRes.status).toBe(200);
    const pinJson = await pinRes.json();
    expect(pinJson.data.is_pinned).toBe(true);

    // 7b. Get Note directly via getNoteRoute
    const getSingleRes = await getNoteRoute(
      new NextRequest(`http://localhost:3000/api/v1/notes/${note1Id}`),
      { params: Promise.resolve({ id: note1Id }) }
    );
    expect(getSingleRes.status).toBe(200);

    // 7c. Toggle archive
    const archiveRes = await toggleArchiveRoute(
      new NextRequest(`http://localhost:3000/api/v1/notes/${note1Id}/archive`, {
        method: "POST",
      }),
      { params: Promise.resolve({ id: note1Id }) }
    );
    expect(archiveRes.status).toBe(200);

    // 8. Update note content
    const patchReq = new NextRequest(
      `http://localhost:3000/api/v1/notes/${note1Id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          title: "Microservices & Distributed Systems (Updated)",
        }),
      }
    );
    const patchRes = await updateNoteRoute(patchReq, {
      params: Promise.resolve({ id: note1Id }),
    });
    expect(patchRes.status).toBe(200);
    const patchJson = await patchRes.json();
    expect(patchJson.data.title).toBe(
      "Microservices & Distributed Systems (Updated)"
    );

    // 9. Unlink
    const unlinkReq = new NextRequest(
      `http://localhost:3000/api/v1/notes/${note1Id}/links?target_note_id=${note2Id}`,
      { method: "DELETE" }
    );
    const unlinkRes = await deleteLinkRoute(unlinkReq, {
      params: Promise.resolve({ id: note1Id }),
    });
    expect(unlinkRes.status).toBe(200);

    // 10. Delete note
    const deleteReq = new NextRequest(
      `http://localhost:3000/api/v1/notes/${note1Id}`,
      { method: "DELETE" }
    );
    const deleteRes = await deleteNoteRoute(deleteReq, {
      params: Promise.resolve({ id: note1Id }),
    });
    expect(deleteRes.status).toBe(200);
  });
});
