export async function getClosedPositions(request, env, ctx) {
    try{
    
        // LOGIN PROCESS
        const loginResponse = await fetch('https://api.ig.com/gateway/deal/session', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'X-IG-API-KEY': env.IG_API_KEY,
            'Version': '2'
            },
            body: JSON.stringify({
            identifier: env.IG_IDENTIFIER,
            password: env.IG_PASSWORD,
            })
        });
           
        if (!loginResponse.ok) {
            throw new Error(`HTTP error! status: ${closedPositionsResponse.status}`);
        }
        
        const CST = loginResponse.headers.get('CST');
        const X_SECURITY_TOKEN = loginResponse.headers.get('X-SECURITY-TOKEN');

        // START OF LOGIC

        const date = new Date();
        if (date.getDay() === 1) { // If it's Monday
            date.setDate(date.getDate() - 3); // Get the date of the previous Friday
        } else if (date.getDay() === 0) { // If it's Sunday
            date.setDate(date.getDate() - 4); // Get the date of the previous Friday
        } else {
            date.setDate(date.getDate() - 1); // Get the date of the previous day
        }
        const dateFrom = date.toISOString().split('T')[0];

        console.log(dateFrom);

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
            throw new Error(`HTTP error! status: ${closedPositionsResponse.status}`);
        }

        const closedPositionsData = await closedPositionsResponse.json();

        return closedPositionsData;

    } catch (error) {
        console.error('An error occurred:', error);
        return { error: error.message };
    }

}