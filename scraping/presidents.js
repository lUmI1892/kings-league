
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const STATIC_PATH = path.join(process.cwd(), 'assets/static/presidents');
const DB_PATH = path.join(process.cwd(), './db');
const URLS = {
    presidentsURL: 'https://kingsleague.pro/wp-json/wp/v2/presidents?per_page=12'
}

async function getPresidents(url){
    const presidents = await fetch(url);
    const rptaPresidents = await presidents.json();
    return rptaPresidents;
}
const RAW_PRESIDENTS = await getPresidents(URLS.presidentsURL);

const presidents = await Promise.all(
    RAW_PRESIDENTS.map( async presidentInfo =>{
        const { slug: id, title, _links: links } = presidentInfo;
        const { rendered: name } = title;
    
        const { 'wp:attachment': attachment } = links;
        const { href: imageApiEndpoint } = attachment[0];
    
        const responseImageEnpoint = await fetch(imageApiEndpoint);
        const data = await responseImageEnpoint.json();
        const {guid: { rendered: imageUrl}} = data[0];
    
        const fileExtension = imageUrl.split('.').at(-1);
    
        const responseImage = await fetch(imageUrl);
        const arrayBuffer = await responseImage.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
    
        const imageFileName = `${id}.${fileExtension}`;
        await writeFile(`${STATIC_PATH}/${imageFileName}`, buffer );
    
        return { id, name, image: imageFileName, teamId:0 };
    })
)

await writeFile(`${DB_PATH}/presidents.json`, JSON.stringify(presidents, null, 2))
