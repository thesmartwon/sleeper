// https://github.com/dtsong/sleeper-api-wrapper/blob/master/sleeper_wrapper/stats.py

type User = {
	avatar: string;
	display_name: string;
	user_id: string
	username: string;
};

export type Position = "QB" | "RB" | "WR" | "TE" | "K" | "DEF";
type RosterPosition = Position | "FLEX" | "SUPER_FLEX" | "BN";

type UserDraft = {
	"created": number;
	"draft_id": string;
	"league_id": string;
	"metadata": {
		"description": string,
		"elapsed_pick_timer": string;
		"is_autopaused": "true" | "false",
		"name": string,
		"scoring_type": string;
	},
	"settings": {
		"alpha_sort": number,
		"autopause_enabled": number,
		"autopause_end_time": number,
		"autopause_start_time": number,
		"autostart": number,
		"cpu_autopick": number,
		"enforce_position_limits": number,
		"nomination_timer": number,
		"pick_timer": number,
		"player_type": number,
		"reversal_round": number,
		"rounds": number,
		"slots_bn": number,
		"slots_flex": number,
		"slots_qb": number,
		"slots_rb": number,
		"slots_super_flex": number,
		"slots_te": number,
		"slots_wr": number,
		"teams": number
	},
	"start_time": number,
	"status": "drafting"
};

type DraftPick = {
	"draft_slot": number,
	"metadata": {
		"first_name": string;
		"injury_status": "",
		"last_name": "Allen",
		"position": Position;
		"status": string;
		"team": string;
	},
	"pick_no": number,
	"picked_by": string;
	"player_id": string;
	"roster_id": number,
	"round": number
};

export type Player = {
	"practice_participation": null,
	"first_name": string;
	"team": string;
	"height": string;
	"injury_start_date": null,
	"search_last_name": string;
	"swish_id": number,
	"number": number,
	"active": boolean,
	"injury_notes": null,
	"yahoo_id": number,
	"years_exp": number,
	"competitions": [],
	"oddsjam_id": string,
	"sportradar_id": string,
	"birth_state": null,
	"status": "Active",
	"college": string;
	"birth_country": null,
	"search_rank": number,
	"metadata": {
		"channel_id": string;
		"rookie_year": string;
	},
	"injury_status": null,
	"age": number,
	"fantasy_positions": Position[],
	"opta_id": null,
	"rotowire_id": number,
	"rotoworld_id": number,
	"pandascore_id": null,
	"team_abbr": null,
	"depth_chart_order": 1,
	"high_school": string;
	"depth_chart_position": Position,
	"birth_date": string;
	"search_first_name": string;
	"espn_id": number,
	"hashtag": string;
	"gsis_id": string;
	"last_name": "Mahomes",
	"position": Position,
	"weight": string;
	"player_id": string,
	"full_name"?: string;
	"news_updated": number,
	"birth_city": null,
	"practice_description": null,
	"fantasy_data_id": number,
	"injury_body_part": null,
	"team_changed_at": null
}

export type Stat = "sack" |
	"fgm_40_49" |
	"bonus_rec_te" |
	"pass_int" |
	"pts_allow_0" |
	"pass_2pt" |
	"st_td" |
	"rec_td" |
	"fgm_30_39" |
	"xpmiss" |
	"rush_td" |
	"rec_2pt" |
	"st_fum_rec" |
	"fgmiss" |
	"ff" |
	"rec" |
	"pts_allow_14_20" |
	"fgm_0_19" |
	"int" |
	"def_st_fum_rec" |
	"fum_lost" |
	"pts_allow_1_6" |
	"fgm_20_29" |
	"pts_allow_21_27" |
	"xpm" |
	"rush_2pt" |
	"fum_rec" |
	"def_st_td" |
	"fgm_50p" |
	"def_td" |
	"safe" |
	"pass_yd" |
	"blk_kick" |
	"pass_td" |
	"rush_yd" |
	"fum" |
	"pts_allow_28_34" |
	"pts_allow_35p" |
	"fum_rec_td" |
	"rec_yd" |
	"def_st_ff" |
	"pts_allow_7_13" |
	"st_ff";

