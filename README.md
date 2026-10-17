# Reachout Ready

Build REACH, a coordinator dashboard for a simulated Los Angeles wildfire evacuation.

The purpose is to turn one-way emergency alerts into a two-way response loop.

Create:

1. A coordinator dashboard titled “REACH”

2. An incident card:

   “Simulated wildfire evacuation — Griffith Park area”

   Clearly label the incident as simulation only.

3. Three fictional households:

   - David Kim — Koreatown — English — Confirmed

   - Ana Rivera — East Hollywood — Spanish — Needs accessible transportation

   - Jordan Lee — Los Feliz — English — Unreachable

4. Status cards with these statuses:

   - Confirmed

   - Needs Assistance

   - Human Follow-Up

   - Unreachable

5. A table showing each household, neighborhood, language, status, last contact attempt, and assistance need.

6. Buttons to:

   - Start outreach

   - Mark confirmed

   - Mark needs assistance

   - Send SMS fallback

   - Mark unreachable

7. A human follow-up panel showing:

   “Ana Rivera requested accessible transportation. Assistance has not been dispatched.”

8. A communication timeline for each household.

9. Use a professional emergency-operations design with dark navy, white, amber, green, and red.

10. Use mock data first, but structure the app so a backend and Retell webhook can be connected later.

Do not build maps, routing, user accounts, real emergency dispatch, or complex logistics.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2daf4b58-7b9e-5ff8-b201-9a8b708e9334).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
