import { integer, jsonb, pgTable, serial, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'

export const rooms = pgTable('rooms', {
  code: text('code').primaryKey(),
  currentSlide: integer('current_slide').notNull().default(0),
  mode: text('mode').notNull().default('presentation'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const participants = pgTable('participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomCode: text('room_code').notNull(),
  nickname: text('nickname').notNull(),
  lastSeen: timestamp('last_seen', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const responses = pgTable(
  'responses',
  {
    id: serial('id').primaryKey(),
    roomCode: text('room_code').notNull(),
    participantId: uuid('participant_id').notNull(),
    activity: text('activity').notNull(),
    correct: integer('correct').notNull().default(0),
    total: integer('total').notNull().default(0),
    payload: jsonb('payload').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('responses_unique').on(t.roomCode, t.participantId, t.activity)],
)
