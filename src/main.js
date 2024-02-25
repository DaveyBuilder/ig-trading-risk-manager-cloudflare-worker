import { loginIG } from './helper_functions/login_ig.js';
import { isMarketOpen } from './helper_functions/is_market_open.js';

export async function executeScheduledTask(request, env, ctx, usingDemoAccount) {
    
    let baseURL;
    if (usingDemoAccount) {
        baseURL = 'https://demo-api.ig.com/gateway/deal';
    } else {
        baseURL = 'https://api.ig.com/gateway/deal';
    }

    const { CST, X_SECURITY_TOKEN } = await loginIG(env, baseURL);

    // Check if nasdaq 100 futures are open & exit if not
	const marketStatus = await isMarketOpen(env, CST, X_SECURITY_TOKEN, baseURL);
	if (marketStatus === "EDITS_ONLY") {
		return;
	}

    const date = new Date();
    if (date.getDay() === 1) { // If it's Monday
        date.setDate(date.getDate() - 3); // Get the date of the previous Friday
    } else {
        date.setDate(date.getDate() - 1); // Get the date of the previous day
    }
    const dateFrom = date.toISOString().split('T')[0];

    let attempts = 1;
    let closedPositionsData;
    while (attempts <= 3) {
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

        if (closedPositionsResponse.ok) {
            console.log(`Get closed positions attempt ${attempts} succeeded`);
            closedPositionsData = await closedPositionsResponse.json();
            break;
        } else {
            attempts++;
            const responseBody = await closedPositionsResponse.json();
            console.log(`Get closed positions attempt ${attempts} failed with status: ${closedPositionsResponse.status}, Response: ${JSON.stringify(responseBody, null, 2)}`);
            if (attempts > 3) {
                throw new Error(`Get closed positions failed after 3 attempts with status: ${closedPositionsResponse.status}, Response: ${JSON.stringify(responseBody, null, 2)}`);
            }
        }
    }

    const dbErrors = [];

    for (const transaction of closedPositionsData.transactions) {
        let attempts = 0;
        let success = false;
    
        while (attempts < 3 && !success) {
            try {
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
                
                success = true;
            } catch (error) {
                attempts++;
                console.error(`Attempt ${attempts} to insert transaction ${JSON.stringify(transaction, null, 2)} failed with error: ${error.message}`);
                if (attempts >= 3) {
                    dbErrors.push({ transaction, error: error.message });
                }
            }
        }
    }

    if (dbErrors.length > 0) {
        throw new Error(`Failed to insert the following transactions into the DB: ${JSON.stringify(dbErrors, null, 2)}`);
    }
}

