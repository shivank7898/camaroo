# Camaroo — Engineering Rules

> These are **strict, non-negotiable** rules for this codebase.
> Every PR, every component, every line must conform.

> Last updated: March 19, 2026

---

## 1. Styling

| Rule | Detail |
|---|---|
| ✅ Use NativeWind by default | All styles via `className` |
| ✅ Use `StyleSheet.create` only for dynamic or perf-critical styles | Lists, animations |
| ❌ No inline styles | `style={{ margin: 10 }}` is banned |
| ❌ No raw hex colors in JSX | Use Tailwind tokens: `bg-background`, `text-primary` |
| ❌ No inline objects in JSX | `style={{ flex: 1 }}` causes re-renders |

---

## 2. Components

| Rule | Detail |
|---|---|
| ✅ All reusable components must be `React.memo` wrapped | No exceptions |
| ✅ Components must be pure | No API calls, no Zustand, no side effects inside UI |
| ✅ Use Container/Presenter pattern | Screen = logic orchestration. Component = display only |
| ❌ No `any` types | Use proper interfaces. `any` is banned |
| ❌ No business logic inside components | Move to hooks or services |
| ❌ No copy-pasting UI blocks between screens | Extract to `components/` |

---

## 3. State Management

| Rule | Detail |
|---|---|
| ✅ Zustand for client state | Auth session, UI state, user profile |
| ✅ Always use selectors | `useStore(state => state.user)` only |
| ✅ `shallow` for multi-value selects | Prevents unnecessary re-renders |
| ✅ Split stores by domain | `useAuthStore`, `useUIStore`, `useProfileStore` |
| ❌ Never select the whole store | `const state = useStore()` is banned |
| ❌ No server data in Zustand | Use TanStack Query for all API data |

---

## 4. React Hooks

| Rule | Detail |
|---|---|
| ✅ `useCallback` only when preventing child re-render | Memoized child + unstable function |
| ✅ `useMemo` only for expensive derived data | Filter/sort/reduce on large arrays |
| ✅ All `useEffect` deps must be correct and complete | No missing deps |
| ❌ No `useCallback` on private functions | Used only inside the same component |
| ❌ No `useMemo` for primitive derivations | `count + 1` doesn't need memoization |
| ❌ No empty `[]` deps unless truly mount-only | Document why if used |

---

## 5. Lists

| Rule | Detail |
|---|---|
| ✅ Always use `FlatList` for lists >5 items | Never `.map()` on large datasets |
| ✅ `renderItem` must be `useCallback`-wrapped | Prevents item re-renders |
| ✅ Use `keyExtractor` with stable unique IDs | Never array index |
| ✅ Use `getItemLayout` when possible | Only when item heights are fixed |
| ❌ No `ScrollView` + `.map()` for feed data | Will freeze on real data |

---

## 6. TypeScript

| Rule | Detail |
|---|---|
| ✅ Strict mode always on | `tsconfig.json: "strict": true` |
| ✅ All shared types in `types/` | No inline type definitions in screen files |
| ✅ Props must be fully typed | No implicit `any` props |
| ❌ No `any` | Use `unknown`, generics, or proper interfaces |
| ❌ No `@ts-ignore` | Fix the type, don't silence it |

---

## 7. Project Structure

| Rule | Detail |
|---|---|
| ✅ `app/` = screens only | No logic, no components defined here |
| ✅ `components/` = pure reusable UI | Organized by domain: `ui/`, `feed/`, `profile/`, `auth/` |
| ✅ `hooks/` = all shared logic | `useAuthAnimation`, `useProfile`, etc. |
| ✅ `types/` = all interfaces and types | One file per domain |
| ✅ `data/` = mock data only | Replaced by hooks/services when API lands |
| ❌ No data defined in screen files | Move to `data/` or `hooks/` |
| ❌ No components defined in screen files | Move to `components/` |

---

## 8. Imports

| Rule | Detail |
|---|---|
| ✅ Use path aliases | `@components/ui/Button`, `@hooks/useAuthAnimation` |
| ❌ No deep relative imports | `../../components/Button` is banned |
| ✅ Group imports: RN → Expo → External → Internal | Consistent ordering |

---

## 9. Performance Anti-Patterns (Banned)

```tsx
// ❌ Inline function in JSX
<Button onPress={() => doSomething()} />

// ❌ Inline object in JSX
<View style={{ marginTop: 10 }} />

// ❌ Raw hex in JSX
<View className="bg-[#1E293B]" />  // use bg-primary or a token

// ❌ .map() on feed list
{feedData.map(item => <Card key={item.id} />)}

// ❌ Full store selection
const store = useUserStore();

// ❌ any type
const data: any = response;
```

---

## 10. API & Server State (When Backend Lands)

| Rule | Detail |
|---|---|
| ✅ TanStack Query for all API calls | `useQuery`, `useMutation` |
| ✅ Structured query keys | `['user', id]`, `['feed', page]` |
| ✅ Configure `staleTime` and `cacheTime` | Never leave defaults |
---

