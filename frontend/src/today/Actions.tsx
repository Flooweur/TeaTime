/**
 * What can be done with the day's tea (SPEC §7): Made it, then the rating (and the colleague's at
 * the office); Skip; Swap; Not for me; and Undo for 10 seconds after Made it or Skip.
 */
import { type BrewRecord, type PickRecord, RATINGS, type Rating, type State, type Tea } from "@teatime/core";
import { useState } from "react";
import { Button, CircleChoice, Notice } from "../components/ui";
import { ApiError } from "../lib/api";
import { newId, send } from "../lib/commands";
import { online } from "../lib/sync";
import { useUndo } from "./useUndo";

const REFUSED: Record<string, string> = {
  already_made: "It's already made: another device said so first.",
  swap_used: "This tea has had its swap.",
  packed: "The kit is packed: it can't be swapped.",
  nothing_else: "There's no other blend to swap to.",
  offline: "Swapping needs the server, which can't be reached now.",
};

const messageOf = (code: string, fallback: string) => REFUSED[code] ?? fallback;

/** The ratings of a made pick's brew. */
function Ratings({ brew }: { brew: BrewRecord }) {
  const rate = (field: "rating" | "colleagueRating") => (value: Rating) =>
    void send("brew.rated", { brew: brew.id, [field]: value === brew[field].value ? null : value });
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="label mb-1.5 text-sm">Your rating</p>
        <CircleChoice label="Your rating" values={RATINGS} value={brew.rating.value} onChange={rate("rating")} />
      </div>
      {brew.office && (
        <div>
          <p className="label mb-1.5 text-sm">Your colleague's</p>
          <CircleChoice
            label="Your colleague's rating"
            values={RATINGS}
            value={brew.colleagueRating.value}
            onChange={rate("colleagueRating")}
          />
        </div>
      )}
      {brew.rating.value === null && <p className="text-sm text-muted">Or rate it in Saturday's review.</p>}
    </div>
  );
}

export function PickActions({
  pick,
  state,
  date,
  cups,
  tea,
  blendCode,
}: {
  pick: PickRecord;
  state: State;
  /** The owner's date today: a brew's date. */
  date: string;
  cups: number;
  /** The tea Made it makes: the pick's, or the office's plain tea of a missed kit. */
  tea: Tea;
  blendCode: string | null;
}) {
  const { offer, offerUndo, undo } = useUndo();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const brew = pick.brew ? state.brews[pick.brew] : undefined;

  const madeIt = async () => {
    setMessage(null);
    const id = newId();
    const { result } = await send("brew.logged", { brew: id, tea, cups, date, pick: pick.date });
    if (!result.ok) return setMessage(messageOf(result.code, "That couldn't be logged."));
    offerUndo({ label: "Made it", run: () => send("brew.removed", { brew: id }) });
  };

  const skip = async () => {
    setMessage(null);
    const { result } = await send("pick.skipped", { date: pick.date });
    if (!result.ok) return setMessage(messageOf(result.code, "That couldn't be skipped."));
    offerUndo({ label: "Skip", run: () => send("pick.unskipped", { date: pick.date }) });
  };

  const swap = async () => {
    setMessage(null);
    setBusy(true);
    try {
      await online("POST", `picks/${pick.date}/swap`, { current: pick.tea });
    } catch (err) {
      setMessage(err instanceof ApiError ? messageOf(err.code, err.message) : "The swap failed.");
    } finally {
      setBusy(false);
    }
  };

  const notForMe = async () => {
    if (!blendCode) return;
    await send("blend.marked", { blend: blendCode, notForMe: true });
    setMessage("It won't be drawn again. Unmark it in the library to bring it back.");
  };

  const undoBar = offer && (
    <div className="flex items-center justify-between gap-3 rounded-well bg-sunk px-4 py-1" role="status">
      <span>{offer.label}: done.</span>
      <Button variant="quiet" onClick={() => void undo()}>
        Undo
      </Button>
    </div>
  );

  if (pick.status === "made") {
    return (
      <div className="flex flex-col gap-3">
        {undoBar}
        <p className="font-display text-xl font-semibold">
          Made{brew ? `, for ${brew.cups} ${brew.cups === 1 ? "cup" : "cups"}` : ""}.
        </p>
        {brew && <Ratings brew={brew} />}
        {message && <Notice tone="warn">{message}</Notice>}
      </div>
    );
  }

  if (pick.status === "skipped") {
    return (
      <div className="flex flex-col gap-3">
        {undoBar}
        <p className="text-muted">Skipped: this blend rests 7 days.</p>
        {message && <Notice tone="warn">{message}</Notice>}
      </div>
    );
  }

  const packed = pick.type === "office" && pick.packedAt !== null;
  const swappable = pick.tea.kind === "blend" ? !packed && pick.swappedFrom === null : true;
  return (
    <div className="flex flex-col gap-3">
      {undoBar}
      <Button variant="primary" onClick={() => void madeIt()}>
        Made it
      </Button>
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => void skip()}>Skip</Button>
        <Button onClick={() => void swap()} disabled={busy || !swappable}>
          {busy ? "Swapping…" : "Swap"}
        </Button>
      </div>
      {blendCode && (
        <Button variant="quiet" onClick={() => void notForMe()} className="self-start">
          Not for me
        </Button>
      )}
      {message && <Notice tone="warn">{message}</Notice>}
    </div>
  );
}
