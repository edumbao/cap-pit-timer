# CAP Pit Clock

Time-tracking alarm clock for the **Calisthenics Association of the Philippines**.

A racing-cockpit HUD for training days: today’s grid, alarms, a live countdown, a session timer, and a lap log. Built so athletes can lock a time, start a session, and not miss the next one.

## What it does

- **Today’s schedule** — seeded CAP-style sessions (mobility, pull, skill, street, bootcamp) plus any alarms you add
- **Next launch countdown** — live HUD clock to the next upcoming session
- **Create alarm** — pick a time, activity, duration, and optional daily repeat
- **Session timer** — start / pause / resume / finish a lap
- **Alarm overlay** — lights-out sequence when an alarm fires (browser notification + beep)
- **History** — completed sessions with duration

Schedules and history stay on the device (`localStorage`). No account required.

## Stack

React 19, TanStack Start, Tailwind CSS v4, Zustand.

## Local run

```bash
npm install
npm run dev
```

Then open the printed local URL. Allow notifications if you want desktop alarm alerts.

```bash
npm run typecheck
npm run build
```

## Design

Philippine flag livery (blue / white / red / gold) on a carbon pit-wall. Teko for the countdown, Barlow for UI. Mobile-first; desktop is a two-column pit wall.

Part of the [Ed Umbao Lab](https://github.com/edumbao) experiment.
