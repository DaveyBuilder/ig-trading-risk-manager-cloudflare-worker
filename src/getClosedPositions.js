import { loginIG } from './loginIG.js';

export async function getClosedPositions(request, env, ctx) {
    
    const { CST, X_SECURITY_TOKEN } = await loginIG(env);

    const date = new Date();
    if (date.getDay() === 1) { // If it's Monday
        date.setDate(date.getDate() - 3); // Get the date of the previous Friday
    } else {
        date.setDate(date.getDate() - 1); // Get the date of the previous day
    }
    const dateFrom = date.toISOString().split('T')[0];

    // Fetch all closed positions
    const closedPositionsResponse = await fetch(`https://api.ig.com/gateway/deal/history/transactions?type=ALL_DEAL&from=${dateFrom}&pageSize=150`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-IG-API-KEY': env.IG_API_KEY,
            'Version': '2',
            'CST': CST,
            'X-SECURITY-TOKEN': X_SECURITY_TOKEN
        }
    });

    if (!closedPositionsResponse.ok) {
        throw new Error(`GET request error! HTTP status: ${closedPositionsResponse.status}`);
    }

    const closedPositionsData = await closedPositionsResponse.json();

    for (const transaction of closedPositionsData.transactions) {

        const stmt = await env.DB.prepare(`
            INSERT OR IGNORE INTO CLOSEDPOSITIONS (openDateUtc, closedDateUtc, instrumentName, size, profitAndLoss)
            VALUES (?, ?, ?, ?, ?)
        `);

        // Bind the values and execute the statement
        await stmt.bind(
            transaction.openDateUtc,
            transaction.dateUtc,
            transaction.instrumentName,
            transaction.size,
            transaction.profitAndLoss
        ).run();
    }

    //return closedPositionsData;

}