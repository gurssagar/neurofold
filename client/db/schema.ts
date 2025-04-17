
import { pgTable, serial, text, varchar ,integer} from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  username: varchar('username',{ length: 256 }).primaryKey(),
  name: text('name'),
  image: varchar('image', { length: 256 }),
  email: varchar('email', { length: 256 }).notNull(),
  coins: integer('coins').default(5),
});
        