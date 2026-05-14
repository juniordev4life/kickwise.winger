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
  it("maps modern Kickbase ranking entries (us / i / n / sp / spl)", () => {
    const raw = {
      ti: "Vater & Sohn",
      us: [
        { i: "U1", n: "Marco", sp: 15719, spl: 1, tv: 165_500_000, adm: true, mdp: 0, shp: 15719 },
        { i: "U2", n: "Pia", sp: 14820, spl: 2, tv: 158_000_000, adm: false, mdp: 412, shp: 14820 }
      ]
    };
    const result = normalizeRankingResponse({ ...raw, id: "L1" });
    expect(result.leagueId).toBe("L1");
    expect(result.leagueName).toBe("Vater & Sohn");
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0]).toMatchObject({
      userId: "U1",
      name: "Marco",
      totalPoints: 15719,
      rank: 1,
      isAdmin: true
    });
    expect(result.entries[1].matchdayPoints).toBe(412);
  });

  it("falls back to legacy long-form keys when present", () => {
    const raw = {
      users: [{ uid: "U1", uname: "X", spr: 100, pl: 5, tv: 1 }]
    };
    const result = normalizeRankingResponse({ ...raw, id: "L1" });
    expect(result.entries[0].userId).toBe("U1");
    expect(result.entries[0].rank).toBe(5);
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
