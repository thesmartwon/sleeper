import { createSignal, createResource, For, createEffect, Switch, Match, createMemo, getOwner } from "solid-js";
import { LeagueUser, Player, Position, SleeperApi, Stat } from "./api";
import { makePersisted } from "@solid-primitives/storage";
import localforage from "localforage";
import Plotly, { PlotData } from "plotly.js-basic-dist-min";
import { SimpleTable } from "solid-simple-table"

const client = new SleeperApi();
export type PlayerProjection = Partial<Player> & { projection?: Partial<Record<Stat, number>> };

export function App() {
	const [username, setUsername] = createSignal<string>("thesmartwon");
	const [season, setSeason] = createSignal(new Date().getFullYear().toString());
	const [user] = createResource(username, user => client.getUser(user));
	const [userDrafts] = createResource(
		() => ({ user_id: user()?.user_id, season: season() }),
		({ user_id, season }) => user_id ? client.getUserDrafts(user_id, season) : [],
		{ initialValue: [] }
	);
	const [draftId, setDraftId] = createSignal<string>();
	createEffect(() => setDraftId(userDrafts()?.[0]?.draft_id));

	const [draftPicks, { refetch: refreshDraftPicks }] = createResource(
		draftId,
		id => client.getDraftPicks(id).then(draftPicks => {
			const players: Record<string, string> = {};
			for (const pick of draftPicks) players[pick.player_id] = pick.picked_by;
			return players;
		}),
		{ initialValue: {} }
	);

	const [leagueId, setLeagueId] = createSignal<string>();
	createEffect(() => setLeagueId(userDrafts()?.[0]?.league_id));

	const [league] = createResource(leagueId, id => client.getLeague(id));
	const [leagueUsers] = createResource(leagueId, async id => {
		const users: Record<string, LeagueUser> = {};
		for (const leagueUser of await client.getLeagueUsers(id)) {
			users[leagueUser.user_id] = leagueUser;
		}
		return users;
	},
		{ initialValue: {} });

	const [players, setPlayers, playersInitted] = makePersisted(
		createSignal<{
			fetchTime: number;
			players: Record<string, PlayerProjection>;
		}>({ fetchTime: 0, players: {} }),
		{ storage: localforage, name: "players" }
	);

	async function refreshDraftPlayer() {
		const [players, projectionList] = await Promise.all([
			client.getPlayers() as Promise<Record<string, PlayerProjection>>,
			client.getProjections(season()),
		]);
		const fetchTime = new Date().getTime();
		for (const projection of projectionList) {
			if (!(projection.player_id in players)) continue;
			players[projection.player_id].projection = projection.stats;
		}

		setPlayers({ fetchTime, players });
	}

	createEffect(async () => {
		await playersInitted;
		const now = new Date();
		const yesterday = new Date(now);
		yesterday.setDate(now.getDate() - 1);

		if (yesterday.getTime() > players().fetchTime) refreshDraftPlayer();
	});

	function getProjection(p: PlayerProjection): number {
		let res = 0;
		for (const [rule, scalar] of Object.entries(league()?.scoring_settings ?? {})) {
			res += (p.projection?.[rule as Stat] ?? 0) * scalar;
		}
		return res;
	}

	function getOwnerString(playerId?: string) {
		const owner = leagueUsers()[draftPicks()[playerId ?? ""]];
		if (!owner) return "";

		let res = owner.display_name;

		// if (owner.metadata.team_name) res += ` (${owner.metadata.team_name})`;

		return res
	}

	const positions = () => Object.values(players().players)
		.filter(p => p.position && getProjection(p) && (league()?.roster_positions ?? []).includes(p.position))
		.sort((a, b) => getProjection(b) - getProjection(a))
		.reduce((acc, cur) => {
			acc[cur.position!] ??= [];
			acc[cur.position!].push(cur);

			return acc;
		}, {} as Record<Position, PlayerProjection[]>)

	const teams = () => Object.values(players().players)
		.filter(p => p.position && getProjection(p) && (league()?.roster_positions ?? []).includes(p.position))
		.sort((a, b) => getProjection(b) - getProjection(a))
		.reduce((acc, cur) => {
			acc[cur.team!] ??= [];
			acc[cur.team!].push({
				...cur,
				owner: getOwnerString(cur.player_id),
			});

			return acc;
		}, {} as Record<string, (PlayerProjection & { owner: string })[]>)

	const rosters = () => Object.values(players().players)
		.reduce((acc, cur) => {
			const owner = leagueUsers()[draftPicks()[cur.player_id ?? ""]];
			if (owner) {
				acc[owner.display_name] ??= [];
				acc[owner.display_name].push(cur);
			}
			return acc;
		}, {} as Record<string, PlayerProjection[]>);

	const rows = () => Object.entries(rosters()).map(([name, players]) => ({
		name,
		picks: players.length,
		projection: players.reduce((acc, cur) => acc + getProjection(cur), 0).toFixed(0),
	}));

	const [view, setView] = createSignal<"table" | "graph">("graph");

	let chart!: HTMLDivElement;
	createEffect(() => {
		const traces = Object.entries(teams()).map(([team, players]) => ({
			x: players.map(p => getProjection(p)),
			y: players.map(p => p.position),
			customdata: players as any[],
			marker: {
				opacity: players.map(p => p.owner ? 0.2 : 1),
			},
			hovertemplate:
				[
					'<b>%{customdata.full_name}</b>',
					'<i>Projection</i>: %{x:.2f}',
					'Year <b>%{customdata.years_exp}</b>',
					'%{customdata.owner}',
				].join("<br>"),
			name: team,
			type: "scatter",
			mode: "markers",
		} as Partial<PlotData>));

		view();
		Plotly.newPlot(chart, traces, {
			modebar: {
				orientation: "v",
				remove: ["lasso2d", "select2d", "zoomIn2d", "autoScale2d"],
			},
			legend: { orientation: "h" },
			margin: {
				t: 0,
				b: 0,
				l: 20,
				r: 0,
			},
		}, { responsive: true, displayModeBar: true });
	});

	return (
		<main>
			<div class="flex text-2xl">
				<input id="username" value={username() ?? ""} onInput={ev => setUsername(ev.target.value)} class="input" placeholder="username" />
				<input id="season" value={season()} onInput={ev => setSeason(ev.target.value)} class="w-[10ch] input" />
				<select id="draft" value={draftId()} onInput={ev => setDraftId(ev.target.value)} class="select">
					<For each={userDrafts()}>
						{d => <option value={d.draft_id}>{d.metadata.name} ({d.status})</option>}
					</For>
				</select>
				<div class="grow" />
				<button class="btn text-2xl" onClick={() => {
					refreshDraftPlayer();
					refreshDraftPicks();
				}}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 489.698 489.698" width="16" height="16">
						<g>
							<g>
								<path d="M468.999,227.774c-11.4,0-20.8,8.3-20.8,19.8c-1,74.9-44.2,142.6-110.3,178.9c-99.6,54.7-216,5.6-260.6-61l62.9,13.1    c10.4,2.1,21.8-4.2,23.9-15.6c2.1-10.4-4.2-21.8-15.6-23.9l-123.7-26c-7.2-1.7-26.1,3.5-23.9,22.9l15.6,124.8    c1,10.4,9.4,17.7,19.8,17.7c15.5,0,21.8-11.4,20.8-22.9l-7.3-60.9c101.1,121.3,229.4,104.4,306.8,69.3    c80.1-42.7,131.1-124.8,132.1-215.4C488.799,237.174,480.399,227.774,468.999,227.774z" />
								<path d="M20.599,261.874c11.4,0,20.8-8.3,20.8-19.8c1-74.9,44.2-142.6,110.3-178.9c99.6-54.7,216-5.6,260.6,61l-62.9-13.1    c-10.4-2.1-21.8,4.2-23.9,15.6c-2.1,10.4,4.2,21.8,15.6,23.9l123.8,26c7.2,1.7,26.1-3.5,23.9-22.9l-15.6-124.8    c-1-10.4-9.4-17.7-19.8-17.7c-15.5,0-21.8,11.4-20.8,22.9l7.2,60.9c-101.1-121.2-229.4-104.4-306.8-69.2    c-80.1,42.6-131.1,124.8-132.2,215.3C0.799,252.574,9.199,261.874,20.599,261.874z" />
							</g>
						</g>
					</svg>
				</button>
			</div>
			<div role="tablist" class="tabs">
				{(["graph", "table"] as const).map(t =>
					<button
						role="tab"
						class="tab"
						classList={{ "tab-active": view() === t }}
						onClick={() => setView(t)}>
						{t}
					</button>
				)}
			</div>
			<div class="w-full h-full overflow-auto">
				<Switch>
					<Match when={view() === "table"}>
						<For each={Object.entries(positions())}>
							{([pos, players]) =>
								<>
									<h2 class="text-2xl">{pos}</h2>
									<div class="w-full grid grid-cols-4 gap-2">
										<For each={players}>
											{p => <>
												<span>{p.full_name ?? p.team}</span>
												<span>{p.team}</span>
												<span>{getProjection(p).toFixed(2)}</span>
												<span>{getOwnerString(p.player_id!)}</span>
											</>}
										</For>
									</div>
								</>
							}
						</For>
					</Match>
					<Match when={view() === "graph"}>
						<div ref={chart} />
					</Match>
				</Switch>
				<SimpleTable
					className="w-full"
					rows={rows()}
					columns={[{ id: "name" }, {id:  "picks" }, {id: "projection"}]}
				/>
			</div>
		</main>
	);
};
