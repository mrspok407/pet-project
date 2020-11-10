interface ContentDetailes {
  id: number
  poster_path: string
  backdrop_path: string
  profile_path?: string
  name: string
  original_name: string
  title: string
  original_title: string
  origin_country: string[]
  original_language: string
  first_air_date: string
  release_date: string
  last_air_date: string
  episode_run_time: string[] | number[]
  runtime: string
  status: string
  genres: any
  genre_ids: number[]
  networks: any
  known_for: {
    media_type: string
    original_title: string
    name: string
    release_date: string
    first_air_date: string
    id: number
  }[]
  known_for_department: string
  production_companies: any
  vote_average: number | string
  vote_count: string
  overview: string
  tagline: string
  budget: number
  media_type?: string
  number_of_seasons: number | string
  imdb_id: number | string
  seasonsArr: {}[]
  seasons: {}[]
  similar?: { results: {}[] }[]
  similar_movies?: { results: {}[] }[]
}

const CONTENT_DETAILS_DEFAULT: ContentDetailes = {
  id: 0,
  poster_path: "-",
  backdrop_path: "-",
  name: "-",
  original_name: "-",
  title: "-",
  original_title: "-",
  original_language: "-",
  known_for: [],
  known_for_department: "-",
  profile_path: "-",
  origin_country: [],
  first_air_date: "-",
  release_date: "-",
  last_air_date: "-",
  episode_run_time: ["-"],
  runtime: "-",
  status: "-",
  genres: [],
  genre_ids: [],
  networks: [],
  production_companies: [],
  vote_average: "-",
  vote_count: "-",
  overview: "-",
  media_type: "-",
  tagline: "-",
  budget: 0,
  number_of_seasons: "-",
  imdb_id: "",
  seasonsArr: [],
  seasons: []
}

export type { ContentDetailes }
export { CONTENT_DETAILS_DEFAULT }
