/* eslint-disable no-prototype-builtins */
/* eslint-disable no-use-before-define */
import React, { useState, useEffect, useContext } from "react"
import axios from "axios"
import { SelectedContentContext } from "../../Context/SelectedContentContext"
import { API_KEY } from "../../../Utils"
import "./FullContentInfo.scss"
import PlaceholderLoadingFullInfo from "../../Placeholders/PlaceholderLoadingFullInfo"
import Header from "../../Header/Header"

const todayDate = new Date()

export default function FullContentInfo({
  match: {
    params: { id, mediaType }
  }
}) {
  const [options, setOptions] = useState({
    poster: "",
    title: "",
    releaseDate: "",
    lastAirDate: "",
    runtime: "",
    status: "",
    genres: [],
    network: "",
    productionCompany: "",
    rating: "",
    description: "",
    seasons: "",
    tagline: "",
    budget: ""
  })

  const [loading, setLoading] = useState(true)

  const [infoToPass, setInfoToPass] = useState([])
  const [movieTorrents, setMovieTorrents] = useState({
    title: "",
    hash1080p: "",
    hash720p: ""
  })
  const [error, setError] = useState()

  const { selectedContent, toggleContent } = useContext(SelectedContentContext)

  useEffect(() => {
    if (mediaType === "show") {
      getFullShowInfo()
    } else if (mediaType === "movie") {
      getFullMovieInfo()
    }
  }, [mediaType])

  const getFullShowInfo = () => {
    setLoading(true)

    axios
      .get(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`
      )
      .then(
        ({
          data,
          data: {
            original_name,
            first_air_date,
            vote_average,
            genres,
            overview,
            backdrop_path,
            poster_path,
            vote_count,
            episode_run_time,
            status,
            networks,
            last_air_date,
            number_of_seasons
          }
        }) => {
          const genreIds =
            genres && genres.length ? genres.map(item => item.id) : "-"
          const genreNames =
            genres && genres.length
              ? genres.map(item => item.name).join(", ")
              : "-"
          const networkNames =
            networks && networks.length
              ? networks.map(item => item.name).join(", ")
              : "-"

          setInfoToPass([
            {
              original_name,
              id: data.id,
              first_air_date,
              vote_average,
              genre_ids: genreIds,
              overview,
              backdrop_path,
              poster_path,
              vote_count
            }
          ])

          setOptions({
            poster: poster_path,
            title: original_name || "-",
            releaseDate: first_air_date || "-",
            lastAirDate: last_air_date || "-",
            runtime: episode_run_time[0] || "-",
            status: status || "-",
            genres: genreNames || "-",
            network: networkNames || "-",
            rating: vote_average || "-",
            description: overview || "-",
            seasons: number_of_seasons || "-"
          })
          setLoading(false)
        }
      )
      .catch(() => {
        setError("Something went wrong, sorry")
      })

    // const getExternalId = axios.get(
    //   `https://api.themoviedb.org/3/tv/${id}/external_ids?api_key=${API_KEY}&language=en-US`
    // )

    // const getInfoToPass = axios.get(
    //   `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US`
    // )

    // axios
    //   .all([getExternalId, getInfoToPass])
    //   .then(
    //     axios.spread((...responses) => {
    //       const externalId = !responses[0].data.tvdb_id
    //         ? `imdb=${responses[0].data.imdb_id}`
    //         : `thetvdb=${responses[0].data.tvdb_id}`
    //       const showsInfo = responses[1].data

    //       const genreIds = showsInfo.genres.map(item => item.id)

    // setInfoToPass([
    //   {
    //     original_name: showsInfo.original_name,
    //     id: showsInfo.id,
    //     first_air_date: showsInfo.first_air_date,
    //     vote_average: showsInfo.vote_average,
    //     genre_ids: genreIds,
    //     overview: showsInfo.overview,
    //     backdrop_path: showsInfo.backdrop_path,
    //     poster_path: showsInfo.poster_path,
    //     vote_count: showsInfo.vote_count
    //   }
    // ])

    //       return axios.get(
    //         `https://api.tvmaze.com/lookup/shows?${externalId}&embed=episodes`
    //       )
    //     })
    //   )
    //   .then(({ data }) => {
    //     const tvmazeId = data.id
    //     return axios.get(
    //       `https://api.tvmaze.com/shows/${tvmazeId}?embed[]=episodes&embed[]=seasons&embed[]=previousepisode`
    //     )
    //   })
    //   .then(
    //     ({
    //       data: {
    //         name,
    //         image,
    //         premiered,
    //         runtime,
    //         status,
    //         genres,
    //         network,
    //         webChannel,
    //         rating,
    //         summary,
    //         _embedded
    //       }
    //     }) => {
    // setOptions({
    //   poster: image.medium,
    //   title: name,
    //   releaseDate: premiered,
    //   lastAirDate: _embedded.previousepisode.airdate,
    //   runtime,
    //   status,
    //   genres,
    //   network: network ? network.name : false,
    //   webChannel: webChannel ? webChannel.name : false,
    //   rating,
    //   description: summary,
    //   seasons: _embedded.seasons.length
    // })

    // setLoading(false)
    //     }
    //   )
    // .catch(() => {
    //   setError("Something went wrong, sorry")
    // })
  }

  const getFullMovieInfo = () => {
    setLoading(true)
    axios
      .get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`
      )
      .then(
        ({
          data,
          data: {
            poster_path,
            backdrop_path,
            original_title,
            release_date,
            runtime,
            status,
            genres,
            production_companies,
            vote_average,
            vote_count,
            overview,
            tagline,
            budget
          }
        }) => {
          const movieGenres = genres.map(item => item.name).join(", ")
          const genresIds = genres.map(item => item.id)
          const yearRelease = release_date.slice(0, 4)

          const prodComp =
            production_companies.length === 0 || !production_companies
              ? "-"
              : production_companies[0].name

          setInfoToPass([
            {
              original_title,
              id: data.id,
              release_date,
              vote_average,
              genre_ids: genresIds,
              overview,
              backdrop_path,
              poster_path,
              vote_count
            }
          ])

          setOptions({
            poster: poster_path,
            title: original_title || "-",
            releaseDate: release_date || "-",
            runtime: runtime || "-",
            status: status || "-",
            genres: movieGenres || "-",
            productionCompany: prodComp,
            rating: vote_average || "-",
            description: overview || "-",
            tagline: tagline || "-",
            budget: budget || "-"
          })

          setLoading(false)

          return axios.get(
            `https://yts.mx/api/v2/list_movies.json?query_term=${original_title} ${yearRelease}`
          )
        }
      )
      .then(res => {
        if (!res.data.data.hasOwnProperty("movies")) return
        const movie = res.data.data.movies[0]
        const movieHash1080p = movie.torrents.find(
          item => item.quality === "1080p"
        ).hash

        const movieHash720p = movie.torrents.find(
          item => item.quality === "720p"
        ).hash

        setMovieTorrents({
          title: movie.title,
          hash1080p: movieHash1080p,
          hash720p: movieHash720p
        })
      })
      .catch(() => {
        setError("Something went wrong, sorry")
      })
  }

  const {
    poster,
    title,
    releaseDate,
    lastAirDate,
    runtime,
    status,
    genres,
    network,
    productionCompany,
    rating,
    description,
    tagline,
    budget
  } = options

  const yearRelease = releaseDate.slice(0, 4)
  const yearEnded = mediaType === "show" && lastAirDate.slice(0, 4)

  const yearReleaseAsDateObj = new Date(releaseDate)

  const yearRange =
    status !== "Ended"
      ? `${yearRelease} - ...`
      : `${yearRelease} - ${yearEnded}`

  const formatedBudget =
    budget !== 0 && budget !== "-" ? (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      })
        .format(budget)
        .slice(0, -3)
        .split(",")
        .join(".")
    ) : (
      <span className="full-detailes__info-no-info">-</span>
    )

  return (
    <>
      <Header isLogoVisible={false} />
      <div className="full-detailes-container">
        {error ? (
          <span style={{ textAlign: "center", width: "100%" }}>{error}</span>
        ) : !loading ? (
          <div className="full-detailes">
            <div
              className={
                mediaType === "show"
                  ? "full-detailes__poster-wrapper"
                  : "full-detailes__poster-wrapper full-detailes__poster-wrapper--movie"
              }
            >
              <div
                className="full-detailes__poster"
                style={
                  mediaType === "show"
                    ? {
                        backgroundImage: `url(https://image.tmdb.org/t/p/w500/${poster})`
                      }
                    : mediaType === "movie"
                    ? {
                        backgroundImage: `url(https://image.tmdb.org/t/p/w500/${poster})`
                      }
                    : {
                        backgroundImage: `url(https://homestaymatch.com/images/no-image-available.png)`
                      }
                }
              />
              {mediaType === "movie" &&
              yearReleaseAsDateObj.getTime() < todayDate.getTime() ? (
                <div className="full-detailes__links">
                  <div className="full-detailes__links-torrents">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`magnet:?xt=urn:btih:${movieTorrents.hash1080p}&dn=${movieTorrents.title}&xl=310660222&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2Ftracker.pirateparty.gr:6969/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.opentrackr.org:1337/announce&tr=udp%3A%2F%2Ftracker.internetwarriors.net:1337/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Ftracker.iamhansen.xyz:2000/announce&tr=udp%3A%2F%2Fexplodie.org:6969/announce&tr=udp%3A%2F%2Fdenis.stalker.upeer.me:6969/announce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu:80/announce`}
                    >
                      1080p
                    </a>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`magnet:?xt=urn:btih:${movieTorrents.hash720p}&dn=${movieTorrents.title}&xl=310660222&tr=udp%3A%2F%2Ftracker.coppersurfer.tk:6969/announce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org:6969/announce&tr=udp%3A%2F%2Ftracker.pirateparty.gr:6969/announce&tr=udp%3A%2F%2Fexodus.desync.com:6969/announce&tr=udp%3A%2F%2Ftracker.opentrackr.org:1337/announce&tr=udp%3A%2F%2Ftracker.internetwarriors.net:1337/announce&tr=udp%3A%2F%2Ftracker.torrent.eu.org:451&tr=udp%3A%2F%2Ftracker.cyberia.is:6969/announce&tr=udp%3A%2F%2Fopen.demonii.si:1337/announce&tr=udp%3A%2F%2Fopen.stealth.si:80/announce&tr=udp%3A%2F%2Ftracker.tiny-vps.com:6969/announce&tr=udp%3A%2F%2Ftracker.iamhansen.xyz:2000/announce&tr=udp%3A%2F%2Fexplodie.org:6969/announce&tr=udp%3A%2F%2Fdenis.stalker.upeer.me:6969/announce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu:80/announce`}
                    >
                      720p
                    </a>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>

            <div className="full-detailes__info">
              <div className="full-detailes__info-title">
                {title}
                <span>
                  {mediaType === "show" && yearRelease !== "-"
                    ? ` (${yearRange})`
                    : ""}
                </span>
              </div>
              <div className="full-detailes__info-row">
                <div className="full-detailes__info-option">Year</div>
                <div className="full-detailes__info-value">
                  {yearRelease !== "-" ? (
                    `${yearRelease}`
                  ) : (
                    <span className="full-detailes__info-no-info">
                      {yearRelease}
                    </span>
                  )}
                </div>
              </div>
              {status !== "Released" && (
                <div className="full-detailes__info-row">
                  <div className="full-detailes__info-option">Status</div>
                  <div className="full-detailes__info-value">{status}</div>
                </div>
              )}

              <div className="full-detailes__info-row">
                <div className="full-detailes__info-option">Genres</div>
                <div className="full-detailes__info-value">{genres}</div>
              </div>
              <div className="full-detailes__info-row">
                <div className="full-detailes__info-option">Company</div>
                <div className="full-detailes__info-value">
                  {mediaType === "show"
                    ? network
                    : mediaType === "movie" &&
                      (productionCompany !== "-" ? (
                        productionCompany
                      ) : (
                        <span className="full-detailes__info-no-info">-</span>
                      ))}
                </div>
              </div>
              <div className="full-detailes__info-row">
                <div className="full-detailes__info-option">Rating</div>
                <div className="full-detailes__info-value">
                  {rating !== "-" ? (
                    rating
                  ) : (
                    <span className="full-detailes__info-no-info">
                      {rating}
                    </span>
                  )}
                </div>
              </div>
              <div className="full-detailes__info-row">
                <div className="full-detailes__info-option">Runtime</div>
                <div className="full-detailes__info-value">
                  {runtime !== "-" ? (
                    `${runtime} min`
                  ) : (
                    <span className="full-detailes__info-no-info">
                      {runtime}
                    </span>
                  )}
                </div>
              </div>
              {mediaType === "movie" && (
                <>
                  <div className="full-detailes__info-row">
                    <div className="full-detailes__info-option">Tagline</div>
                    <div className="full-detailes__info-value">
                      {tagline !== "-" ? (
                        `${tagline}`
                      ) : (
                        <span className="full-detailes__info-no-info">
                          {tagline}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="full-detailes__info-row">
                    <div className="full-detailes__info-option">Budget</div>
                    <div className="full-detailes__info-value">
                      {formatedBudget}
                    </div>
                  </div>
                </>
              )}

              <div className="full-detailes__info-row full-detailes__info--button">
                {selectedContent.some(e => e.id === Number(id)) ? (
                  <button
                    className="button button--searchlist button--pressed"
                    onClick={() => toggleContent(Number(id), infoToPass)}
                    type="button"
                  >
                    Remove {mediaType === "movie" ? "movie" : "show"}
                  </button>
                ) : (
                  <button
                    className="button button--searchlist"
                    onClick={() => toggleContent(Number(id), infoToPass)}
                    type="button"
                  >
                    Add {mediaType === "movie" ? "movie" : "show"}
                  </button>
                )}
              </div>
            </div>
            <div className="full-detailes__info-description">{description}</div>
          </div>
        ) : (
          <PlaceholderLoadingFullInfo delayAnimation="0.4s" />
        )}
      </div>
    </>
  )
}
