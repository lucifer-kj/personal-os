# Personal OS --- Supabase Database Architecture & Specification

**Document type:** Database-layer implementation specification\
**Product:** Personal OS (private, extensible personal productivity
workspace)\
**Backend platform:** Supabase\
**Primary database:** PostgreSQL\
**Status:** Architecture specification; implementation should be
delivered through versioned migrations\
**Audience:** AI coding agents, backend engineers, and maintainers

------------------------------------------------------------------------

## 1. Purpose and Scope

This document defines the database layer for Personal OS. It is intended
to be the authoritative reference for an AI coding agent implementing or
extending the application's data model.

Personal OS is a single-user-first, modular productivity workspace that
may include:

-   Dashboard and daily overview
-   Tasks, task lists, projects, and dependencies
-   Goals and milestones
-   Calendar events and time blocking
-   Time tracking and focus sessions
-   Notes, journal, concepts, and knowledge graph
-   Meetings and action items
-   Content studio, content calendar, and publishing queue
-   Inbox and quick capture
-   Reports and analytics
-   AI assistant, AI memories, semantic search, and RAG
-   Automations, scheduled jobs, and background work
-   Attachments, exports, and integrations
-   User preferences and application settings

The database must be relational-first, extensible, portable, and
maintainable. PostgreSQL is the source of truth. Specialized
capabilities should be implemented through PostgreSQL extensions or
Supabase services when appropriate.

### In scope

-   PostgreSQL schema and table definitions
-   Entity relationships and ownership rules
-   Constraints, indexes, and data integrity
-   Row Level Security (RLS)
-   Vector storage and semantic retrieval metadata
-   Database functions and triggers
-   Cron schedules and queue metadata
-   Supabase Storage metadata
-   Migration and extension conventions
-   Data access and lifecycle rules

### Out of scope

-   Frontend UI and component specifications
-   Full API route definitions
-   Prompt engineering and AI-agent behavior
-   Complete third-party integration implementations
-   Billing or multi-tenant SaaS functionality
-   Detailed deployment and infrastructure configuration

------------------------------------------------------------------------

## 2. Architectural Decisions

### 2.1 Primary data store

Use **Supabase PostgreSQL** as the primary relational database.

Do not introduce a separate relational database for each feature. Tasks,
projects, goals, notes, meetings, calendar, content, and reports must
share the same PostgreSQL database and use relational keys.

### 2.2 Supabase services

Use the services as follows:

  -----------------------------------------------------------------------
  Capability                          Preferred implementation
  ----------------------------------- -----------------------------------
  Relational data                     Supabase PostgreSQL

  Authentication                      Supabase Auth

  Authorization                       PostgreSQL RLS

  AI embeddings / vector similarity   `pgvector` extension

  Files and attachments               Supabase Storage

  Realtime updates                    Supabase Realtime, selectively
                                      enabled

  Scheduled database jobs             `pg_cron` / Supabase Cron

  Background queue                    `pgmq` where available and
                                      justified

  Server-side operations              Supabase Edge Functions and
                                      PostgreSQL functions

  Search                              PostgreSQL full-text search +
                                      `pgvector` semantic search

  Analytics                           SQL views, aggregate tables, and
                                      scheduled rollups

  Database changes                    Supabase CLI migrations
  -----------------------------------------------------------------------

### 2.3 Local-first and cloud database

The planned authoritative database is Supabase PostgreSQL. The frontend
may cache or optimistically stage data locally, but local browser
storage must not silently become a competing source of truth.

If offline-first synchronization is added in the future, it must be
designed explicitly with conflict resolution, mutation queues, and sync
cursors. Do not claim that ordinary IndexedDB caching provides
multi-device synchronization.

### 2.4 Single-user-first, ownership-ready

The application is initially personal and single-user. However:

-   Every user-owned record must include `user_id`.
-   `user_id` must reference `auth.users(id)` or an internal profile
    linked to it.
-   Data access must be enforced with RLS.
-   Avoid hard-coded user UUIDs in schema, seed files, or functions.
-   Do not build complex organization, tenant, role, or sharing models
    unless a concrete multi-user requirement appears.

### 2.5 UUID identifiers

Use `uuid` primary keys with `gen_random_uuid()` defaults for
application entities, except when a Supabase Auth user ID is the natural
ownership identifier.

### 2.6 Timestamp conventions

-   Store timestamps as `timestamptz` in UTC.
-   Use `created_at` and `updated_at` on mutable entities.
-   Store user timezone in the profile/preferences layer as an IANA
    timezone identifier (e.g. `Asia/Kolkata`).
-   Date-only concepts such as journal day or due date may use `date`
    when time-of-day is not meaningful.
-   Never store timezone-less timestamps for real-world events.

------------------------------------------------------------------------

## 3. Database Namespace and Naming

Use `public` for application tables unless a dedicated schema is
intentionally introduced.

Use `snake_case` for tables, columns, indexes, constraints, and
functions.

Recommended naming:

-   Tables: plural nouns, e.g. `tasks`, `projects`, `notes`
-   Primary key: `id`
-   Foreign keys: `<referenced_entity>_id`, e.g. `project_id`
-   Ownership: `user_id`
-   Boolean fields: `is_...` or `has_...`
-   Timestamp fields: `created_at`, `updated_at`, `completed_at`
-   Indexes: `idx_<table>_<columns>`
-   Unique constraints: `uq_<table>_<columns>`
-   Check constraints: `chk_<table>_<meaning>`
-   Functions: `fn_<verb>_<noun>` or descriptive PostgreSQL function
    names

Use explicit foreign keys and constraints. Do not rely on frontend
validation for data integrity.

------------------------------------------------------------------------

## 4. Core Shared Tables

These tables support common functionality across all modules.

## 4.1 `profiles`

Application profile corresponding to a Supabase Auth user.

  Column           Type            Rules                        Description
  ---------------- --------------- ---------------------------- -----------------------
  `id`             `uuid`          PK, FK to `auth.users(id)`   User identifier
  `display_name`   `text`          nullable                     Display name
  `avatar_path`    `text`          nullable                     Supabase Storage path
  `timezone`       `text`          NOT NULL, default `UTC`      IANA timezone
  `locale`         `text`          NOT NULL, default `en`       UI locale
  `created_at`     `timestamptz`   NOT NULL                     Creation time
  `updated_at`     `timestamptz`   NOT NULL                     Last update

The profile row should be created when a user registers, using a
controlled trigger or server-side registration flow.

## 4.2 `user_preferences`

Stores user-level preferences that are not part of profile identity.

  ----------------------------------------------------------------------------------
  Column                       Type              Rules             Description
  ---------------------------- ----------------- ----------------- -----------------
  `id`                         `uuid`            PK                Row identifier

  `user_id`                    `uuid`            FK, NOT NULL,     Owner
                                                 UNIQUE            

  `theme`                      `text`            NOT NULL, default `light`, `dark`,
                                                 `system`          `system`

  `start_of_week`              `smallint`        NOT NULL, default ISO-style weekday
                                                 `1`               index; validate
                                                                   range

  `default_dashboard_layout`   `jsonb`           NOT NULL, default User widget
                                                 `{}`              layout

  `notification_preferences`   `jsonb`           NOT NULL, default Notification
                                                 `{}`              options

  `feature_preferences`        `jsonb`           NOT NULL, default Module
                                                 `{}`              preferences

  `created_at`                 `timestamptz`     NOT NULL          Creation time

  `updated_at`                 `timestamptz`     NOT NULL          Last update
  ----------------------------------------------------------------------------------

Use JSONB only for flexible preference structures. Important relational
entities must not be hidden inside JSONB.

## 4.3 `tags`

