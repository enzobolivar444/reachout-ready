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

- Keep primary household status and human-follow-up escalation as independent fields and derive summary counts from each; escalation must not replace an evacuation outcome.
- Normalize mock actions and future webhook updates through `applyEvent`; only voice and SMS events update last-contact metadata.
