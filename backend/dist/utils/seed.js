"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = __importDefault(require("../config/supabase"));
async function run() {
    console.log('Seeding demo projects...');
    const examples = [
        {
            title: 'Lovely Coffee Landing',
            slug: 'lovely-coffee-landing',
            summary: 'A beautiful landing page for a boutique coffee shop built with AI.',
            content: '<h1>Lovely Coffee</h1><p>Best beans in town.</p>',
            public: true,
            category: 'website',
            tags: ['landing', 'coffee']
        }
    ];
    for (const p of examples) {
        const { data, error } = await supabase_1.default.from('projects').upsert(p).select();
        if (error)
            console.error('Seed error:', error.message || error);
        else
            console.log('Seeded:', p.slug);
    }
    process.exit(0);
}
run();
