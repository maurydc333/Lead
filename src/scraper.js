const { ApifyClient } = require('apify-client');
const { TARGETS, SCRAPE_LIMITS } = require('./config');

const INSTAGRAM_SCRAPER_ACTOR = 'apify/instagram-scraper';

class InstagramScraper {
    constructor(token) {
        this.client = new ApifyClient({ token });
    }

    /**
     * Executa um actor do Apify e aguarda o resultado
     */
    async runActor(actorId, input) {
        console.log(`  → Iniciando actor ${actorId}...`);
        const run = await this.client.actor(actorId).call(input, {
            waitSecs: 300,
        });

        const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
        console.log(`  ✓ ${items.length} itens coletados.`);
        return items;
    }

    /**
     * Raspa autores de posts de hashtags-alvo
     */
    async scrapeHashtags() {
        const results = [];
        for (const hashtag of TARGETS.hashtags) {
            console.log(`\n[HASHTAG] #${hashtag}`);
            try {
                const posts = await this.runActor(INSTAGRAM_SCRAPER_ACTOR, {
                    directUrls: [`https://www.instagram.com/explore/tags/${hashtag}/`],
                    resultsType: 'posts',
                    resultsLimit: SCRAPE_LIMITS.postsPerHashtag,
                    proxy: { useApifyProxy: true },
                });

                const profiles = posts
                    .filter(p => p.ownerUsername)
                    .map(p => ({
                        username: p.ownerUsername,
                        fullName: p.ownerFullName || '',
                        bio: p.ownerBiography || '',
                        followersCount: p.ownerFollowersCount || 0,
                        postsCount: p.ownerPostsCount || 0,
                        isVerified: p.ownerIsVerified || false,
                        source: `hashtag:#${hashtag}`,
                        captionSample: (p.caption || '').substring(0, 150),
                        hashtags: p.hashtags || [],
                        locationName: p.locationName || '',
                    }));

                results.push(...profiles);
            } catch (err) {
                console.error(`  ✗ Erro em #${hashtag}: ${err.message}`);
            }
        }
        return results;
    }

    /**
     * Raspa seguidores dos perfis-alvo (artistas + locais)
     */
    async scrapeFollowers() {
        const results = [];
        for (const username of TARGETS.profiles) {
            console.log(`\n[PERFIL] @${username}`);
            try {
                const followers = await this.runActor(INSTAGRAM_SCRAPER_ACTOR, {
                    directUrls: [`https://www.instagram.com/${username}/`],
                    resultsType: 'followers',
                    resultsLimit: SCRAPE_LIMITS.followersPerProfile,
                    proxy: { useApifyProxy: true },
                });

                const profiles = followers.map(f => ({
                    username: f.username || '',
                    fullName: f.fullName || '',
                    bio: f.biography || '',
                    followersCount: f.followersCount || 0,
                    postsCount: f.postsCount || 0,
                    isVerified: f.isVerified || false,
                    source: `follower:@${username}`,
                    captionSample: '',
                    hashtags: [],
                    locationName: '',
                }));

                results.push(...profiles);
            } catch (err) {
                console.error(`  ✗ Erro em @${username}: ${err.message}`);
            }
        }
        return results;
    }

    /**
     * Desduplicar perfis pelo username
     */
    deduplicate(profiles) {
        const seen = new Set();
        return profiles.filter(p => {
            if (!p.username || seen.has(p.username.toLowerCase())) return false;
            seen.add(p.username.toLowerCase());
            return true;
        });
    }

    async run() {
        console.log('════════════════════════════════════════');
        console.log('  FASE 1: Raspagem de Hashtags');
        console.log('════════════════════════════════════════');
        const fromHashtags = await this.scrapeHashtags();

        console.log('\n════════════════════════════════════════');
        console.log('  FASE 2: Raspagem de Seguidores');
        console.log('════════════════════════════════════════');
        const fromFollowers = await this.scrapeFollowers();

        const all = this.deduplicate([...fromHashtags, ...fromFollowers]);
        console.log(`\n✓ Total de perfis únicos coletados: ${all.length}`);
        return all;
    }
}

module.exports = InstagramScraper;