User-created labels reusable across supported modules.

  Column         Type            Rules          Description
  -------------- --------------- -------------- -----------------------
  `id`           `uuid`          PK             Tag ID
  `user_id`      `uuid`          FK, NOT NULL   Owner
  `name`         `text`          NOT NULL       Tag name
  `color`        `text`          nullable       UI color token or hex
  `created_at`   `timestamptz`   NOT NULL       Creation time

Unique constraint: `(user_id, lower(name))`.

## 4.4 `entity_tags`

Join table for tagging supported entities.

  Column          Type            Rules                    Description
  --------------- --------------- ------------------------ ----------------------
  `id`            `uuid`          PK                       Row ID
  `user_id`       `uuid`          FK, NOT NULL             Owner
  `tag_id`        `uuid`          FK to `tags`, NOT NULL   Tag
  `entity_type`   `text`          NOT NULL                 Entity discriminator
  `entity_id`     `uuid`          NOT NULL                 Entity UUID
  `created_at`    `timestamptz`   NOT NULL                 Creation time

Unique constraint: `(tag_id, entity_type, entity_id)`.

**Important:** this is a polymorphic relation, so PostgreSQL cannot
create a conventional FK from `entity_id` to every possible target
table. Use it only for non-critical associations such as tags. Validate
supported `entity_type` values in a check constraint and/or database
function. For critical relations, use dedicated join tables with real
foreign keys.

------------------------------------------------------------------------

## 5. Tasks and Work Management

## 5.1 `projects`

  -----------------------------------------------------------------------
  Column            Type              Rules             Description
  ----------------- ----------------- ----------------- -----------------
  `id`              `uuid`            PK                Project ID

  `user_id`         `uuid`            FK, NOT NULL      Owner

  `name`            `text`            NOT NULL          Project name

  `description`     `text`            nullable          Description

  `status`          `text`            NOT NULL, default `planned`,
                                      `active`          `active`,
                                                        `on_hold`,
                                                        `completed`,
                                                        `archived`

  `priority`        `text`            NOT NULL, default `low`, `medium`,
                                      `medium`          `high`, `urgent`

  `start_date`      `date`            nullable          Planned start

  `due_date`        `date`            nullable          Target deadline

  `completed_at`    `timestamptz`     nullable          Completion
                                                        timestamp

  `color`           `text`            nullable          UI color

  `icon`            `text`            nullable          Icon key

  `sort_order`      `numeric`         NOT NULL, default User-defined
                                      `0`               order

  `created_at`      `timestamptz`     NOT NULL          Creation time

  `updated_at`      `timestamptz`     NOT NULL          Last update

  `deleted_at`      `timestamptz`     nullable          Soft delete
  -----------------------------------------------------------------------

## 5.2 `task_lists`

Optional user-defined lists or sections within a project or standalone
workspace.

  Column         Type            Rules                        Description
  -------------- --------------- ---------------------------- ----------------
  `id`           `uuid`          PK                           List ID
  `user_id`      `uuid`          FK, NOT NULL                 Owner
  `project_id`   `uuid`          FK to `projects`, nullable   Parent project
  `name`         `text`          NOT NULL                     List name
  `sort_order`   `numeric`       NOT NULL, default `0`        Ordering
  `created_at`   `timestamptz`   NOT NULL                     Creation
  `updated_at`   `timestamptz`   NOT NULL                     Update

## 5.3 `tasks`

Central work item table.

  ----------------------------------------------------------------------------
  Column                 Type              Rules             Description
  ---------------------- ----------------- ----------------- -----------------
  `id`                   `uuid`            PK                Task ID

  `user_id`              `uuid`            FK, NOT NULL      Owner

  `project_id`           `uuid`            FK to `projects`, Project
                                           nullable          

  `task_list_id`         `uuid`            FK to             List/section
                                           `task_lists`,     
                                           nullable          

  `parent_task_id`       `uuid`            FK to `tasks`,    Parent task for
                                           nullable          subtasks

  `title`                `text`            NOT NULL          Task title

  `description`          `text`            nullable          Description

  `status`               `text`            NOT NULL, default `inbox`, `todo`,
                                           `todo`            `in_progress`,
                                                             `blocked`,
                                                             `completed`,
                                                             `cancelled`

  `priority`             `text`            NOT NULL, default `low`, `medium`,
                                           `medium`          `high`, `urgent`

  `due_at`               `timestamptz`     nullable          Deadline

  `due_date`             `date`            nullable          Date-only
                                                             deadline if
                                                             needed

  `scheduled_start_at`   `timestamptz`     nullable          Planned time
                                                             block start

  `scheduled_end_at`     `timestamptz`     nullable          Planned time
                                                             block end

  `estimated_minutes`    `integer`         nullable, \>= 0   Estimate

  `actual_minutes`       `integer`         nullable, \>= 0   Optional cached
                                                             total

  `completed_at`         `timestamptz`     nullable          Completion time

  `is_recurring`         `boolean`         NOT NULL, default Recurrence marker
                                           `false`           

  `recurrence_rule`      `text`            nullable          RRULE or
                                                             app-defined
                                                             recurrence

  `source_type`          `text`            nullable          `manual`,
                                                             `inbox`,
                                                             `meeting`,
                                                             `automation`,
                                                             `ai`

  `source_id`            `uuid`            nullable          Origin record;
                                                             polymorphic,
                                                             non-critical

  `sort_order`           `numeric`         NOT NULL, default Ordering
                                           `0`               

  `created_at`           `timestamptz`     NOT NULL          Creation

  `updated_at`           `timestamptz`     NOT NULL          Update

  `deleted_at`           `timestamptz`     nullable          Soft delete
  ----------------------------------------------------------------------------

Constraints: - `scheduled_end_at > scheduled_start_at` when both are
set. - `parent_task_id <> id`. - A task's project and task list must
belong to the same `user_id`. - Status and priority must be validated
using check constraints or lookup tables. - `actual_minutes` should
preferably be derived from time entries; if cached, update consistently.

## 5.4 `task_dependencies`

  ------------------------------------------------------------------------------
  Column                 Type              Rules               Description
  ---------------------- ----------------- ------------------- -----------------
  `id`                   `uuid`            PK                  Relation ID

  `user_id`              `uuid`            FK, NOT NULL        Owner

  `task_id`              `uuid`            FK to `tasks`, NOT  Dependent task
                                           NULL                

  `depends_on_task_id`   `uuid`            FK to `tasks`, NOT  Prerequisite
                                           NULL                

  `dependency_type`      `text`            NOT NULL, default   Dependency kind
                                           `finish_to_start`   

  `created_at`           `timestamptz`     NOT NULL            Creation
  ------------------------------------------------------------------------------

Unique constraint: `(task_id, depends_on_task_id)`. Prevent
self-dependency and ensure both tasks are owned by the same user. Cycle
prevention should be enforced by application/service logic or a
carefully designed recursive database validation.

------------------------------------------------------------------------

## 6. Goals and Milestones

