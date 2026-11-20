/** The content's files as the compiler reads them, and what it says is wrong with them. */

/** A file of the content: its path from content/, with `/`, and its text. */
export interface ContentFile {
  readonly path: string;
  readonly text: string;
}

/** What's wrong, and where: `blends/017-moroccan-mint.yaml: brew.temp_c: must be >= 0`. */
export interface Problem {
  readonly file: string;
  readonly message: string;
}

/** Every file the bundle is made of. The scripts read them from disk; tests pass their own. */
export interface ContentFiles {
  /** blends/NNN-slug.yaml */
  readonly blends: readonly ContentFile[];
  /** ingredients/<id>.yaml */
  readonly ingredients: readonly ContentFile[];
  /** shops.yaml */
  readonly shops: ContentFile;
  /** tea-types.yaml */
  readonly teaTypes: ContentFile;
  /** guides/<id>.md */
  readonly guides: readonly ContentFile[];
}
