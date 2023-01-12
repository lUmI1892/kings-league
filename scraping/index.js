import * as cheerio from 'cheerio';
import { writeFile, readFile } from 'node:fs/promises'
import path from 'node:path';

const DB_PATH = path.join(process.cwd(), './db/');
const TEAMS = await readFile(`${DB_PATH}/teams.json`, 'utf-8').then(JSON.parse);

/* import TEAMS from '../db/teams.json' assert { type: "json" }; */

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

    const getTeamFrom = (name)=> TEAMS.find(team => team.name === name);

    const cleanText = text => text
    .replace(/\t|\n|\s:/g, '')
    .replace(/.*:/g, ' ')
    .trim();

    const loaderBoardSelectorEntries = Object.entries(LOADERBOARD_SELECTORS);

    const leaderboard = [];
    $rows.each((_, el)=>{
        const loaderBoardEntrtries = loaderBoardSelectorEntries.map(([key, { selector, typeOf }])=>{
            const rawValue = $(el).find(selector).text();
            const cleanValue = cleanText(rawValue);
            const value = typeOf === 'number'
                ? Number(cleanValue)
                : cleanValue
    
            return [key, value]
        })

        const {team: teamName, ...leaderboardForTeam} = Object.fromEntries(loaderBoardEntrtries);
        const team = getTeamFrom(teamName)

        leaderboard.push({
            ...leaderboardForTeam,
            team
        })
    })

    return leaderboard;
}

const leaderboard = await getLoaderBoard();
await writeFile( `${DB_PATH}/leaderboard.json`, JSON.stringify(leaderboard, null, 2), 'utf-8' );