## 6.1 `goals`

  --------------------------------------------------------------------------
  Column               Type              Rules             Description
  -------------------- ----------------- ----------------- -----------------
  `id`                 `uuid`            PK                Goal ID

  `user_id`            `uuid`            FK, NOT NULL      Owner

  `parent_goal_id`     `uuid`            FK to `goals`,    Goal hierarchy
                                         nullable          

  `title`              `text`            NOT NULL          Goal title

  `description`        `text`            nullable          Details

  `status`             `text`            NOT NULL, default `draft`,
                                         `active`          `active`,
                                                           `paused`,
                                                           `completed`,
                                                           `abandoned`

  `goal_type`          `text`            NOT NULL, default `outcome`,
                                         `outcome`         `habit`,
                                                           `metric`,
                                                           `project`

  `start_date`         `date`            nullable          Start

  `target_date`        `date`            nullable          Target

  `metric_name`        `text`            nullable          e.g. "hours",
                                                           "posts",
                                                           "revenue"

  `target_value`       `numeric`         nullable          Target quantity

  `current_value`      `numeric`         nullable          Current quantity

  `unit`               `text`            nullable          Unit

  `progress_percent`   `numeric`         nullable, 0--100  Optional
                                                           cached/explicit
                                                           progress

  `completed_at`       `timestamptz`     nullable          Completion

  `created_at`         `timestamptz`     NOT NULL          Creation

  `updated_at`         `timestamptz`     NOT NULL          Update
  --------------------------------------------------------------------------

Progress should be derived from linked milestones or metrics where
feasible. Avoid multiple competing sources of truth for progress.

## 6.2 `goal_milestones`

  -----------------------------------------------------------------------
  Column            Type              Rules             Description
  ----------------- ----------------- ----------------- -----------------
  `id`              `uuid`            PK                Milestone ID

  `user_id`         `uuid`            FK, NOT NULL      Owner

  `goal_id`         `uuid`            FK to `goals`,    Goal
                                      NOT NULL          

  `title`           `text`            NOT NULL          Milestone

  `description`     `text`            nullable          Details

  `status`          `text`            NOT NULL, default `pending`,
                                      `pending`         `completed`,
                                                        `skipped`

  `target_date`     `date`            nullable          Target

  `completed_at`    `timestamptz`     nullable          Completion

  `sort_order`      `numeric`         NOT NULL, default Ordering
                                      `0`               

  `created_at`      `timestamptz`     NOT NULL          Creation

  `updated_at`      `timestamptz`     NOT NULL          Update
  -----------------------------------------------------------------------

## 6.3 `goal_tasks`

Explicit many-to-many association between goals and tasks.

  Column         Type            Rules                    Description
  -------------- --------------- ------------------------ -------------
  `goal_id`      `uuid`          FK to `goals`, PK part   Goal
  `task_id`      `uuid`          FK to `tasks`, PK part   Task
  `user_id`      `uuid`          FK, NOT NULL             Owner
  `created_at`   `timestamptz`   NOT NULL                 Creation

Primary key: `(goal_id, task_id)`.

------------------------------------------------------------------------

## 7. Calendar, Meetings, and Time Tracking

## 7.1 `calendar_events`

General-purpose calendar event table. Events may be personal blocks,
meetings, reminders, or externally sourced events.

  -------------------------------------------------------------------------
  Column              Type              Rules             Description
  ------------------- ----------------- ----------------- -----------------
  `id`                `uuid`            PK                Event ID

  `user_id`           `uuid`            FK, NOT NULL      Owner

  `title`             `text`            NOT NULL          Event title

  `description`       `text`            nullable          Details

  `event_type`        `text`            NOT NULL, default `personal`,
                                        `personal`        `focus`,
                                                          `meeting`,
                                                          `reminder`,
                                                          `external`

  `start_at`          `timestamptz`     NOT NULL          Start

  `end_at`            `timestamptz`     NOT NULL          End

  `all_day`           `boolean`         NOT NULL, default All-day flag
                                        `false`           

  `timezone`          `text`            nullable          Event timezone

  `location`          `text`            nullable          Location

  `project_id`        `uuid`            FK to `projects`, Project context
                                        nullable          

  `task_id`           `uuid`            FK to `tasks`,    Related task
                                        nullable          

  `meeting_id`        `uuid`            FK to `meetings`, Related meeting
                                        nullable          

  `source_provider`   `text`            nullable          External calendar
                                                          provider

  `source_event_id`   `text`            nullable          Provider event ID

  `created_at`        `timestamptz`     NOT NULL          Creation

  `updated_at`        `timestamptz`     NOT NULL          Update
  -------------------------------------------------------------------------

Constraint: `end_at > start_at`. External event uniqueness should use
`(user_id, source_provider, source_event_id)` when these fields are
present.

Recurring events should use a recurrence definition and separately
materialized occurrences only when needed. Do not generate infinite
event rows.

## 7.2 `meetings`

  ------------------------------------------------------------------------------------
  Column                      Type              Rules                Description
  --------------------------- ----------------- -------------------- -----------------
  `id`                        `uuid`            PK                   Meeting ID

  `user_id`                   `uuid`            FK, NOT NULL         Owner

  `title`                     `text`            NOT NULL             Meeting title

  `description`               `text`            nullable             Purpose

  `status`                    `text`            NOT NULL, default    `scheduled`,
                                                `scheduled`          `completed`,
                                                                     `cancelled`

  `start_at`                  `timestamptz`     nullable             Start

  `end_at`                    `timestamptz`     nullable             End

  `location`                  `text`            nullable             Location

  `meeting_url`               `text`            nullable             URL

  `project_id`                `uuid`            FK to `projects`,    Project
                                                nullable             

  `calendar_event_id`         `uuid`            FK to                Calendar event
                                                `calendar_events`,   
                                                nullable             

  `agenda`                    `jsonb`           NOT NULL, default    Ordered agenda
                                                `[]`                 items

  `summary`                   `text`            nullable             Meeting summary

  `transcript_storage_path`   `text`            nullable             Storage path;
                                                                     avoid storing
                                                                     large transcripts
                                                                     inline

  `created_at`                `timestamptz`     NOT NULL             Creation

  `updated_at`                `timestamptz`     NOT NULL             Update
  ------------------------------------------------------------------------------------

## 7.3 `meeting_action_items`

  -----------------------------------------------------------------------
  Column            Type              Rules             Description
  ----------------- ----------------- ----------------- -----------------
  `id`              `uuid`            PK                Action ID

  `user_id`         `uuid`            FK, NOT NULL      Owner

  `meeting_id`      `uuid`            FK to `meetings`, Meeting
                                      NOT NULL          

  `task_id`         `uuid`            FK to `tasks`,    Task created from
                                      nullable          action

  `description`     `text`            NOT NULL          Action

  `status`          `text`            NOT NULL, default `open`,
                                      `open`            `completed`,
                                                        `dismissed`

  `due_at`          `timestamptz`     nullable          Due

  `created_at`      `timestamptz`     NOT NULL          Creation

  `updated_at`      `timestamptz`     NOT NULL          Update
  -----------------------------------------------------------------------

## 7.4 `time_entries`

Durable records of tracked time.

  --------------------------------------------------------------------------
  Column               Type              Rules             Description
  -------------------- ----------------- ----------------- -----------------
  `id`                 `uuid`            PK                Entry ID

  `user_id`            `uuid`            FK, NOT NULL      Owner

  `task_id`            `uuid`            FK to `tasks`,    Related task
                                         nullable          

  `project_id`         `uuid`            FK to `projects`, Related project
                                         nullable          

  `goal_id`            `uuid`            FK to `goals`,    Related goal
                                         nullable          

  `description`        `text`            nullable          Activity
                                                           description

  `started_at`         `timestamptz`     NOT NULL          Start

  `ended_at`           `timestamptz`     nullable          End

  `duration_seconds`   `integer`         nullable, \>= 0   Calculated
                                                           duration

  `entry_type`         `text`            NOT NULL, default `focus`,
                                         `focus`           `manual`,
                                                           `break`,
                                                           `meeting`

  `is_billable`        `boolean`         NOT NULL, default Optional billing
                                         `false`           flag

  `created_at`         `timestamptz`     NOT NULL          Creation

  `updated_at`         `timestamptz`     NOT NULL          Update
  --------------------------------------------------------------------------

