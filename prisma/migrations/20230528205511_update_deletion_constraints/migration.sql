-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CategoryForEntry" (
    "entryId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("entryId", "categoryId"),
    CONSTRAINT "CategoryForEntry_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CategoryForEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CategoryForEntry" ("categoryId", "createdAt", "entryId") SELECT "categoryId", "createdAt", "entryId" FROM "CategoryForEntry";
DROP TABLE "CategoryForEntry";
ALTER TABLE "new_CategoryForEntry" RENAME TO "CategoryForEntry";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
