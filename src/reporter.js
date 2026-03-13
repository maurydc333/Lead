const Table = require('cli-table3');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

class Reporter {
    constructor(outputDir = 'output') {
        this.outputDir = outputDir;
        fs.mkdirSync(outputDir, { recursive: true });
    }

    /**
     * Imprime tabela no terminal segmentada por nível
     */
    printTable(leads) {
        console.log('\n');
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║   LEADS QUENTES – Easy Comedi: Os Dakota & Giuliao | Lapa   ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');

        const levels = ['Alto', 'Médio', 'Baixo'];
        const colors = { Alto: '\x1b[32m', Médio: '\x1b[33m', Baixo: '\x1b[37m' };
        const reset = '\x1b[0m';

        for (const level of levels) {
            const group = leads.filter(l => l.level === level);
            if (!group.length) continue;

            console.log(`${colors[level]}▶ ${level.toUpperCase()} (${group.length} leads)${reset}\n`);

            const table = new Table({
                head: ['#', '@Username', 'Score', 'Seguidores', 'Motivo', 'Abordagem'],
                colWidths: [4, 22, 7, 12, 50, 55],
                wordWrap: true,
                style: { head: ['cyan'] },
            });

            group.slice(0, 50).forEach((lead, i) => {
                table.push([
                    i + 1,
                    `@${lead.username}${lead.isVerified ? ' ✓' : ''}`,
                    `${lead.score}/100`,
                    lead.followersCount.toLocaleString('pt-BR'),
                    lead.reason,
                    lead.suggestion,
                ]);
            });

            console.log(table.toString());
            console.log();
        }

        const hot = leads.filter(l => l.level === 'Alto').length;
        const medium = leads.filter(l => l.level === 'Médio').length;
        console.log(`Total: ${leads.length} leads | Alto: ${hot} | Médio: ${medium}\n`);
    }

    /**
     * Exporta CSV com todos os leads
     */
    async exportCSV(leads) {
        const filePath = path.join(this.outputDir, 'leads_easy_comedi.csv');
        const writer = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'username', title: 'Username (@)' },
                { id: 'fullName', title: 'Nome Completo' },
                { id: 'level', title: 'Nível de Afinidade' },
                { id: 'score', title: 'Score (0-100)' },
                { id: 'followersCount', title: 'Seguidores' },
                { id: 'isVerified', title: 'Verificado' },
                { id: 'source', title: 'Fonte' },
                { id: 'reason', title: 'Motivo' },
                { id: 'suggestion', title: 'Sugestão de Abordagem' },
                { id: 'bio', title: 'Bio (resumo)' },
            ],
            fieldDelimiter: ';',
            encoding: 'utf8',
        });

        await writer.writeRecords(leads);
        console.log(`✓ CSV exportado: ${filePath}`);
        return filePath;
    }

    /**
     * Exporta JSON com todos os leads
     */
    exportJSON(leads) {
        const filePath = path.join(this.outputDir, 'leads_easy_comedi.json');
        fs.writeFileSync(filePath, JSON.stringify(leads, null, 2), 'utf8');
        console.log(`✓ JSON exportado: ${filePath}`);
        return filePath;
    }

    async save(leads) {
        const csvPath = await this.exportCSV(leads);
        const jsonPath = this.exportJSON(leads);
        return { csvPath, jsonPath };
    }
}

module.exports = Reporter;
