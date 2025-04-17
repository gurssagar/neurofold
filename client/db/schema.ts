
import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  username: serial('id').primaryKey(),
  name: text('full_name'),
  image: varchar('name', { length: 256 }),
  email: varchar('email', { length: 256 }).notNull(),

  
});
        