An active timer is represented by an entry with `ended_at IS NULL`.
Enforce at most one active timer per user with a partial unique index.
Duration must be calculated consistently, preferably at stop time.

## 7.5 `focus_sessions`

Optional session-specific metadata beyond the base time entry.

  ----------------------------------------------------------------------------------
  Column                       Type              Rules             Description
  ---------------------------- ----------------- ----------------- -----------------
  `id`                         `uuid`            PK                Session ID

  `user_id`                    `uuid`            FK, NOT NULL      Owner

  `time_entry_id`              `uuid`            FK to             Time record
                                                 `time_entries`,   
                                                 UNIQUE, NOT NULL  

  `session_mode`               `text`            NOT NULL, default `deep_work`,
                                                 `deep_work`       `pomodoro`,
                                                                   `custom`

  `planned_duration_seconds`   `integer`         nullable          Planned duration

  `interruption_count`         `integer`         NOT NULL, default Interruptions
                                                 `0`               

  `session_rating`             `smallint`        nullable, 1--5    Self-rating

  `notes`                      `text`            nullable          Session
                                                                   reflection

  `created_at`                 `timestamptz`     NOT NULL          Creation
  ----------------------------------------------------------------------------------

------------------------------------------------------------------------

## 8. Notes, Journal, Concepts, and Knowledge Graph

## 8.1 `notes`

Primary note entity.

  ------------------------------------------------------------------------
  Column             Type              Rules             Description
  ------------------ ----------------- ----------------- -----------------
  `id`               `uuid`            PK                Note ID

  `user_id`          `uuid`            FK, NOT NULL      Owner

  `title`            `text`            NOT NULL, default Note title
                                       empty string      

  `content`          `text`            nullable          Tiptap JSON
                                                         serialized as
                                                         text or Markdown

  `content_format`   `text`            NOT NULL, default `tiptap_json`,
                                       `tiptap_json`     `markdown`,
                                                         `plain_text`

  `note_type`        `text`            NOT NULL, default `standard`,
                                       `standard`        `meeting`,
                                                         `concept`,
                                                         `project`,
                                                         `reference`

  `project_id`       `uuid`            FK to `projects`, Related project
                                       nullable          

  `is_pinned`        `boolean`         NOT NULL, default Pin
                                       `false`           

  `is_archived`      `boolean`         NOT NULL, default Archive
                                       `false`           

  `created_at`       `timestamptz`     NOT NULL          Creation

  `updated_at`       `timestamptz`     NOT NULL          Update

  `deleted_at`       `timestamptz`     nullable          Soft delete
  ------------------------------------------------------------------------

If notes become large or versioned, introduce a separate `note_versions`
table. Do not add versioning until the feature requires it.

## 8.2 `note_links`

Explicit relations between notes and other notes.

  ------------------------------------------------------------------------
  Column             Type              Rules             Description
  ------------------ ----------------- ----------------- -----------------
  `id`               `uuid`            PK                Link ID

  `user_id`          `uuid`            FK, NOT NULL      Owner

  `source_note_id`   `uuid`            FK to `notes`,    Source
                                       NOT NULL          

  `target_note_id`   `uuid`            FK to `notes`,    Target
                                       NOT NULL          

  `link_type`        `text`            NOT NULL, default `related`,
                                       `related`         `references`,
                                                         `derived_from`

  `created_at`       `timestamptz`     NOT NULL          Creation
  ------------------------------------------------------------------------

Prevent self-links and duplicate directed links.

## 8.3 `journal_entries`

  -----------------------------------------------------------------------
  Column            Type              Rules             Description
  ----------------- ----------------- ----------------- -----------------
  `id`              `uuid`            PK                Journal ID

  `user_id`         `uuid`            FK, NOT NULL      Owner

  `entry_date`      `date`            NOT NULL          User-local
                                                        journal date

  `title`           `text`            nullable          Title

  `content`         `text`            nullable          Journal content

  `mood`            `text`            nullable          User-defined mood

  `energy_level`    `smallint`        nullable, 1--5    Energy

  `reflection`      `text`            nullable          Reflection

  `gratitude`       `jsonb`           NOT NULL, default Structured
                                      `[]`              gratitude list

  `created_at`      `timestamptz`     NOT NULL          Creation

  `updated_at`      `timestamptz`     NOT NULL          Update
  -----------------------------------------------------------------------

Unique constraint: `(user_id, entry_date)` if the product intentionally
supports one journal entry per day. If multiple entries/day are
required, use a different uniqueness model.

## 8.4 `concepts`

Structured knowledge cards.

  ------------------------------------------------------------------------
  Column             Type              Rules             Description
  ------------------ ----------------- ----------------- -----------------
  `id`               `uuid`            PK                Concept ID

  `user_id`          `uuid`            FK, NOT NULL      Owner

  `title`            `text`            NOT NULL          Concept

  `definition`       `text`            nullable          Definition

  `explanation`      `text`            nullable          Longer
                                                         explanation

  `examples`         `jsonb`           NOT NULL, default Examples
                                       `[]`              

  `source_note_id`   `uuid`            FK to `notes`,    Source note
                                       nullable          

  `status`           `text`            NOT NULL, default `draft`,
                                       `draft`           `review`,
                                                         `mastered`,
                                                         `archived`

  `created_at`       `timestamptz`     NOT NULL          Creation

  `updated_at`       `timestamptz`     NOT NULL          Update
  ------------------------------------------------------------------------

## 8.5 Knowledge graph tables

### `knowledge_entities`

  -----------------------------------------------------------------------
  Column            Type              Rules             Description
  ----------------- ----------------- ----------------- -----------------
  `id`              `uuid`            PK                Entity ID

  `user_id`         `uuid`            FK, NOT NULL      Owner

  `name`            `text`            NOT NULL          Entity name

  `entity_type`     `text`            NOT NULL          `person`,
                                                        `concept`,
                                                        `project`,
                                                        `tool`, `topic`,
                                                        `organization`,
                                                        `other`

  `description`     `text`            nullable          Description

  `source_type`     `text`            nullable          Origin kind

  `source_id`       `uuid`            nullable          Origin ID,
                                                        polymorphic

  `created_at`      `timestamptz`     NOT NULL          Creation

  `updated_at`      `timestamptz`     NOT NULL          Update
  -----------------------------------------------------------------------

### `knowledge_relations`

  --------------------------------------------------------------------------------
  Column               Type              Rules                   Description
  -------------------- ----------------- ----------------------- -----------------
  `id`                 `uuid`            PK                      Relation ID

  `user_id`            `uuid`            FK, NOT NULL            Owner

  `source_entity_id`   `uuid`            FK to                   Source
                                         `knowledge_entities`,   
                                         NOT NULL                

  `target_entity_id`   `uuid`            FK to                   Target
                                         `knowledge_entities`,   
                                         NOT NULL                

  `relation_type`      `text`            NOT NULL                `related_to`,
                                                                 `depends_on`,
                                                                 `part_of`,
                                                                 `uses`,
                                                                 `created_by`,
                                                                 etc.

  `description`        `text`            nullable                Relation
                                                                 explanation

  `weight`             `numeric`         nullable                Optional edge
                                                                 weight

  `created_at`         `timestamptz`     NOT NULL                Creation
  --------------------------------------------------------------------------------

Prevent self-relations and duplicate directed edges unless multi-edge
semantics are explicitly required.

------------------------------------------------------------------------

## 9. Content Studio and Publishing

## 9.1 `content_items`

