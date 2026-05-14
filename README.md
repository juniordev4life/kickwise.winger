# kickwise.winger

Stateless Kickbase-API-Proxy für Kickwise.

## Zweck

Der Winger ist die **einzige Stelle** im Kickwise-Stack, die mit der inoffiziellen Kickbase-API spricht. Alle Calls vom Playmaker laufen über ihn:

```
Playmaker → Winger → Kickbase-API
```

Vorteile:
- Schema-Normalisierung an genau einer Stelle (Kickbase-Felder wie `tkn`, `u.lgs` werden in stabile Kickwise-Felder gemappt)
- Auswechselbar: falls Kickbase die API ändert, ändert sich nur der Winger
- Stateless: kein Firestore, keine Sessions — der Kickbase-Token kommt mit jedem Request rein

## Endpoints

| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| POST | `/api/v1/kickbase/auth/login` | Login: E-Mail + Passwort → Kickbase-Token |
| GET | `/api/v1/kickbase/leagues/:leagueId/me` | Eigene Liga-Daten |
| GET | `/api/v1/kickbase/leagues/:leagueId/ranking` | Liga-Tabelle |
| GET | `/api/v1/kickbase/squad/:leagueId` | Eigener Kader in einer Liga |
| GET | `/health` | Health-Check |

Alle Endpoints außer `/auth/login` und `/health` erwarten einen `Authorization: Bearer <kickbase-token>` Header.

## Lokal starten

```bash
cp .env.example .env.local
npm install
npm run dev    # läuft auf Port 3001
```

Test:
```bash
curl -X POST http://localhost:3001/api/v1/kickbase/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"...","password":"..."}'
```

## Tests

```bash
npm run test:run        # einmaliger Run
npm run test:coverage   # mit Coverage-Report
```

## Wichtige Hinweise

- **Inoffizielle API**: Kickbase kann das Schema jederzeit ändern. Normalizer in `src/api/services/normalizer.services.js` sind die erste Stelle, an der Updates landen.
- **Rate-Limits**: nicht offiziell dokumentiert. Standard-Retry: 3 Versuche mit Exponential-Backoff (200ms / 400ms / 800ms).
- **Logging**: alle 5xx/429 Kickbase-Antworten landen als `warn`-Log mit Request-ID.
