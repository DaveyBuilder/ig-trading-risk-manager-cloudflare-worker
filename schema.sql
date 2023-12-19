DROP TABLE IF EXISTS CLOSEDPOSITIONS;
CREATE TABLE IF NOT EXISTS CLOSEDPOSITIONS (
    openDateUtc TEXT,
    closedDateUtc TEXT,
    instrumentName TEXT,
    size TEXT,
    profitAndLoss TEXT,
    UNIQUE(openDateUtc, closedDateUtc, instrumentName, size, profitAndLoss)
);