Canonical content record, independent of channel-specific publication.

  ------------------------------------------------------------------------
  Column             Type              Rules             Description
  ------------------ ----------------- ----------------- -----------------
  `id`               `uuid`            PK                Content ID

  `user_id`          `uuid`            FK, NOT NULL      Owner

  `title`            `text`            NOT NULL          Content title

  `body`             `text`            nullable          Main content

  `content_format`   `text`            NOT NULL, default `markdown`,
                                       `markdown`        `plain_text`,
                                                         `rich_text`

  `content_type`     `text`            NOT NULL, default `post`,
                                       `post`            `article`,
                                                         `video`,
                                                         `carousel`,
                                                         `newsletter`,
                                                         `other`

  `status`           `text`            NOT NULL, default `idea`, `draft`,
                                       `draft`           `review`,
                                                         `approved`,
                                                         `scheduled`,
                                                         `published`,
                                                         `archived`

  `campaign_name`    `text`            nullable          Campaign

  `project_id`       `uuid`            FK to `projects`, Project
                                       nullable          

  `scheduled_at`     `timestamptz`     nullable          Planned
                                                         publication

  `published_at`     `timestamptz`     nullable          Actual
                                                         publication

  `metadata`         `jsonb`           NOT NULL, default Flexible
                                       `{}`              non-critical
                                                         metadata

  `created_at`       `timestamptz`     NOT NULL          Creation

  `updated_at`       `timestamptz`     NOT NULL          Update
  ------------------------------------------------------------------------

## 9.2 `content_channels`

User's publishing channels (e.g. LinkedIn, YouTube, blog).

  -----------------------------------------------------------------------
  Column            Type              Rules             Description
  ----------------- ----------------- ----------------- -----------------
  `id`              `uuid`            PK                Channel ID

  `user_id`         `uuid`            FK, NOT NULL      Owner

  `name`            `text`            NOT NULL          Display name

  `provider`        `text`            NOT NULL          Provider key

  `account_label`   `text`            nullable          Friendly account
                                                        label

  `is_active`       `boolean`         NOT NULL, default Active
                                      `true`            

  `settings`        `jsonb`           NOT NULL, default Non-secret
                                      `{}`              channel settings

  `created_at`      `timestamptz`     NOT NULL          Creation

  `updated_at`      `timestamptz`     NOT NULL          Update
  -----------------------------------------------------------------------

Do not store raw OAuth access tokens or secrets in this table. Use
encrypted secret storage or server-side secret management.

## 9.3 `content_publications`

One content item may be published to multiple channels.

  ------------------------------------------------------------------------------
  Column               Type              Rules                 Description
  -------------------- ----------------- --------------------- -----------------
  `id`                 `uuid`            PK                    Publication ID

  `user_id`            `uuid`            FK, NOT NULL          Owner

  `content_item_id`    `uuid`            FK to                 Content
                                         `content_items`, NOT  
                                         NULL                  

  `channel_id`         `uuid`            FK to                 Channel
                                         `content_channels`,   
                                         NOT NULL              

  `status`             `text`            NOT NULL, default     `draft`,
                                         `draft`               `queued`,
                                                               `scheduled`,
                                                               `publishing`,
                                                               `published`,
                                                               `failed`,
                                                               `cancelled`

  `scheduled_at`       `timestamptz`     nullable              Schedule

  `published_at`       `timestamptz`     nullable              Publish time

  `external_post_id`   `text`            nullable              Provider post ID

  `external_url`       `text`            nullable              Published URL

  `error_message`      `text`            nullable              Last error

  `attempt_count`      `integer`         NOT NULL, default `0` Attempts

  `created_at`         `timestamptz`     NOT NULL              Creation

  `updated_at`         `timestamptz`     NOT NULL              Update
  ------------------------------------------------------------------------------

Unique constraint: `(content_item_id, channel_id)` unless multiple
publication instances to the same channel are a requirement.

------------------------------------------------------------------------

## 10. Inbox and Quick Capture

## 10.1 `inbox_items`

Capture unprocessed information before classifying it into a module.

  -------------------------------------------------------------------------------
  Column                    Type              Rules             Description
  ------------------------- ----------------- ----------------- -----------------
  `id`                      `uuid`            PK                Inbox ID

  `user_id`                 `uuid`            FK, NOT NULL      Owner

  `title`                   `text`            NOT NULL          Capture title

  `content`                 `text`            nullable          Capture content

  `capture_type`            `text`            NOT NULL, default `task`, `note`,
                                              `idea`            `idea`, `link`,
                                                                `reminder`,
                                                                `other`

  `status`                  `text`            NOT NULL, default `unprocessed`,
                                              `unprocessed`     `processed`,
                                                                `dismissed`

  `source`                  `text`            nullable          `manual`,
                                                                `widget`,
                                                                `extension`,
                                                                `ai`,
                                                                `integration`

  `url`                     `text`            nullable          Captured URL

  `converted_entity_type`   `text`            nullable          Target entity
                                                                kind

  `converted_entity_id`     `uuid`            nullable          Target entity ID,
                                                                polymorphic

  `processed_at`            `timestamptz`     nullable          Process time

  `created_at`              `timestamptz`     NOT NULL          Creation

  `updated_at`              `timestamptz`     NOT NULL          Update
  -------------------------------------------------------------------------------

The conversion operation should be transactional where possible: create
the target record, update the inbox item, and mark it processed
atomically.

------------------------------------------------------------------------

## 11. Reports and Analytics

## 11.1 `daily_reports`

Persisted report snapshots only when the user wants historical reports
or generated narrative summaries.

  -----------------------------------------------------------------------
  Column            Type              Rules             Description
  ----------------- ----------------- ----------------- -----------------
  `id`              `uuid`            PK                Report ID

  `user_id`         `uuid`            FK, NOT NULL      Owner

  `report_date`     `date`            NOT NULL          User-local date

  `report_type`     `text`            NOT NULL, default `daily`,
                                      `daily`           `weekly`,
                                                        `monthly`

  `metrics`         `jsonb`           NOT NULL, default Metric snapshot
                                      `{}`              

  `summary`         `text`            nullable          Narrative summary

  `generated_at`    `timestamptz`     NOT NULL          Generation time

  `created_at`      `timestamptz`     NOT NULL          Creation
  -----------------------------------------------------------------------

Unique constraint: `(user_id, report_date, report_type)`.

Most analytics should be computed from source records using SQL views or
aggregation queries. Do not store every dashboard metric redundantly.
Snapshot only when historical reproducibility is needed.

------------------------------------------------------------------------

## 12. AI, Embeddings, and Semantic Search

## 12.1 Architecture principles

-   Use `pgvector` inside the primary Supabase PostgreSQL database
    initially.
-   Do not create a separate hosted vector database unless volume,
    latency, or isolation needs justify it.
-   Embeddings are derived data; source documents remain authoritative.
-   Embedding model and dimensions must be tracked.
-   Never assume vectors from different models/dimensions are
    comparable.
-   Re-embedding must be possible when the model changes.
-   Semantic search must be scoped by `user_id` and source access
    policy.
-   AI retrieval must not bypass RLS or leak records from another user.

Enable the `vector` extension through a migration, using the extension
schema/configuration appropriate to the Supabase project.

## 12.2 `ai_memories`

