import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the DB functions
vi.mock("./db", () => {
  let progressStore: Record<number, unknown> = {};
  let diplomaStore: Array<Record<string, unknown>> = [];
  let diplomaIdCounter = 1;

  return {
    getProgressByUserId: vi.fn(async (userId: number) => {
      return progressStore[userId] ? { userId, progressData: progressStore[userId], updatedAt: new Date() } : undefined;
    }),
    upsertProgress: vi.fn(async (userId: number, data: unknown) => {
      progressStore[userId] = data;
    }),
    getDiplomasByUserId: vi.fn(async (userId: number) => {
      return diplomaStore.filter(d => d.userId === userId);
    }),
    createDiploma: vi.fn(async (diploma: Record<string, unknown>) => {
      const id = diplomaIdCounter++;
      diplomaStore.push({ ...diploma, id, createdAt: new Date() });
      return { insertId: id };
    }),
    updateDiplomaUrl: vi.fn(async (diplomaId: number, url: string, fileKey: string) => {
      const d = diplomaStore.find(d => d.id === diplomaId);
      if (d) { d.diplomaUrl = url; d.fileKey = fileKey; }
    }),
    // Reset helpers for tests
    _reset: () => {
      progressStore = {};
      diplomaStore = [];
      diplomaIdCounter = 1;
    },
  };
});

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn(async (key: string) => ({
    key,
    url: `https://cdn.example.com/${key}`,
  })),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(async () => true),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 42,
    openId: "test-user-42",
    email: "test@statera.com",
    name: "Jean Dupont",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("progress routes", () => {
  beforeEach(async () => {
    const db = await import("./db") as any;
    db._reset();
  });

  it("progress.get returns null when no progress exists", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.progress.get();
    expect(result).toBeNull();
  });

  it("progress.save stores progress and progress.get retrieves it", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const progressData = {
      completedModules: ["phishing", "passwords"],
      moduleScores: { phishing: 80, passwords: 100 },
      totalXP: 270,
      badges: ["first-mission", "perfect-score", "phishing-expert", "password-master"],
    };

    const saveResult = await caller.progress.save(progressData);
    expect(saveResult).toEqual({ success: true });

    const getResult = await caller.progress.get();
    expect(getResult).toEqual(progressData);
  });

  it("progress.save updates existing progress", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await caller.progress.save({
      completedModules: ["phishing"],
      moduleScores: { phishing: 80 },
      totalXP: 150,
      badges: ["first-mission"],
    });

    await caller.progress.save({
      completedModules: ["phishing", "passwords"],
      moduleScores: { phishing: 80, passwords: 100 },
      totalXP: 270,
      badges: ["first-mission", "perfect-score"],
    });

    const result = await caller.progress.get();
    expect((result as any).completedModules).toHaveLength(2);
    expect((result as any).totalXP).toBe(270);
  });

  it("progress routes require authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.progress.get()).rejects.toThrow();
    await expect(caller.progress.save({
      completedModules: [],
      moduleScores: {},
      totalXP: 0,
      badges: [],
    })).rejects.toThrow();
  });
});

describe("diploma routes", () => {
  beforeEach(async () => {
    const db = await import("./db") as any;
    db._reset();
  });

  it("diploma.list returns empty array when no diplomas exist", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.diploma.list();
    expect(result).toEqual([]);
  });

  it("diploma.create creates a new diploma record", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.diploma.create({
      userName: "Jean Dupont",
      avgScore: 90,
      totalXP: 1180,
      levelNumber: 5,
    });

    expect(result.success).toBe(true);
    expect(result.diploma).toBeDefined();
    expect(result.diploma?.userName).toBe("Jean Dupont");
    expect(result.diploma?.avgScore).toBe(90);
    expect(result.diploma?.certificateNumber).toMatch(/^STA-/);
  });

  it("diploma.create accepts custom certificate number", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.diploma.create({
      userName: "Jean Dupont",
      avgScore: 90,
      totalXP: 1180,
      levelNumber: 5,
      certificateNumber: "STA-TEST-1234",
    });

    expect(result.diploma?.certificateNumber).toBe("STA-TEST-1234");
  });

  it("diploma.uploadImage uploads to S3 and updates record", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a diploma
    const createResult = await caller.diploma.create({
      userName: "Jean Dupont",
      avgScore: 90,
      totalXP: 1180,
      levelNumber: 5,
    });

    const diplomaId = createResult.diploma!.id;

    // Upload image
    const uploadResult = await caller.diploma.uploadImage({
      diplomaId,
      imageData: "iVBORw0KGgoAAAANSUhEUg==", // minimal base64
      format: "jpg",
    });

    expect(uploadResult.success).toBe(true);
    expect(uploadResult.url).toContain("diplomas/42/");
  });

  it("diploma routes require authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.diploma.list()).rejects.toThrow();
    await expect(caller.diploma.create({
      userName: "Test",
      avgScore: 50,
      totalXP: 100,
      levelNumber: 1,
    })).rejects.toThrow();
  });
});

describe("report routes", () => {
  it("report.upload stores report in S3", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.report.upload({
      content: "Test report content",
      userName: "Jean Dupont",
      format: "txt",
    });

    expect(result.success).toBe(true);
    expect(result.url).toContain("reports/42/");
    expect(result.fileKey).toContain("reports/42/");
  });

  it("report.upload supports HTML format", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.report.upload({
      content: "<html><body>Test</body></html>",
      userName: "Jean Dupont",
      format: "html",
    });

    expect(result.success).toBe(true);
    expect(result.fileKey).toContain(".html");
  });

  it("report.sendToRSSI sends notification", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.report.sendToRSSI({
      userName: "Jean Dupont",
      reportSummary: "Rapport de progression: 7/7 modules, score moyen 90%",
    });

    expect(result.success).toBe(true);
  });

  it("report routes require authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.report.upload({
      content: "test",
      userName: "Test",
      format: "txt",
    })).rejects.toThrow();
  });
});
