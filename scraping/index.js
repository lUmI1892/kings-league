import * as cheerio from 'cheerio';
import { writeFile } from 'node:fs/promises'
import path from 'node:path';

const URLS = {
    loaderboard: 'https://kingsleague.pro/estadisticas/clasificacion/'
}

async function scrape(url){
    const res = await fetch(url);
    const html = await res.text();
    return cheerio.load(html);
}

async function getLoaderBoard(){
    const $ = await scrape(URLS.loaderboard);
    const $rows = $('table tbody tr');

    const LOADERBOARD_SELECTORS = {
        team: {selector:'.fs-table-text_3', typeOf: 'string'},
        wins: {selector:'.fs-table-text_4', typeOf: 'number'},
        loses: {selector:'.fs-table-text_5', typeOf: 'number'},
        scoredGoals: {selector:'.fs-table-text_6', typeOf: 'number'},
        concededGoals: {selector:'.fs-table-text_7', typeOf: 'number'},
        yellowCard: {selector:'.fs-table-text_8', typeOf: 'number'},
        redCard: {selector:'.fs-table-text_9', typeOf: 'number'}
    }

    const cleanText = text => text
    .replace(/\t|\n|\s:/g, '')
    .replace(/.*:/g, ' ')
    .trim();

    const loaderBoardSelectorEntries = Object.entries(LOADERBOARD_SELECTORS);

    const leaderboar = [];
    $rows.each((_, el)=>{
        const loaderBoardEntrtries = loaderBoardSelectorEntries.map(([key, { selector, typeOf }])=>{
            const rawValue = $(el).find(selector).text();
            const cleanValue = cleanText(rawValue);
            const value = typeOf === 'number'
                ? Number(cleanValue)
                : cleanValue
    
            return [key, value]
        })

        leaderboar.push(Object.fromEntries(loaderBoardEntrtries))
    })

    return leaderboar;
}

const leaderboard = await getLoaderBoard();
const filePath = path.join(process.cwd(), './db/leaderboard.json');
await writeFile( filePath, JSON.stringify(leaderboard, null, 2), 'utf-8' );
