DROP TABLE IF EXISTS CLOSEDPOSITIONS;
CREATE TABLE IF NOT EXISTS CLOSEDPOSITIONS (unixTime INTEGER PRIMARY KEY, price REAL, longPositionPercentage INTEGER);