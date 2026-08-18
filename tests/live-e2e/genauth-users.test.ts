import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  extractId,
  firstUserId,
  liveE2EEnabled,
  liveClient,
  livePassword,
  livePrefix,
  resolveLiveUserId,
} from "./helpers";

const describeLiveE2E = liveE2EEnabled ? describe : describe.skip;

describeLiveE2E("live e2e: GenAuth users", () => {
  let client: ReturnType<typeof liveClient>;
  let existingUserId: string;
  let createdUserId: string | undefined;
  const createdUserIds = new Set<string>();

  beforeAll(async () => {
    client = liveClient();
    existingUserId = await resolveLiveUserId(client);
  });

  afterAll(async () => {
    if (createdUserIds.size) {
      await client.genauth.users.deleteBatch({ userIds: Array.from(createdUserIds) }).catch(() => undefined);
    }
  });

  async function ensureCreatedUser() {
    if (createdUserId) return createdUserId;
    const created = await client.genauth.users.create({
      username: `${livePrefix}-user`,
      password: livePassword(),
    });
    createdUserId = extractId(created.data, "created GenAuth user");
    createdUserIds.add(createdUserId);
    return createdUserId;
  }

  it("genauth.users.list({ page, limit })", async () => {
    const listed = await client.genauth.users.list({ page: 1, limit: 1 });
    expect(firstUserId(listed.data)).toBeTruthy();
  });

  it("genauth.users.get({ userId })", async () => {
    const user = await client.genauth.users.get({ userId: existingUserId });
    expect(JSON.stringify(user.data)).toContain(existingUserId);
  });

  it("genauth.users.getBatch({ userIds })", async () => {
    const users = await client.genauth.users.getBatch({ userIds: [existingUserId] });
    expect(JSON.stringify(users.data)).toContain(existingUserId);
  });

  it("genauth.users.create({ username, password })", async () => {
    const userId = await ensureCreatedUser();
    const created = await client.genauth.users.get({ userId });
    expect(JSON.stringify(created.data)).toContain(userId);
  });

  it("genauth.users.createBatch({ users })", async () => {
    const createdBatch = await client.genauth.users.createBatch({
      users: [{ username: `${livePrefix}-batch-user`, password: livePassword() }],
    });
    const batchId = firstUserId(createdBatch.data) || extractId(createdBatch.data, "batch GenAuth user");
    createdUserIds.add(batchId);
    const created = await client.genauth.users.get({ userId: batchId });
    expect(JSON.stringify(created.data)).toContain(batchId);
  });

  it("genauth.users.update({ userId, nickname })", async () => {
    const userId = await ensureCreatedUser();
    const nickname = `${livePrefix}-updated`;
    await client.genauth.users.update({
      userId,
      nickname,
    });
    const updated = await client.genauth.users.get({ userId });
    expect(JSON.stringify(updated.data)).toContain(nickname);
  });

  it("genauth.users.deleteBatch({ userIds })", async () => {
    const created = await client.genauth.users.create({
      username: `${livePrefix}-delete-user`,
      password: livePassword(),
    });
    const userId = extractId(created.data, "deleteBatch GenAuth user");
    createdUserIds.add(userId);
    await client.genauth.users.deleteBatch({ userIds: [userId] });
    createdUserIds.delete(userId);
    await expect(client.genauth.users.get({ userId })).rejects.toMatchObject({ status: 404 });
  });
});