Stores curated memory items for the assistant. This is not a replacement
for task, project, note, or journal tables.

  ---------------------------------------------------------------------------
  Column                Type              Rules             Description
  --------------------- ----------------- ----------------- -----------------
  `id`                  `uuid`            PK                Memory ID

  `user_id`             `uuid`            FK, NOT NULL      Owner

  `content`             `text`            NOT NULL          Memory text

  `memory_type`         `text`            NOT NULL          `preference`,
                                                            `fact`, `goal`,
                                                            `workflow`,
                                                            `summary`,
                                                            `other`

  `source_type`         `text`            nullable          Source entity
                                                            kind

  `source_id`           `uuid`            nullable          Source entity ID

  `importance`          `numeric`         NOT NULL, default Importance
                                          `0.5`, 0--1       

  `confidence`          `numeric`         nullable, 0--1    Confidence

  `embedding`           `vector(<DIM>)`   nullable          Embedding; choose
                                                            dimension for
                                                            model

  `embedding_model`     `text`            nullable          Model identifier

  `expires_at`          `timestamptz`     nullable          Optional expiry

  `last_retrieved_at`   `timestamptz`     nullable          Retrieval time

  `created_at`          `timestamptz`     NOT NULL          Creation

  `updated_at`          `timestamptz`     NOT NULL          Update
  ---------------------------------------------------------------------------

`<DIM>` is a deliberate placeholder. Before applying the migration, the
implementation agent must select the embedding model and exact vector
dimension. Do not invent a dimension or silently change it later.

## 12.3 `document_chunks`

Chunks of source content used for retrieval-augmented generation (RAG).

  -------------------------------------------------------------------------
  Column              Type              Rules             Description
  ------------------- ----------------- ----------------- -----------------
  `id`                `uuid`            PK                Chunk ID

  `user_id`           `uuid`            FK, NOT NULL      Owner

  `source_type`       `text`            NOT NULL          Source
                                                          module/entity
                                                          kind

  `source_id`         `uuid`            NOT NULL          Source record ID,
                                                          polymorphic

  `chunk_index`       `integer`         NOT NULL, \>= 0   Position in
                                                          source

  `chunk_text`        `text`            NOT NULL          Chunk text

  `content_hash`      `text`            NOT NULL          Hash to detect
                                                          changed source

  `metadata`          `jsonb`           NOT NULL, default Non-critical
                                        `{}`              chunk metadata

  `embedding`         `vector(<DIM>)`   nullable          Embedding

  `embedding_model`   `text`            nullable          Model identifier

  `embedded_at`       `timestamptz`     nullable          Embedding
                                                          timestamp

  `created_at`        `timestamptz`     NOT NULL          Creation

  `updated_at`        `timestamptz`     NOT NULL          Update
  -------------------------------------------------------------------------

Unique constraint: `(user_id, source_type, source_id, chunk_index)`.

A source update should trigger or enqueue chunk reprocessing. Avoid
generating embeddings synchronously in ordinary CRUD triggers.

## 12.4 Search strategy

Use: 1. PostgreSQL full-text search for exact lexical search. 2.
`pgvector` similarity for semantic search. 3. Combined ranking (hybrid
search) when appropriate. 4. User/source filters before returning
results. 5. Optional reranking outside the database if later required.

Vector indexes (e.g. HNSW or IVFFlat) should be introduced only after
evaluating dataset size, query patterns, and extension support. Index
creation must be included in migrations and tested on the target
Supabase environment.

------------------------------------------------------------------------

## 13. Automations, Cron, and Background Jobs

Cron, queues, and automation definitions are different concerns.

-   **Automation definition:** what the user configured.
-   **Cron schedule:** when a recurring trigger should fire.
-   **Queue job:** a unit of work waiting to execute.
-   **Execution log:** the record of what happened.

## 13.1 `automations`

  ------------------------------------------------------------------------
  Column             Type              Rules             Description
  ------------------ ----------------- ----------------- -----------------
  `id`               `uuid`            PK                Automation ID

  `user_id`          `uuid`            FK, NOT NULL      Owner

  `name`             `text`            NOT NULL          Name

  `description`      `text`            nullable          Description

  `trigger_type`     `text`            NOT NULL          `schedule`,
                                                         `event`,
                                                         `manual`,
                                                         `condition`

  `trigger_config`   `jsonb`           NOT NULL, default Trigger
                                       `{}`              configuration

  `action_config`    `jsonb`           NOT NULL, default Action
                                       `{}`              configuration

  `is_enabled`       `boolean`         NOT NULL, default Enabled
                                       `true`            

  `last_run_at`      `timestamptz`     nullable          Last run

  `next_run_at`      `timestamptz`     nullable          Next expected run

  `created_at`       `timestamptz`     NOT NULL          Creation

  `updated_at`       `timestamptz`     NOT NULL          Update
  ------------------------------------------------------------------------

Do not store executable arbitrary SQL or untrusted code in automation
configuration. Action types must be allow-listed and validated.

## 13.2 `automation_runs`

  -------------------------------------------------------------------------
  Column              Type              Rules             Description
  ------------------- ----------------- ----------------- -----------------
  `id`                `uuid`            PK                Run ID

  `user_id`           `uuid`            FK, NOT NULL      Owner

  `automation_id`     `uuid`            FK to             Automation
                                        `automations`,    
                                        NOT NULL          

  `status`            `text`            NOT NULL, default `queued`,
                                        `queued`          `running`,
                                                          `succeeded`,
                                                          `failed`,
                                                          `cancelled`

  `started_at`        `timestamptz`     nullable          Start

  `finished_at`       `timestamptz`     nullable          Finish

  `input_snapshot`    `jsonb`           NOT NULL, default Input
                                        `{}`              

  `output_snapshot`   `jsonb`           NOT NULL, default Output
                                        `{}`              

  `error_message`     `text`            nullable          Error

  `attempt_count`     `integer`         NOT NULL, default Attempts
                                        `0`               

  `created_at`        `timestamptz`     NOT NULL          Creation
  -------------------------------------------------------------------------

## 13.3 Queue design

Prefer Supabase `pgmq` for PostgreSQL-backed queue use cases if
supported and enabled in the target project. Queue payloads should
contain identifiers and minimal metadata, not large documents or
secrets.

Example job types:

-   `generate_daily_report`
-   `generate_embedding`
-   `summarize_meeting`
-   `process_content_publication`
-   `sync_external_calendar`
-   `send_reminder`
-   `refresh_analytics`

Queue processing must support: - Retry/backoff - Idempotency - Failure
logging - Dead-letter handling or equivalent - Job visibility/locking
semantics

Do not use database queues as a substitute for long-running compute. A
worker or Edge Function should process the work.

## 13.4 Cron usage

Use Supabase Cron / `pg_cron` to trigger bounded, scheduled work, such
as:

-   Daily report generation.
-   Weekly review generation.
-   Reminder scanning.
-   Recurring task creation.
-   Expired-memory cleanup.
-   Queue dispatch or maintenance.
-   Aggregate refresh.

Schedules must use the user's timezone when interpreting local
schedules. Store the timezone explicitly and calculate due times
correctly. Avoid hard-coding a single timezone in every scheduled
function.

------------------------------------------------------------------------

## 14. Storage Metadata and Attachments

Supabase Storage holds file bytes. PostgreSQL stores application
metadata and relationships.

## 14.1 `attachments`

  Column           Type            Rules             Description
  ---------------- --------------- ----------------- ---------------------------------
  `id`             `uuid`          PK                Attachment ID
  `user_id`        `uuid`          FK, NOT NULL      Owner
  `bucket_id`      `text`          NOT NULL          Supabase Storage bucket
  `storage_path`   `text`          NOT NULL          Object path
  `file_name`      `text`          NOT NULL          Original/display filename
  `mime_type`      `text`          nullable          Content type
  `size_bytes`     `bigint`        nullable, \>= 0   File size
  `checksum`       `text`          nullable          Content hash
  `entity_type`    `text`          NOT NULL          Parent entity kind
  `entity_id`      `uuid`          NOT NULL          Parent entity UUID, polymorphic
  `created_at`     `timestamptz`   NOT NULL          Creation

Use user-scoped object paths such as:

`<user_id>/<entity_type>/<entity_id>/<file_name>`

Storage policies must restrict access to the owner. Validate file type
and size in the upload flow. Avoid exposing private objects through
public buckets.

Because `entity_type`/`entity_id` is polymorphic, enforce parent
existence in controlled application logic or use dedicated attachment
junction tables for entities that require strict referential integrity.

------------------------------------------------------------------------

## 15. Notifications and Reminders

## 15.1 `reminders`

  --------------------------------------------------------------------------
  Column               Type              Rules             Description
  -------------------- ----------------- ----------------- -----------------
  `id`                 `uuid`            PK                Reminder ID

  `user_id`            `uuid`            FK, NOT NULL      Owner

  `title`              `text`            NOT NULL          Reminder

  `description`        `text`            nullable          Details

  `scheduled_at`       `timestamptz`     NOT NULL          Scheduled time

  `status`             `text`            NOT NULL, default `pending`,
                                         `pending`         `sent`,
                                                           `dismissed`,
                                                           `cancelled`

  `entity_type`        `text`            nullable          Related entity
                                                           type

  `entity_id`          `uuid`            nullable          Related entity ID

  `delivery_channel`   `text`            NOT NULL, default `in_app`,
                                         `in_app`          `email`, `push`

  `sent_at`            `timestamptz`     nullable          Delivery time

  `created_at`         `timestamptz`     NOT NULL          Creation

  `updated_at`         `timestamptz`     NOT NULL          Update
  --------------------------------------------------------------------------

## 15.2 `notifications`

  Column                Type            Rules          Description
  --------------------- --------------- -------------- ---------------------
  `id`                  `uuid`          PK             Notification ID
  `user_id`             `uuid`          FK, NOT NULL   Owner
  `title`               `text`          NOT NULL       Title
  `body`                `text`          nullable       Body
  `notification_type`   `text`          NOT NULL       Type
  `entity_type`         `text`          nullable       Related entity type
  `entity_id`           `uuid`          nullable       Related entity ID
  `read_at`             `timestamptz`   nullable       Read time
  `created_at`          `timestamptz`   NOT NULL       Creation

Notifications should be generated through controlled server-side
workflows. Do not allow clients to impersonate system-generated
notifications.

------------------------------------------------------------------------

## 16. Integrations and External Sync

## 16.1 `integrations`

Metadata for connected services. Do not store plaintext credentials.

  -----------------------------------------------------------------------------
  Column                  Type              Rules             Description
  ----------------------- ----------------- ----------------- -----------------
  `id`                    `uuid`            PK                Integration ID

  `user_id`               `uuid`            FK, NOT NULL      Owner

  `provider`              `text`            NOT NULL          Provider key

  `display_name`          `text`            nullable          Display label

  `status`                `text`            NOT NULL, default `connected`,
                                            `connected`       `expired`,
                                                              `disconnected`,
                                                              `error`

  `external_account_id`   `text`            nullable          Provider account

  `scopes`                `text[]`          NOT NULL, default Granted scopes
                                            `{}`              

  `settings`              `jsonb`           NOT NULL, default Non-secret
                                            `{}`              settings

  `last_synced_at`        `timestamptz`     nullable          Last sync

  `created_at`            `timestamptz`     NOT NULL          Creation

  `updated_at`            `timestamptz`     NOT NULL          Update
  -----------------------------------------------------------------------------

OAuth tokens must be stored encrypted in a server-controlled secret
store or secure backend mechanism. They must never be readable by the
frontend or exposed in logs.

## 16.2 `sync_cursors`

  ------------------------------------------------------------------------
  Column             Type              Rules             Description
  ------------------ ----------------- ----------------- -----------------
  `id`               `uuid`            PK                Cursor ID

  `user_id`          `uuid`            FK, NOT NULL      Owner

  `integration_id`   `uuid`            FK to             Integration
                                       `integrations`,   
                                       NOT NULL          

  `resource_type`    `text`            NOT NULL          Synced resource

  `cursor_value`     `text`            nullable          Provider
                                                         cursor/token

  `last_synced_at`   `timestamptz`     nullable          Last sync

  `sync_status`      `text`            NOT NULL, default `idle`,
                                       `idle`            `running`,
                                                         `failed`

  `error_message`    `text`            nullable          Last error

  `updated_at`       `timestamptz`     NOT NULL          Update
  ------------------------------------------------------------------------

Unique constraint: `(integration_id, resource_type)`.

------------------------------------------------------------------------

## 17. Database Integrity and Ownership Rules

The following rules are mandatory:

1.  Every user-owned table must have `user_id NOT NULL`, except profile
    identity tables where the PK itself is the user ID.
2.  Every user-owned table must have RLS enabled.
3.  Policies must scope rows to `auth.uid()`.
4.  Use foreign keys for all normal relationships.
5.  Validate that referenced rows belong to the same user. RLS on
    individual tables alone does not always guarantee cross-table
    ownership consistency for writes.
6.  Use composite unique constraints or carefully designed
    constraints/functions where needed to prevent cross-user
    relationships.
7.  Use `ON DELETE CASCADE` only when child data should unquestionably
    be deleted with its parent.
8.  Prefer `ON DELETE RESTRICT` for important relationships that should
    not silently destroy data.
9.  Soft-delete only when recovery or archive behavior is needed; do not
    add `deleted_at` to every table by default.
10. Ensure indexes exist on foreign keys used for joins and deletion
    checks.
11. Never expose Supabase service-role credentials to browser code.
12. Server-side functions using elevated privileges must validate the
    current user and input explicitly.
13. Treat all client input and JSONB values as untrusted.
14. Secrets must not be stored in regular user-readable tables.

### RLS baseline

For a table such as `tasks`, use an owner-scoped policy pattern:

``` sql
alter table public.tasks enable row level security;

create policy "Users can select their own tasks"
on public.tasks
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Users can insert their own tasks"
on public.tasks
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "Users can update their own tasks"
on public.tasks
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Users can delete their own tasks"
on public.tasks
for delete
to authenticated
using (user_id = (select auth.uid()));
```

This is a pattern, not a complete policy generator. Create equivalent
policies for each user-owned table and review any table with privileged
or cross-table behavior individually.

------------------------------------------------------------------------

## 18. Indexing Strategy

Create indexes based on actual access patterns. At minimum, consider:

-   `user_id` on every user-owned table.
-   `(user_id, status)` on tasks, projects, goals, inbox, automations,
    and publications.
-   `(user_id, due_at)` on tasks.
-   `(user_id, scheduled_start_at)` on tasks if time-block queries are
    used.
-   `(user_id, start_at)` on calendar events.
-   `(user_id, started_at)` on time entries.
-   `(user_id, entry_date)` on journal entries.
-   `(user_id, updated_at DESC)` on notes and content items.
-   `(user_id, scheduled_at, status)` on reminders and publication
    queue.
-   Foreign-key indexes for joins.
-   GIN indexes for PostgreSQL full-text search where needed.
-   Vector indexes for embedding columns only after model dimensions and
    query patterns are established.

Use partial indexes for frequently queried active records, such as
active timers or pending reminders.

Avoid indiscriminately indexing every column. Indexes increase write
cost and storage use.

------------------------------------------------------------------------

## 19. SQL Views and Derived Data

Use views for reusable read models such as:

-   `v_tasks_with_project`
-   `v_project_progress`
-   `v_goal_progress`
-   `v_daily_time_summary`
-   `v_calendar_agenda`
-   `v_pending_reminders`
-   `v_content_queue`
-   `v_dashboard_kpis`

Views should derive values from authoritative records. Do not duplicate
mutable values unless a performance need has been measured.