export type Projection = {
	"status": null,
	"date": null,
	"stats": Record<Stat, number>;
	// {
	// 		"adp_2qb": 17.4,
	// 		"adp_dynasty": 49.5,
	// 		"adp_dynasty_2qb": 14.7,
	// 		"adp_dynasty_half_ppr": 49.5,
	// 		"adp_dynasty_ppr": 50.6,
	// 		"adp_dynasty_std": 49.5,
	// 		"adp_half_ppr": 57.7,
	// 		"adp_idp": 18.0,
	// 		"adp_ppr": 61.4,
	// 		"adp_rookie": 999.0,
	// 		"adp_std": 57.7,
	// 		"cmp_pct": 66.83,
	// 		"fum_lost": 2.0,
	// 		"gp": 18.0,
	// 		"pass_2pt": 1.0,
	// 		"pass_att": 597.0,
	// 		"pass_cmp": 399.0,
	// 		"pass_fd": 423.1,
	// 		"pass_int": 12.0,
	// 		"pass_td": 31.0,
	// 		"pass_yd": 4231.0,
	// 		"pts_half_ppr": 318.34,
	// 		"pts_ppr": 318.34,
	// 		"pts_std": 318.34,
	// 		"rush_att": 51.0,
	// 		"rush_fd": 27.1,
	// 		"rush_td": 2.0,
	// 		"rush_yd": 271.0
	// 	}
	"last_modified": number,
	"player_id": string;
	"game_id": "season",
	"updated_at": number,
	"team": string;
	"company": string;
	"opponent": null;
};

export type League = {
	"name": string;
	"status": string;
	"metadata": {
		"auto_continue": string;
		"copy_from_league_id": string;
		"keeper_deadline": string;
		"latest_league_winner_roster_id": string;
	},
	"settings": {
		"best_ball": number,
		"waiver_budget": number,
		"disable_adds": number,
		"divisions": number,
		"capacity_override": number,
		"waiver_bid_min": number,
		"taxi_deadline": number,
		"draft_rounds": number,
		"reserve_allow_na": number,
		"start_week": number,
		"playoff_seed_type": number,
		"playoff_teams": number,
		"veto_votes_needed": number,
		"num_teams": number,
		"daily_waivers_hour": number,
		"playoff_type": number,
		"taxi_slots": number,
		"sub_start_time_eligibility": number,
		"daily_waivers_days": number,
		"sub_lock_if_starter_active": number,
		"playoff_week_start": number,
		"waiver_clear_days": number,
		"reserve_allow_doubtful": number,
		"commissioner_direct_invite": number,
		"veto_auto_poll": number,
		"reserve_allow_dnr": number,
		"taxi_allow_vets": number,
		"waiver_day_of_week": number,
		"playoff_round_type": number,
		"reserve_allow_out": number,
		"reserve_allow_sus": number,
		"veto_show_votes": number,
		"trade_deadline": number,
		"taxi_years": number,
		"daily_waivers": number,
		"faab_suggestions": number,
		"disable_trades": number,
		"pick_trading": number,
		"type": number,
		"max_keepers": number,
		"waiver_type": number,
		"max_subs": number,
		"league_average_match": number,
		"trade_review_days": number,
		"bench_lock": number,
		"offseason_adds": number,
		"leg": number,
		"reserve_slots": number,
		"reserve_allow_cov": number
	},
	"avatar": null | string,
	"company_id": null | string,
	"shard": number;
	"season": string;
	"season_type": string;
	"sport": "nfl",
	"scoring_settings": Record<Stat, number>;
	"draft_id": string;
	"league_id": string;
	"previous_league_id": null | string,
	"roster_positions": RosterPosition[],
	"bracket_id": null,
	"bracket_overrides_id": null,
	"group_id": null,
	"loser_bracket_id": null,
	"loser_bracket_overrides_id": null,
	"total_rosters": number
};

export type LeagueUser = {
	"avatar": string;
	"display_name": string;
	"is_bot": boolean,
	"is_owner": null,
	"league_id": string;
	"metadata": {
		"allow_pn": "on",
		"mention_pn": "on",
		"team_name": string
	},
	"settings": null,
	"user_id": string;
};

export class SleeperApi {
	constructor(public base = "https://api.sleeper.app/v1") { }

	private async fetch(url: string) {
		return fetch(`${this.base}${url}`).then(r => r.json());
	}

	async getUser(userIdOrUsername: string): Promise<User> {
		return this.fetch(`/user/${userIdOrUsername}`);
	}

	async getUserDrafts(userId: string, season: string): Promise<UserDraft[]> {
		return this.fetch(`/user/${userId}/drafts/nfl/${season}`);
	}

	async getDraftPicks(draftId: string): Promise<DraftPick[]> {
		return this.fetch(`/draft/${draftId}/picks`);
	}

	async getLeague(leagueId: string): Promise<League> {
		return this.fetch(`/league/${leagueId}`);
	}

	async getLeagueUsers(leagueId: string): Promise<LeagueUser[]> {
		return this.fetch(`/league/${leagueId}/users`);
	}

	async getPlayers(): Promise<Record<string, Player>> {
		return this.fetch("/players/nfl");
	}

	async getProjections(season: string): Promise<Projection[]> {
		return fetch(`https://api.sleeper.com/projections/nfl/${season}?season_type=regular`).then(r => r.json());
	}
}
