/**
 * The screens, as routes in code (SPEC §3.1). A push's link opens Today with `?date=…&from=push`
 * (SPEC §2.7): that day's home blend then shows whatever the time.
 */
import { type RouterHistory, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { Shell } from "./components/Shell";
import { Screen } from "./components/ui";
import { BlendPage } from "./screens/BlendPage";
import { Guides } from "./screens/Guides";
import { Library } from "./screens/Library";
import { Pantry } from "./screens/Pantry";
import { PantryItem } from "./screens/PantryItem";
import { Settings } from "./screens/Settings";
import { Review } from "./review/Review";
import { Today } from "./today/Today";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const root = createRootRoute({
  component: Shell,
  notFoundComponent: () => (
    <Screen title="Not found">
      <p>This page doesn't exist.</p>
    </Screen>
  ),
});

/** A push's link: the day it is for, and that it came from a push. */
const pushSearch = (search: Record<string, unknown>): { date?: string; from?: "push" } => ({
  ...(typeof search.date === "string" && DATE.test(search.date) ? { date: search.date } : {}),
  ...(search.from === "push" ? { from: "push" as const } : {}),
});

/** Today, at `/` and at `/today`, which the pushes link to (core's notifications.ts). */
function TodayRoute() {
  const { date, from } = today.useSearch();
  return <Today fromPush={from === "push" && date ? date : null} />;
}

const today = createRoute({ getParentRoute: () => root, path: "/", validateSearch: pushSearch, component: TodayRoute });

const todayFromPush = createRoute({
  getParentRoute: () => root,
  path: "/today",
  validateSearch: pushSearch,
  component: function TodayLinkRoute() {
    const { date, from } = todayFromPush.useSearch();
    return <Today fromPush={from === "push" && date ? date : null} />;
  },
});

/** The weekly review; the Saturday push links to `/review?date=…&from=push`. */
const review = createRoute({
  getParentRoute: () => root,
  path: "/review",
  validateSearch: pushSearch,
  component: function ReviewRoute() {
    const { date } = review.useSearch();
    return <Review date={date ?? null} />;
  },
});

const blend = createRoute({
  getParentRoute: () => root,
  path: "/blend/$code",
  component: function BlendRoute() {
    const { code } = blend.useParams();
    return <BlendPage key={code} code={code} />;
  },
});

const pantryItem = createRoute({
  getParentRoute: () => root,
  path: "/pantry/$id",
  component: function PantryItemRoute() {
    const { id } = pantryItem.useParams();
    return <PantryItem key={id} id={id} />;
  },
});

const routeTree = root.addChildren([
  today,
  todayFromPush,
  review,
  createRoute({ getParentRoute: () => root, path: "/pantry", component: Pantry }),
  pantryItem,
  createRoute({ getParentRoute: () => root, path: "/library", component: Library }),
  blend,
  createRoute({ getParentRoute: () => root, path: "/guides", component: Guides }),
  createRoute({ getParentRoute: () => root, path: "/settings", component: Settings }),
]);

/** The app's router; a test passes a memory history. */
export const createAppRouter = (history?: RouterHistory) =>
  createRouter({ routeTree, scrollRestoration: true, ...(history ? { history } : {}) });

export const router = createAppRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
