
import { Hono } from 'hono';
import leaderboard from '../db/leaderboard.json';
import presidents from '../db/presidents.json';
import teams from '../db/teams.json';
import { serveStatic } from 'hono/serve-static.module';

const app = new Hono();

app.get('/', (ctx)=>{
	return ctx.json([
		{
			endpoint: '/leaderboard',
			description: 'Return the leaderboard'
		},
		{
			endpoint: '/presidents',
			description: 'Return the presidents'
		},
		{
			endpoint: '/teams',
			description: 'Return the teams'
		},
	])
})

app.get('/leaderboard', (ctx)=>{
	return ctx.json(leaderboard);
})

app.get('/presidents', (ctx)=>{
	return ctx.json(presidents);
})

app.get('/presidents/:id', (ctx)=>{
	const id = ctx.req.param('id')
	const fountPresident = presidents.find( president=> president.id === id );
	return fountPresident
	? ctx.json(fountPresident)
	: ctx.json({ message: 'President not found' }, 404)
})


app.get('/teams', (ctx)=>{
	return ctx.json(teams);
})

app.get('/static/*', serveStatic({ root: './' }))

export default app;
