// ─── Alvos de raspagem ────────────────────────────────────────────────────────
const TARGETS = {
    profiles: [
        'giulianocontino',
        'abnersoueu',
        'andre.bracinho',
        'bianysio',
        'batmandalapa',
        'omarcioramalho',
    ],
    hashtags: [
        'StandUpRJ',
        'LapaRJ',
        'OndeIrNoRio',
        'NoiteCarioca',
        'SertanejoUniversitario',
        'ComediaRJ',
    ],
};

// ─── Critérios de classificação ───────────────────────────────────────────────
const SCORING = {
    location: {
        keywords: ['rio de janeiro', 'rj', 'lapa', 'centro rj', 'santa teresa',
                   'glória', 'catete', 'flamengo', 'tijuca', 'botafogo', 'carioca'],
        weight: 40,
    },
    comedy: {
        keywords: ['stand-up', 'standup', 'stand up', 'comédia', 'comedia',
                   'humor', 'comediante', 'rio retrô', 'comedy club', 'comedia rj',
                   'piada', 'risada', 'easy comedi'],
        weight: 30,
    },
    sertanejo: {
        keywords: ['sertanejo', 'sertanejo universitário', 'sertanejo universitario',
                   'dupla sertaneja', 'forró', 'forro', 'country', 'viola', 'peão'],
        weight: 20,
    },
    socialBehavior: {
        hashtags: ['#lapa', '#lapanj', '#standuprj', '#noitecarioca', '#ondeironorio',
                   '#comedianj', '#lapario', '#laparj'],
        weight: 10,
    },
};

// Limites por scraping
const SCRAPE_LIMITS = {
    postsPerHashtag: 100,   // posts por hashtag (autores extraídos)
    followersPerProfile: 200, // seguidores por perfil-alvo
    profileBatchSize: 50,   // perfis analisados por lote
};

module.exports = { TARGETS, SCORING, SCRAPE_LIMITS };