## 11. API Layer (`services/`)

```
services/
├── api.ts            ← Central HTTP helper (base URL, headers, error handling)
├── queries/          ← One file per domain, used inside useQuery
│   ├── userQueries.ts
│   ├── feedQueries.ts
│   └── opportunityQueries.ts
└── mutations/        ← One file per domain, used inside useMutation
    ├── userMutations.ts
    ├── postMutations.ts
    └── hiringMutations.ts
```

| Rule | Detail |
|---|---|
| ✅ `api.ts` is the only file that calls `fetch` | Everything goes through the central helper |
| ✅ Query files export plain async functions | `getUser(id: string): Promise<User>` |
| ✅ Mutation files export plain async functions | `updateProfile(data): Promise<void>` |
| ✅ `useQuery` / `useMutation` live in screens or hooks | Not inside components |
| ❌ No direct `fetch` or `axios` in components or screens | Always go through `services/` |
| ❌ No response data stored in Zustand | TanStack Query owns server state |

```ts
// services/api.ts
export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// services/queries/userQueries.ts
export const getUser = (id: string) => apiRequest<User>(`/users/${id}`);

// services/mutations/userMutations.ts
export const updateProfile = (data: UpdateProfilePayload) =>
  apiRequest<void>('/me', { method: 'PATCH', body: JSON.stringify(data) });
```

---

## 12. Zustand Stores (`store/`)

```
store/
├── modalStore.ts     ← Open/close modals + temp data (auto-cleaned on close)
├── globalStore.ts    ← App-wide UI state (loading, toasts, theme etc.)
└── authStore.ts      ← User session, token, logout
```

### `modalStore.ts` — Modal orchestration
```ts
type ModalStore = {
  activeModal: string | null;
  modalData: Record<string, unknown>;
  openModal: (name: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;  // always clears modalData on close
};
```
| Rule | Detail |
|---|---|
| ✅ All modals opened through `modalStore` | No local `useState` for modals |
| ✅ `closeModal()` always wipes `modalData` | No stale data between opens |
| ✅ `modalData` is typed per modal at the call site | Use `as` cast or discriminated union |
| ❌ No modal state in screen `useState` | Always global via store |

### `globalStore.ts` — Dynamic key-value state
```ts
type GlobalStore = {
  states: Record<string, unknown>;
  addState: (key: string, value: unknown) => void;    // first-time register
  updateState: (key: string, value: unknown) => void; // change existing
  removeState: (key: string) => void;                 // delete one key
  clearStates: () => void;                            // wipe all (e.g. on logout)
};
```
| Rule | Detail |
|---|---|
| ✅ Use `addState` for first registration | `updateState` for subsequent changes |
| ✅ Read via selector | `useGlobalStore(s => s.states['myKey'])` |
| ✅ Call `clearStates` on logout | Wipes all ephemeral app state |
| ❌ No server data in globalStore | TanStack Query owns that |
| ❌ No per-screen state here | Only truly global state |

---

## 13. Component Alignment & Layout

| Rule | Detail |
|---|---|
| ✅ **Always enforce Left-Aligned Design** | The app's visual structure relies on left-aligning headers, text, icons, and blocks. |
| ❌ Do not center headers or icons | E.g., Use `items-start` instead of `items-center` for block groups |
| ❌ No floating circle backgrounds | Icons should be plain, visually resting on the page without unnecessary rounded wrappers padding them out. |

---

## CORE AGENT RULE (Important for AI Assistants)
**ALWAYS review `PRD.md`, `task.md`, and `implementation_plan.md` using the file viewer tools before planning or making any significant changes.** This ensures you rely on updated, written documentation rather than hallucinated or stale context across long sessions.

---

## 14. Folder Conventions — Strict Boundaries

| Rule | Detail |
|---|---|
| ✅ `types/` is the ONLY place for TypeScript types/interfaces | One file per domain (`auth.ts`, `user.ts`, `feed.ts`). No inline type definitions in screens, hooks, or components |
| ✅ `validations/` is the ONLY place for Zod schemas and validation logic | One file per domain. Never define schemas inside screen or component files |
| ✅ `utils/` is the ONLY place for pure helper functions | Formatters, transformers, pickers, etc. No utility functions scattered in screens |
| ❌ No types defined outside `types/` | Move all interfaces and type aliases to the correct domain file in `types/` |
| ❌ No validation schemas defined outside `validations/` | Move all Zod schemas to the correct domain file in `validations/` |
| ❌ No utility functions defined outside `utils/` | Move all reusable helpers to `utils/` |

---

## 15. File Size & Cleanliness

| Rule | Detail |
|---|---|
| ✅ Every file must be under 400 lines | If a file exceeds 400 lines, extract components, hooks, or helpers |
| ✅ Prefer small, focused files | One concern per file |
| ❌ No `any` types anywhere in the codebase | Use `unknown`, generics, or create proper interfaces in `types/`. This is strictly enforced and non-negotiable |
| ❌ No `as any` type assertions | Use proper type narrowing or create interfaces |
