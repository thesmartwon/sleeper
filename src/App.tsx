import { createSignal, createResource, For, createEffect, Switch, Match, createMemo, Show } from "solid-js";
import { LeagueUser, Player, Position, SleeperApi, Stat } from "./api";
import { makePersisted } from "@solid-primitives/storage";
import localforage from "localforage";
import { Graph, PlayerDetails } from "./Graph";

const client = new SleeperApi();
export type PlayerProjection = Partial<Player> & { projection?: Partial<Record<Stat, number>> };

export function App() {
	const [username, setUsername] = createSignal<string>("thesmartwon");
	const [season, setSeason] = createSignal(new Date().getFullYear().toString());
	const [user] = createResource(() => username(), async user => {
		const res =await client.getUser(user); 
		console.log("createResource", user, res);
		return res;
	});
	const [userDrafts] = createResource(
		() => ({ user_id: user()?.user_id, season: season() }),
		({ user_id, season }) => user_id ? client.getUserDrafts(user_id, season) : [],
		{ initialValue: [] }
	);
	const [draftId, setDraftId] = createSignal<string>();
	createEffect(() => setDraftId(userDrafts()?.[0]?.draft_id));

	createEffect(() => {
		console.log("user", user())
	});

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
		console.log("leagueUsers");
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

	const [view, setView] = createSignal<"table" | "graph">("graph");

	const maxProjection = createMemo(() =>
		Object.values(positions())
			.flatMap(players => players.map(p => getProjection(p)))
			.reduce((acc, cur) => Math.max(acc, cur), 0)
	);

	const [selected, setSelected] = createSignal<PlayerProjection>({});

	let scrollRef!: HTMLDivElement;

	createEffect(() => {
		const r = scrollRef;
		positions();
		if (view() === "graph") {
			r.scrollTo({ left: r.scrollWidth, behavior: "smooth" })
		}
	});

	return (
		<main class="bg-slate-800 h-screen text-slate-50 flex flex-col">
			<div class="flex text-2xl">
				<input id="username" value={username() ?? ""} onInput={ev => setUsername(ev.target.value)} class="input" placeholder="username" />
				<input id="season" value={season()} onInput={ev => setSeason(ev.target.value)} class="w-[10ch] input" />
				<select id="draft" value={draftId()} onInput={ev => setDraftId(ev.target.value)} class="select" placeholder="draft">
					<For each={userDrafts()}>
						{d => <option value={d.draft_id}>{d.metadata.name} ({d.status})</option>}
					</For>
				</select>
				<div class="grow" />
				<button class="btn text-2xl" onClick={() => {
					refreshDraftPlayer();
					refreshDraftPicks();
				}}>
⟳
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
			<div
				class="w-full bg-slate-900/50 overflow-auto"
				ref={scrollRef}
			>
				<For each={Object.entries(positions())}>
					{([pos, players]) =>
						<Switch>
							<Match when={view() === "table"}>

								<h2 class="text-2xl">{pos}</h2>
								<div class="w-full grid grid-cols-3 gap-2">
									<For each={players}>
										{p => <>
											<span>{p.full_name ?? p.team}</span>
											<span>{getProjection(p).toFixed(2)}</span>
											<span>{getOwnerString(p.player_id!)}</span>
										</>}
									</For>
								</div>
							</Match>
							<Match when={view() === "graph"}>
								<svg
									width={maxProjection() * 16}
									height={64}
								>
									<Graph
										players={players}
										getProjection={getProjection}
										getOwnerString={getOwnerString}
										position={pos as Position}
										max={maxProjection()}
										onPointerOver={p => setSelected(p)}
										height={32}
									/>
								</svg>
							</Match>
						</Switch>
					}
				</For>
			</div>
			<Show when={view() === "graph"}>
				<PlayerDetails
					details={selected()}
					getProjection={getProjection}
					getOwnerString={getOwnerString}
				/>
			</Show>
		</main>
	);
};
