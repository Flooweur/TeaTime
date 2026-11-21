CREATE TABLE `applied_commands` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`received_at` integer NOT NULL,
	`result` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `away_periods` (
	`id` text PRIMARY KEY NOT NULL,
	`seq` integer NOT NULL,
	`from_date` text NOT NULL,
	`to_date` text NOT NULL,
	CONSTRAINT "away_periods_range" CHECK("away_periods"."from_date" <= "away_periods"."to_date")
);
--> statement-breakpoint
CREATE TABLE `blend_marks` (
	`code` text PRIMARY KEY NOT NULL,
	`favourite` integer NOT NULL,
	`favourite_at` integer NOT NULL,
	`make_again` integer NOT NULL,
	`make_again_at` integer NOT NULL,
	`not_for_me` integer NOT NULL,
	`not_for_me_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `brews` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`at` integer NOT NULL,
	`tea_kind` text NOT NULL,
	`blend` text,
	`plain_tea` text,
	`cups` integer NOT NULL,
	`pick` text,
	`office` integer NOT NULL,
	`rating` integer,
	`rating_at` integer NOT NULL,
	`colleague_rating` integer,
	`colleague_rating_at` integer NOT NULL,
	`takes` text NOT NULL,
	CONSTRAINT "brews_tea" CHECK(("brews"."tea_kind" = 'blend' and "brews"."blend" is not null and "brews"."plain_tea" is null)
       or ("brews"."tea_kind" = 'plain' and "brews"."plain_tea" is not null and "brews"."blend" is null)),
	CONSTRAINT "brews_cups" CHECK("brews"."cups" >= 1),
	CONSTRAINT "brews_rating" CHECK("brews"."rating" is null or "brews"."rating" between 1 and 5),
	CONSTRAINT "brews_colleague_rating" CHECK("brews"."colleague_rating" is null or "brews"."colleague_rating" between 1 and 5)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brews_pick_unique` ON `brews` (`pick`);--> statement-breakpoint
CREATE TABLE `day_overrides` (
	`date` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	CONSTRAINT "day_overrides_type" CHECK("day_overrides"."type" in ('office', 'home'))
);
--> statement-breakpoint
CREATE TABLE `meta` (
	`key` text PRIMARY KEY NOT NULL,
	`value` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`kind` text NOT NULL,
	`date` text NOT NULL,
	`status` text NOT NULL,
	`attempts` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`sent_at` integer,
	PRIMARY KEY(`kind`, `date`),
	CONSTRAINT "notifications_kind" CHECK("notifications"."kind" in ('evening', 'morning', 'review')),
	CONSTRAINT "notifications_status" CHECK("notifications"."status" in ('sending', 'sent', 'failed'))
);
--> statement-breakpoint
CREATE TABLE `pantry` (
	`id` text PRIMARY KEY NOT NULL,
	`have` integer NOT NULL,
	`have_at` integer NOT NULL,
	`amount` real,
	`amount_at` integer NOT NULL,
	`opened_on` text,
	`opened_on_at` integer NOT NULL,
	`at_office` integer NOT NULL,
	`at_office_at` integer NOT NULL,
	CONSTRAINT "pantry_amount" CHECK("pantry"."amount" is null or "pantry"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE `picks` (
	`date` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`tea_kind` text NOT NULL,
	`blend` text,
	`plain_tea` text,
	`source` text NOT NULL,
	`unlock` text,
	`attempt` integer NOT NULL,
	`drawn_at` integer NOT NULL,
	`swapped_from` text,
	`swapped_at` integer,
	`status` text NOT NULL,
	`status_at` integer NOT NULL,
	`packed_at` integer,
	`packed_cups` integer,
	`brew` text,
	CONSTRAINT "picks_type" CHECK("picks"."type" in ('office', 'home')),
	CONSTRAINT "picks_tea" CHECK(("picks"."tea_kind" = 'blend' and "picks"."blend" is not null and "picks"."plain_tea" is null)
       or ("picks"."tea_kind" = 'plain' and "picks"."plain_tea" is not null and "picks"."blend" is null)
       or ("picks"."tea_kind" = 'none' and "picks"."blend" is null and "picks"."plain_tea" is null)),
	CONSTRAINT "picks_source" CHECK("picks"."source" in ('draw', 'fallback', 'no-kit')),
	CONSTRAINT "picks_status" CHECK("picks"."status" in ('pending', 'made', 'skipped', 'cancelled')),
	CONSTRAINT "picks_attempt" CHECK("picks"."attempt" >= 0),
	CONSTRAINT "picks_packed" CHECK(("picks"."packed_at" is null) = ("picks"."packed_cups" is null))
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`created_at` integer NOT NULL,
	`last_success_at` integer,
	`failures` integer DEFAULT 0 NOT NULL,
	`disabled_at` integer,
	CONSTRAINT "push_subscriptions_failures" CHECK("push_subscriptions"."failures" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `push_subscriptions_endpoint_unique` ON `push_subscriptions` (`endpoint`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
