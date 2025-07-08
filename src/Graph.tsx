import { For } from "solid-js";
import { PlayerProjection } from "./App";
import { Position } from "./api";

export function Graph(props: {
	players: PlayerProjection[],
	getProjection(p: PlayerProjection): number,
	getOwnerString(playerId?: string): string,
	max: number,
	r: number;
	offsetY: number,
	position: Position,
	onPointerOver: (p: PlayerProjection) => void;
}) {
	if (!props.max) return;

	return (
		<g fill={`var(--color-${props.position.toLowerCase()})`}>
			<For each={props.players.toReversed()}>
				{(player) => <circle
					stroke="currentColor"
					cx={`${props.getProjection(player) / props.max * 100}%`}
					cy={props.offsetY}
					r={props.r}
					opacity={props.getOwnerString(player.player_id) ? "0.2" : "1"}
					onPointerOver={() => props.onPointerOver(player)}
				/>
				}
			</For>
		</g>
	);
}

export function PlayerDetails(props: {
	details: PlayerProjection;
	getOwnerString(playerId?: string): string;
	getProjection(proj: PlayerProjection): number;
}) {
	return (
		<div class="grid grid-cols-2 gap-2">
			<span>name</span>
			<span>{props.details?.full_name}</span>
			<span>projection</span>
			<span>{props.getProjection(props.details)?.toFixed(0)}</span>
			<span>age</span>
			<span>{props.details?.age}</span>
			<span>team</span>
			<span>{props.details?.team}</span>
			<span>years exp</span>
			<span>{props.details?.years_exp}</span>
			<span>owner</span>
			<span>{props.getOwnerString(props.details.player_id)}</span>
		</div>
	);
}
