/**
 * Lead Finder – Easy Comedi: Os Dakota & Giuliao | Lapa, RJ
 * ──────────────────────────────────────────────────────────
 * Uso:
 *   node run.js            → raspagem real via Apify
 *   node run.js --demo     → modo demonstração (sem chamadas à API)
 */

require('dotenv').config();
const InstagramScraper = require('./src/scraper');
const LeadAnalyzer     = require('./src/analyzer');
const Reporter         = require('./src/reporter');
const { TARGETS }      = require('./src/config');

const DEMO_MODE = process.argv.includes('--demo');

// ─── Perfis de demonstração ───────────────────────────────────────────────────
const DEMO_PROFILES = [
    {
        username: 'carioca_gabs',
        fullName: 'Gabriela M.',
        bio: 'Amo stand-up comedy 😂 | Lapa toda semana 🎶 | Rio de Janeiro',
        followersCount: 1840,
        postsCount: 312,
        isVerified: false,
        source: 'hashtag:#LapaRJ',
        captionSample: 'Mais uma noite incrível na Lapa! #LapaRJ #NoiteCarioca #StandUpRJ',
        hashtags: ['LapaRJ', 'NoiteCarioca', 'StandUpRJ'],
        locationName: 'Lapa, Rio de Janeiro',
    },
    {
        username: 'rodrigo_sertanej0',
        fullName: 'Rodrigo Pinheiro',
        bio: '🎵 Sertanejo universitário é vida | Centro RJ | Fã dos Dakota',
        followersCount: 4200,
        postsCount: 87,
        isVerified: false,
        source: 'follower:@giulianocontino',
        captionSample: 'Curtindo forró universitário no Rio de Janeiro 🤠',
        hashtags: ['SertanejoUniversitario', 'ForroRJ'],
        locationName: 'Centro, Rio de Janeiro',
    },
    {
        username: 'mari_humor',
        fullName: 'Mariana Humor',
        bio: 'Comediante amadora | Stand-Up Comedy RJ | Tijuca',
        followersCount: 920,
        postsCount: 210,
        isVerified: false,
        source: 'follower:@batmandalapa',
        captionSample: 'Assistindo stand-up no Comedy Club Rio. Genial! #ComediaRJ',
        hashtags: ['ComediaRJ', 'StandUpRJ'],
        locationName: 'Tijuca, RJ',
    },
    {
        username: 'night_rio_events',
        fullName: 'Night Rio Events',
        bio: 'Agenda de eventos noturnos Rio de Janeiro 🌃 | Parceiro oficial Lapa',
        followersCount: 32000,
        postsCount: 1500,
        isVerified: true,
        source: 'hashtag:#OndeIrNoRio',
        captionSample: 'Eventos imperdíveis na Lapa esse fim de semana! #LapaRJ #OndeIrNoRio',
        hashtags: ['LapaRJ', 'OndeIrNoRio', 'NoiteCarioca'],
        locationName: 'Rio de Janeiro',
    },
    {
        username: 'joao_sp_2023',
        fullName: 'João Silva',
        bio: 'Fotógrafo | São Paulo | Viajando pelo Brasil',
        followersCount: 310,
        postsCount: 45,
        isVerified: false,
        source: 'hashtag:#SertanejoUniversitario',
        captionSample: 'Show em São Paulo ontem foi demais!',
        hashtags: ['SertanejoUniversitario'],
        locationName: '',
    },
    {
        username: 'lapa_lover_rj',
        fullName: 'Alex Lapa',
        bio: 'Morador da Lapa | Música ao vivo toda semana | RJ',
        followersCount: 780,
        postsCount: 190,
        isVerified: false,
        source: 'hashtag:#LapaRJ',
        captionSample: 'A Lapa nunca decepciona. Stand-up + sertanejo = noite perfeita 🎤🎵',
        hashtags: ['LapaRJ', 'NoiteCarioca'],
        locationName: 'Lapa, Rio de Janeiro',
    },
    {
        username: 'flamengo_fan_carol',
        fullName: 'Carol Mendonça',
        bio: 'Rubro-Negra 🔴⚫ | Flamengo – Rio de Janeiro | Adoro humor',
        followersCount: 2100,
        postsCount: 430,
        isVerified: false,
        source: 'follower:@omarcioramalho',
        captionSample: 'Rio é tudo! Quem vai ao stand-up esse mês? #StandUpRJ',
        hashtags: ['StandUpRJ', 'Flamengo'],
        locationName: 'Flamengo, Rio de Janeiro',
    },
    {
        username: 'duo_viola_brothers',
        fullName: 'Viola Brothers',
        bio: 'Dupla sertaneja universitária 🎸 | Catete, RJ | Shows toda semana',
        followersCount: 8900,
        postsCount: 620,
        isVerified: false,
        source: 'hashtag:#SertanejoUniversitario',
        captionSample: 'Próximo show na Lapa! #LapaRJ #SertanejoUniversitario',
        hashtags: ['LapaRJ', 'SertanejoUniversitario', 'ViolaRJ'],
        locationName: 'Catete, Rio de Janeiro',
    },
];

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║        Lead Finder – Easy Comedi | Lapa, RJ                 ║');
    console.log(`╚══════════════════════════════════════════════════════════════╝`);

    if (DEMO_MODE) {
        console.log('\n⚠  MODO DEMO: usando perfis de exemplo (sem chamadas à API)\n');
    } else {
        console.log('\n🔑 Token Apify carregado:', process.env.APIFY_API_TOKEN ? '✓' : '✗ NÃO ENCONTRADO');
        console.log('📌 Alvos configurados:');
        console.log('   Perfis :', TARGETS.profiles.map(p => `@${p}`).join(', '));
        console.log('   Hashtags:', TARGETS.hashtags.map(h => `#${h}`).join(', '));
    }

    // ── Fase 1: Scraping ─────────────────────────────────────────────────────
    let profiles;
    if (DEMO_MODE) {
        profiles = DEMO_PROFILES;
        console.log(`\n✓ ${profiles.length} perfis de demonstração carregados.\n`);
    } else {
        const scraper = new InstagramScraper(process.env.APIFY_API_TOKEN);
        profiles = await scraper.run();
    }

    // ── Fase 2: Análise ──────────────────────────────────────────────────────
    console.log('\n════════════════════════════════════════');
    console.log('  FASE 3: Análise e Classificação');
    console.log('════════════════════════════════════════\n');

    const analyzer = new LeadAnalyzer();
    const leads = analyzer.analyze(profiles);

    // ── Fase 3: Relatório ────────────────────────────────────────────────────
    const reporter = new Reporter('./output');
    reporter.printTable(leads);
    await reporter.save(leads);

    console.log('\n✅ Processo concluído! Arquivos salvos em ./output/\n');
}

main().catch(err => {
    console.error('\n✗ Erro fatal:', err.message);
    process.exit(1);
});
