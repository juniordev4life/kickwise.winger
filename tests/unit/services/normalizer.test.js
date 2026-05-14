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

import {
  normalizeCompetitionTableResponse,
  normalizePlayerDetailResponse,
  normalizeTeamProfileResponse
} from "../../../src/api/services/normalizer.services.js";

describe("normalizeCompetitionTableResponse", () => {
  it("maps team-table entries", () => {
    const raw = {
      it: [
        { tid: "7", tn: "Leverkusen", cpl: 6, mc: 33, gd: 21, cp: 58, tim: "x.svg" },
        { tid: "43", tn: "Leipzig", cpl: 16, mc: 33, gd: -2, cp: 43, tim: "y.svg" }
      ]
    };
    const out = normalizeCompetitionTableResponse(raw);
    expect(out.teams).toHaveLength(2);
    expect(out.teams[0]).toMatchObject({
      teamId: "7",
      name: "Leverkusen",
      rank: 6,
      matchesPlayed: 33,
      goalDifference: 21,
      seasonPoints: 58
    });
  });
});

describe("normalizeTeamProfileResponse", () => {
  it("maps players inside a team profile", () => {
    const raw = {
      tid: "43",
      tn: "RB Leipzig",
      it: [
        {
          i: "8227",
          n: "Vandevoordt",
          pos: 1,
          st: 0,
          mv: 10100000,
          sdmvt: -236209,
          prob: 0.95,
          tid: "43",
          pim: "p.png"
        },
        {
          i: "10771",
          n: "Diomande",
          pos: 3,
          st: 0,
          mv: 35000000,
          sdmvt: 100000,
          prob: 0.8,
          tid: "43"
        }
      ]
    };
    const out = normalizeTeamProfileResponse(raw);
    expect(out.teamId).toBe("43");
    expect(out.teamName).toBe("RB Leipzig");
    expect(out.players).toHaveLength(2);
    expect(out.players[0]).toMatchObject({
      playerId: "8227",
      name: "Vandevoordt",
      position: "GK",
      marketValue: 10100000,
      marketValueTrend24h: -236209,
      startingProbability: 0.95
    });
    expect(out.players[1].position).toBe("MID");
  });
});

describe("normalizePlayerDetailResponse", () => {
  it("flattens player detail with points history", () => {
    const raw = {
      i: "8227",
      fn: "Maarten",
      ln: "Vandevoordt",
      shn: 26,
      tid: "43",
      tn: "Leipzig",
      pos: 1,
      st: 0,
      tp: 1313,
      ap: 109,
      mv: 9919671,
      tfhmvt: -236209,
      g: 0,
      a: 0,
      y: 0,
      r: 0,
      ph: [
        { hp: true, p: 77 },
        { hp: true, p: 87 },
        { hp: false, p: 0 }
      ],
      plpt: "Ligainsider",
      dt: "2026-04-09T12:27:29Z"
    };
    const out = normalizePlayerDetailResponse(raw);
    expect(out.name).toBe("Maarten Vandevoordt");
    expect(out.position).toBe("GK");
    expect(out.totalPoints).toBe(1313);
    expect(out.pointsHistory).toHaveLength(3);
    expect(out.pointsHistory[0]).toEqual({ matchday: 1, points: 77, hasPlayed: true });
    expect(out.pointsHistory[2]).toEqual({ matchday: 3, points: 0, hasPlayed: false });
  });
});
