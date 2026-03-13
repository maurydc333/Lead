const { SCORING } = require('./config');

/**
 * Classifica um perfil do Instagram como lead para o show
 * "Easy Comedi apresenta: Os Dakota & Giuliao" – Lapa, RJ
 */
class LeadAnalyzer {
    constructor() {
        this.reasons = {};
    }

    /**
     * Normaliza texto para comparação
     */
    normalize(text = '') {
        return text.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Verifica se o texto contém alguma keyword
     */
    hasKeyword(text, keywords) {
        const t = this.normalize(text);
        return keywords.filter(k => t.includes(this.normalize(k)));
    }

    /**
     * Calcula pontuação e motivos para um perfil
     */
    score(profile) {
        const text = [
            profile.bio,
            profile.fullName,
            profile.captionSample,
            profile.locationName,
            (profile.hashtags || []).join(' '),
        ].join(' ');

        let total = 0;
        const reasons = [];
        const suggestions = [];

        // 1. Localização (peso 40)
        const locationHits = this.hasKeyword(text, SCORING.location.keywords);
        if (locationHits.length > 0) {
            const pts = SCORING.location.weight;
            total += pts;
            reasons.push(`Localização: mencionou "${locationHits[0]}"`);
            suggestions.push('Destacar que o show é na Lapa, pertinho de você!');
        }

        // 2. Interesse em comédia (peso 30)
        const comedyHits = this.hasKeyword(text, SCORING.comedy.keywords);
        if (comedyHits.length > 0) {
            const pts = SCORING.comedy.weight;
            total += pts;
            reasons.push(`Comédia: perfil menciona "${comedyHits[0]}"`);
            suggestions.push('Enfatizar o line-up de stand-up com nomes conhecidos do RJ');
        }

        // 3. Interesse em sertanejo (peso 20)
        const sertanejoHits = this.hasKeyword(text, SCORING.sertanejo.keywords);
        if (sertanejoHits.length > 0) {
            const pts = SCORING.sertanejo.weight;
            total += pts;
            reasons.push(`Sertanejo: perfil menciona "${sertanejoHits[0]}"`);
            suggestions.push('Mencionar show ao vivo de Os Dakota – sertanejo universitário na Lapa');
        }

        // 4. Comportamento social – hashtags (peso 10)
        const hashtagText = (profile.hashtags || []).map(h => `#${h.toLowerCase()}`).join(' ');
        const hashtagHits = this.hasKeyword(hashtagText, SCORING.socialBehavior.hashtags);
        if (hashtagHits.length > 0) {
            total += SCORING.socialBehavior.weight;
            reasons.push(`Usa hashtags relevantes: ${hashtagHits.slice(0, 2).join(', ')}`);
            suggestions.push('Marcar em posts de #LapaRJ ou #NoiteCarioca com convite direto');
        }

        // Bônus: fonte (aparece em múltiplas fontes ou segue um artista)
        if (profile.source && profile.source.startsWith('follower:')) {
            total += 5;
            const artist = profile.source.replace('follower:', '');
            reasons.push(`Segue o artista ${artist}`);
            suggestions.push(`Citar que ${artist} se apresenta no show`);
        }

        // Nível de afinidade
        let level;
        if (total >= 60) level = 'Alto';
        else if (total >= 30) level = 'Médio';
        else level = 'Baixo';

        return {
            username: profile.username,
            fullName: profile.fullName,
            followersCount: profile.followersCount,
            isVerified: profile.isVerified,
            source: profile.source,
            score: Math.min(total, 100),
            level,
            reason: reasons.length ? reasons.join(' | ') : 'Engajamento com fonte monitorada',
            suggestion: [...new Set(suggestions)].slice(0, 2).join(' | ') ||
                        'Mencionar o combo Comédia + Sertanejo na Lapa',
            bio: (profile.bio || '').substring(0, 100),
        };
    }

    /**
     * Analisa lista de perfis, retorna apenas leads Médio e Alto ordenados por score
     */
    analyze(profiles) {
        return profiles
            .map(p => this.score(p))
            .filter(p => p.level !== 'Baixo' || p.score > 0)
            .sort((a, b) => b.score - a.score);
    }
}

module.exports = LeadAnalyzer;