If a view is exposed through Supabase API, review its security behavior
and RLS interaction. Use security-invoker views where appropriate and
supported.

Materialized views or summary tables may be introduced for expensive
reports. Refresh them through controlled scheduled jobs.

------------------------------------------------------------------------

## 20. Triggers and Database Functions

Use triggers only for data integrity and simple database-local actions.

Reasonable uses: - Update `updated_at`. - Create a profile after user
registration. - Validate same-owner references where constraints alone
cannot. - Maintain small derived values where transactional correctness
matters.

Avoid triggers for: - AI API calls. - Embedding generation. - Sending
email or push notifications. - Long-running workflows. - Complex
multi-step automation.

Those actions belong in Edge Functions or workers, often dispatched
through a queue.

### `updated_at` trigger

Use a shared function to set `updated_at = now()` before updates on
tables that contain that column.

### Transactional operations

Operations such as converting an inbox item into a task, creating a task
from a meeting action, or completing a publication state transition
should be implemented atomically where practical using a database
transaction or RPC.

------------------------------------------------------------------------

## 21. Migration and Development Rules for AI Agents

The AI coding agent must follow these rules when modifying the database:

1.  Use Supabase CLI migrations; never make undocumented manual schema
    changes in production.
2.  Each schema change must have a migration file.
3.  Migrations must be ordered, repeatable in a fresh environment, and
    reviewed.
4.  Do not modify an already-applied migration to change production
    schema history. Add a new migration.
5.  Keep generated Supabase TypeScript database types in sync after
    migrations.
6.  Add RLS policies in the same migration that creates a user-owned
    table.
7.  Add constraints and indexes in migrations.
8.  Seed only non-sensitive demo data in development.
9.  Never hard-code production user IDs or secrets.
10. Test migrations against a clean local Supabase environment.
11. Test CRUD behavior under authenticated user context and verify
    cross-user access is denied.
12. Add tests for important constraints and transactional workflows.
13. Do not add a new database product or extension without explaining
    the need and operational cost.
14. Prefer adding a module using the existing PostgreSQL model over
    creating a separate database.
15. Do not implement speculative tables for features that are not in the
    current roadmap. Use the planned module sections as guidance, not a
    requirement to create every table immediately.

------------------------------------------------------------------------

## 22. Suggested Implementation Phases

### Phase 1 --- Core foundation

Implement: - `profiles` - `user_preferences` - `tags` - `projects` -
`task_lists` - `tasks` - `task_dependencies` - `goals` -
`goal_milestones` - `goal_tasks` - RLS, constraints, indexes, and
timestamp triggers

### Phase 2 --- Planning and productivity

Implement: - `calendar_events` - `meetings` - `meeting_action_items` -
`time_entries` - `focus_sessions` - `reminders` - `notifications`

### Phase 3 --- Knowledge management

Implement: - `notes` - `note_links` - `journal_entries` - `concepts` -
`knowledge_entities` - `knowledge_relations` - Attachments metadata

### Phase 4 --- Content and reporting

Implement: - `content_items` - `content_channels` -
`content_publications` - `inbox_items` - `daily_reports` - Dashboard
views and analytics

### Phase 5 --- AI and background infrastructure

Implement when the relevant AI functionality is ready: - `ai_memories` -
`document_chunks` - `pgvector` extension and indexes - `automations` -
`automation_runs` - Queue processing - Cron schedules - Integrations and
sync cursors

Do not enable all extensions and background jobs at project
initialization without a real use case.

------------------------------------------------------------------------

## 23. Feature-to-Database Mapping

  -----------------------------------------------------------------------
  Application feature     Primary tables          Supporting services
  ----------------------- ----------------------- -----------------------
  Dashboard               Views over tasks,       Realtime optional
                          projects, goals, time   
                          entries, events         

  My Day                  Tasks, calendar events, Reminder scheduler
                          time entries            

  Task management         Tasks, task lists, task Realtime optional
                          dependencies            

  Projects                Projects, tasks,        SQL views
                          goal_tasks              

  Goals                   Goals, goal milestones, Scheduled progress
                          goal_tasks              reports

  Calendar                Calendar events,        External sync optional
                          meetings                

  Time tracker            Time entries, focus     Partial unique index
                          sessions                for active timer

  Notes                   Notes, note links, tags Full-text search

  Knowledge graph         Knowledge entities,     Graph UI/query logic
                          knowledge relations     

  Concepts                Concepts, notes         AI embeddings optional

  Meetings                Meetings, meeting       AI summary job optional
                          action items, notes     

  Journal                 Journal entries         Scheduled review
                                                  optional

  Content studio          Content items,          Queue/Edge Functions
                          channels, publications  

  Inbox                   Inbox items             Transactional
                                                  conversion

  Reports                 Daily reports, source   Cron
                          tables, views           

  AI assistant            AI memories, document   pgvector, Edge
                          chunks, source tables   Functions/worker

  Automations             Automations, automation Cron, queue, worker
                          runs                    

  Files                   Attachments metadata    Supabase Storage

  Integrations            Integrations, sync      Edge Functions/worker
                          cursors                 

  Notifications           Reminders,              Cron, push/email
                          notifications           service
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 24. Decisions Still Requiring Explicit Selection

The implementation agent must not guess these without documenting the
choice:

1.  **Embedding model and vector dimension:** required before creating
    fixed-dimension vector columns/indexes.
2.  **Notes format:** Tiptap JSON, Markdown, or a deliberate hybrid.
3.  **Recurrence standard:** RRULE or a simpler application-defined
    recurrence representation.
4.  **Calendar integration scope:** internal-only initially or external
    calendar sync.
5.  **AI memory lifecycle:** expiry, retention, user review, and
    deletion behavior.
6.  **Queue implementation:** `pgmq` versus a simpler scheduled Edge
    Function workflow for the initial release.
7.  **Backup strategy:** automated export target and retention.
8.  **Report snapshots:** which reports need persisted historical
    snapshots versus on-demand queries.

Defaults recommended for initial development: - Notes: Tiptap JSON with
an explicit `content_format`. - Recurrence: RFC 5545 RRULE where
recurring events/tasks are implemented. - Calendar: internal calendar
first. - Vector: pgvector in Supabase, with dimension selected based on
chosen embedding model. - Queue: begin with the simplest reliable
implementation; introduce `pgmq` when asynchronous workloads require
it. - Backups: scheduled export to a separately controlled
destination. - Reports: compute on demand; persist daily/weekly
narrative snapshots only when required.

------------------------------------------------------------------------

## 25. Final Architectural Summary

Personal OS should use **one Supabase PostgreSQL database as its
relational source of truth**.

The intended architecture is:

-   PostgreSQL for all core application entities and relations.
-   Supabase Auth for identity.
-   RLS for data isolation.
-   `pgvector` for semantic AI memory and retrieval.
-   Supabase Storage for file bytes.
-   Supabase Realtime only for features that benefit from live updates.
-   `pg_cron` for bounded recurring work.
-   `pgmq` or an appropriate queue for asynchronous jobs when needed.
-   Edge Functions or workers for external API calls and long-running
    operations.
-   SQL views and aggregates for dashboard and analytics read models.
-   Versioned migrations for all schema changes.

Do not use TimescaleDB as a separate primary database at the initial
stage. PostgreSQL is sufficient for expected personal-scale time
tracking and analytics. Consider TimescaleDB only after a measured
time-series workload justifies it.

The database must remain modular, relational, secure, and easy to
extend. New features should normally introduce a new feature module and
related tables within the existing Supabase project, not a new database
product.

**Implementation principle:** build the required schema incrementally,
enforce ownership and integrity at the database layer, and introduce
specialized infrastructure only when an actual feature requires it.
