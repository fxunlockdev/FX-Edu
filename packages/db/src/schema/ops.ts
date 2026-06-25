/**
 * Ops domain: audit_logs, feature_flags, idempotency_keys, event_outbox.
 *
 * Infrastructure tables that the whole platform leans on:
 *  - `audit_logs`     every mutation is recorded (actor pseudonymised, not
 *                     deleted, on GDPR erasure so the trail survives).
 *  - `feature_flags`  global flags with audience/rollout config.
 *  - `idempotency_keys` dedupe for webhooks + payment ops.
 *  - `event_outbox`   transactional outbox feeding the pg-queue → workers, so
 *                     events are never lost on commit (PROJECT.md §10, §8/F3).
 *
 * `audit_logs` carries an optional `org_id` (most actions are tenant-scoped;
 * system actions use the system org). `feature_flags`, `idempotency_keys`, and
 * `event_outbox` are global infrastructure (no tenant RLS — service-role only).
 */
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { baseColumns } from "./_shared";
import { featureFlagStatusEnum, outboxStatusEnum } from "./enums";
import { organizations } from "./auth";

/* ── audit_logs ────────────────────────────────────────────────────── */

export const auditLogs = pgTable(
  "audit_logs",
  {
    ...baseColumns,
    /** Tenant context; system actions use the system org. */
    orgId: uuid("org_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    /** Actor user id; pseudonymised (not deleted) on GDPR erasure. */
    actorUserId: uuid("actor_user_id"),
    action: varchar("action", { length: 120 }).notNull(),
    /** Target entity type + id (e.g. "subscription", uuid). */
    targetType: varchar("target_type", { length: 80 }),
    targetId: uuid("target_id"),
    /** Reason note required for dangerous actions (step-up flows). */
    reason: text("reason"),
    metadata: jsonb("metadata").notNull().default({}),
    ipAddress: varchar("ip_address", { length: 64 }),
    userAgent: text("user_agent"),
  },
  (table) => [
    index("audit_logs_org_idx").on(table.orgId),
    index("audit_logs_actor_idx").on(table.actorUserId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_target_idx").on(table.targetType, table.targetId),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ],
);

/* ── feature_flags (global) ────────────────────────────────────────── */

export const featureFlags = pgTable(
  "feature_flags",
  {
    ...baseColumns,
    key: varchar("key", { length: 120 }).notNull(),
    status: featureFlagStatusEnum("status").notNull().default("off"),
    /** Audience targeting rules (orgs, roles, percentages). */
    audience: jsonb("audience").notNull().default({}),
    /** Rollout percentage 0–100 when status = rollout. */
    rolloutPercent: integer("rollout_percent").notNull().default(0),
  },
  (table) => [uniqueIndex("feature_flags_key_uq").on(table.key)],
);

/* ── idempotency_keys (global) ─────────────────────────────────────── */

export const idempotencyKeys = pgTable(
  "idempotency_keys",
  {
    ...baseColumns,
    /** The idempotency key (e.g. Stripe event id, client-supplied key). */
    key: varchar("key", { length: 255 }).notNull(),
    /** Scope/namespace so the same key can't collide across endpoints. */
    scope: varchar("scope", { length: 120 }).notNull(),
    /** Stored response/result for safe replays. */
    result: jsonb("result").notNull().default({}),
    /** Retention/purge boundary. */
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("idempotency_keys_scope_key_uq").on(table.scope, table.key),
    index("idempotency_keys_expires_idx").on(table.expiresAt),
  ],
);

/* ── event_outbox (transactional outbox → pg-queue) ────────────────── */

export const eventOutbox = pgTable(
  "event_outbox",
  {
    ...baseColumns,
    /** Tenant context for the event (nullable for system events). */
    orgId: uuid("org_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    /** Event name from the PRD Key Events list, e.g. `subscription.created`. */
    eventType: varchar("event_type", { length: 120 }).notNull(),
    /** Aggregate this event is about (type + id) for tracing/ordering. */
    aggregateType: varchar("aggregate_type", { length: 80 }),
    aggregateId: uuid("aggregate_id"),
    payload: jsonb("payload").notNull().default({}),
    status: outboxStatusEnum("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    /** When the publisher last attempted dispatch (for backoff). */
    lastAttemptedAt: timestamp("last_attempted_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    lastError: text("last_error"),
  },
  (table) => [
    // Publisher polls pending rows in insertion order.
    index("event_outbox_status_created_idx").on(
      table.status,
      table.createdAt,
    ),
    index("event_outbox_event_type_idx").on(table.eventType),
    index("event_outbox_aggregate_idx").on(
      table.aggregateType,
      table.aggregateId,
    ),
  ],
);

/* ── validation contracts ──────────────────────────────────────────── */

export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const selectAuditLogSchema = createSelectSchema(auditLogs);

export const insertFeatureFlagSchema = createInsertSchema(featureFlags);
export const selectFeatureFlagSchema = createSelectSchema(featureFlags);

export const insertIdempotencyKeySchema = createInsertSchema(idempotencyKeys);
export const selectIdempotencyKeySchema = createSelectSchema(idempotencyKeys);

export const insertEventOutboxSchema = createInsertSchema(eventOutbox);
export const selectEventOutboxSchema = createSelectSchema(eventOutbox);
