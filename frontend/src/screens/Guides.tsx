/** The guides (SPEC §6): they arrive with a later content batch; their outline comes in phase 9. */
import { Screen } from "../components/ui";

export function Guides() {
  return (
    <Screen title="Guides">
      <p className="text-muted">
        The two guides, on the tea families and on brewing well, arrive with a later batch of content. Each blend's page
        already has its own steps and sources.
      </p>
    </Screen>
  );
}
