@AGENTS.md

# TravelMapper

이 서비스의 핵심은 빈틈없는 스케줄을 짜는 것이 아니다. 특정 시간대에 가능한 모든 옵션들(장소, 활동 등)을 미리 저장·정리해두고, 여행 중 상황에 따라 즉흥적으로 골라서 계획할 수 있도록 돕는 서비스이다. 계획의 경직성을 줄이면서도 무계획의 불안함을 없애는 것이 목표.

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (mobile-responsive)
- Supabase (PostgreSQL)
- Deployment: Vercel (free plan)

## Project Structure
- `src/app/` — Next.js pages and API routes
- `src/components/` — React components
- `src/lib/` — Utilities (supabase client, types)
- `supabase-schema.sql` — Database schema

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — Run ESLint

## Notes
- No user authentication — schedules are accessed by name + password
- Schedule uniqueness is enforced by (name, password) combination
- Default schedule expiration: 90 days
