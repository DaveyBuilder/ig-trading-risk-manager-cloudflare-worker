DROP TABLE IF EXISTS CLOSEDPOSITIONS;
CREATE TABLE IF NOT EXISTS CLOSEDPOSITIONS (
    openDateUtc TEXT PRIMARY KEY,
    closedDateUtc TEXT,
    instrumentName TEXT,
    size TEXT,
    profitAndLoss TEXT
);