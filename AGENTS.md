<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Use TanStack Start file routes and a shared public website module for localized pages; this preserves the platform router and consistent navigation.
- Keep the public-first phase separate from secure applications and payments; no financial transactions or application approvals are simulated.
- Use Decimal arithmetic in a browser-safe loan module with unit tests; illustrative estimates must avoid uncontrolled floating-point arithmetic.
- Serve uploaded media through imported Lovable asset pointers; keep only the small derived favicon in public.
