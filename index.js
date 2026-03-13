require('dotenv').config();
const { ApifyClient } = require('apify-client');

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

async function main() {
    try {
        // Test connection by fetching the current user info
        const user = await client.user('me').get();
        console.log('Connected to Apify API successfully!');
        console.log('User:', user.username);
        console.log('Email:', user.email);

        // List available actors
        const actors = await client.actors().list({ limit: 5 });
        console.log(`\nYou have ${actors.total} actor(s). Showing first ${actors.items.length}:`);
        actors.items.forEach(actor => {
            console.log(` - ${actor.name} (${actor.id})`);
        });
    } catch (error) {
        console.error('Error connecting to Apify:', error.message);
        process.exit(1);
    }
}

main();
