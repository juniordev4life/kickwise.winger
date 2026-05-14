import { describe, expect, it } from "vitest";
import {
  normalizeLoginResponse,
  normalizeRankingResponse,
  normalizeSquadResponse
} from "../../../src/api/services/normalizer.services.js";

describe("normalizeLoginResponse", () => {
  it("maps Kickbase abbreviated keys into the stable Kickwise shape", () => {
    const raw = {
      tkn: "abc.def.ghi",
      tknex: "2026-06-01T00:00:00Z",
      u: {
        id: "USER1",
        name: "Marco",
        avt: "https://example.invalid/avatar.png",
        lgs: [
          { id: "L1", n: "Bürofreunde" },
          { id: "L2", n: "Familienliga" }
        ]
      }
    };

    const result = normalizeLoginResponse(raw);

    expect(result).toEqual({
      token: "abc.def.ghi",
      tokenExpiry: "2026-06-01T00:00:00Z",
      user: {
        id: "USER1",
        name: "Marco",
        avatarUrl: "https://example.invalid/avatar.png",
        leagues: [
          { id: "L1", name: "Bürofreunde" },
          { id: "L2", name: "Familienliga" }
        ]
      }
    });
  });

  it("falls back to long-form keys when Kickbase returns them", () => {
    const raw = {
      token: "T",
      tokenExpiry: null,
      user: { id: "U", name: "N", avatarUrl: null, leagues: [] }
    };
    const result = normalizeLoginResponse(raw);
    expect(result.token).toBe("T");
    expect(result.user.id).toBe("U");
  });
});

describe("normalizeRankingResponse", () => {
  it("maps ranking entries", () => {
    const raw = {
      users: [
        { uid: "U1", uname: "Marco", spr: 245, pl: 1, tv: 80_000_000 },
        { uid: "U2", uname: "Pia", spr: 233, pl: 2, tv: 75_000_000 }
      ]
    };
    const result = normalizeRankingResponse({ ...raw, id: "L1" });
    expect(result.leagueId).toBe("L1");
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0]).toMatchObject({
      userId: "U1",
      name: "Marco",
      totalPoints: 245,
      rank: 1
    });
  });
});

describe("normalizeSquadResponse", () => {
  it("maps positions and status codes into stable values", () => {
    const raw = {
      it: [
        { i: "P1", n: "Müller", pos: "MID", mv: 12_000_000, tp: 320, ap: 8.5, tid: "T1", st: "0" },
        { i: "P2", n: "Sané", pos: "FWD", mv: 18_000_000, tp: 400, ap: 10.0, tid: "T1", st: "1" }
      ]
    };
    const result = normalizeSquadResponse({ ...raw, lgid: "L1" });
    expect(result.leagueId).toBe("L1");
    expect(result.players[0].position).toBe("MID");
    expect(result.players[0].status).toBe("fit");
    expect(result.players[1].position).toBe("FWD");
    expect(result.players[1].status).toBe("injured");
  });
});
