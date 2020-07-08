/* eslint-disable no-prototype-builtins */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import axios, { CancelToken } from "axios"
import PlaceholderLoadingFullInfo from "Components/Placeholders/PlaceholderLoadingFullInfo/PlaceholderLoadingFullInfo"
import ScrollToTop from "Utils/ScrollToTop"
import Header from "Components/Header/Header"
import Slider from "Utils/Slider/Slider"
import MainInfo from "./Components/MainInfo"
import ShowsEpisodes from "./Components/ShowsEpisodes/ShowsEpisodes"
import PosterWrapper from "./Components/PosterWrapper"
import "./FullContentInfo.scss"
import { withUserContent } from "Components/UserContent"

const todayDate = new Date()

let cancelRequest

function FullContentInfo({
  match: {
    params: { id, mediaType }
  },
  userContent,
  firebase,
  authUser
}) {
  const [detailes, setDetailes] = useState({
    poster: "",
    posterMobile: "",
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
    numberOfSeasons: "",
    seasonsArr: [],
    tagline: "",
    budget: "",
    imdbId: ""
  })

  const [similarContent, setSimilarContent] = useState([])

  const [loadingPage, setLoadingPage] = useState(true)
  const [loadingFromDatabase, setLoadingFromDatabase] = useState(false)
  const [showInDatabase, setShowInDatabase] = useState({ database: null, info: null, episodes: null })
  const [showDatabaseOnClient, setShowDatabaseOnClient] = useState(null)
  const [showEpisodesDatabase, setShowEpisodesDatabase] = useState([])

  const [movieInDatabase, setMovieInDatabase] = useState(null)
  const [movieDatabaseOnClient, setMovieDatabaseOnClient] = useState(null)

  const [infoToPass, setInfoToPass] = useState([])

  const [error, setError] = useState()

  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    if (mediaType === "show") {
      getFullShowInfo()
      getShowInDatabase()
    } else if (mediaType === "movie") {
      getFullMovieInfo()
      getMovieInDatabase()
    }

    return () => {
      if (cancelRequest !== undefined) {
        cancelRequest()
      }
      if (!authUser) return

      userContent.showsDatabases.forEach(database => {
        firebase.userShows(authUser.uid, database).off()
      })

      firebase.watchLaterMovies(authUser.uid).off()

      setShowInDatabase({ database: null, info: null })
      setShowEpisodesDatabase(null)
      setShowDatabaseOnClient(null)
    }
  }, [mediaType, id])

  const getFullShowInfo = () => {
    setLoadingPage(true)
    axios
      .get(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US&append_to_response=similar`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          })
        }
      )
      .then(
        ({
          data,
          data: {
            name,
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
            number_of_seasons,
            seasons,
            similar
          }
        }) => {
          const genreIds = genres && genres.length ? genres.map(item => item.id) : "-"
          const genreNames = genres && genres.length ? genres.map(item => item.name).join(", ") : "-"
          const networkNames = networks && networks.length ? networks.map(item => item.name).join(", ") : "-"

          const similarShows = similar.results.filter(item => item.poster_path)
          const similarShowsSortByVotes = similarShows.sort((a, b) => b.vote_count - a.vote_count)

          setInfoToPass([
            {
              name,
              original_name,
              id: data.id,
              first_air_date,
              vote_average,
              genre_ids: genreIds,
              overview,
              backdrop_path,
              poster_path,
              vote_count,
              status
            }
          ])

          setDetailes({
            poster: poster_path,
            posterMobile: backdrop_path,
            title: name || original_name || "-",
            releaseDate: first_air_date || "-",
            lastAirDate: last_air_date || "-",
            runtime: episode_run_time[0] || "-",
            status: status || "-",
            genres: genreNames || "-",
            network: networkNames || "-",
            rating: vote_average || "-",
            description: overview || "-",
            numberOfSeasons: number_of_seasons || "-",
            seasonsArr: seasons.reverse()
          })
          setSimilarContent(similarShowsSortByVotes)
          setLoadingPage(false)
        }
      )
      .catch(err => {
        if (axios.isCancel(err)) return
        setError("Something went wrong, sorry")
        setLoadingPage(false)
      })
  }

  const getFullMovieInfo = () => {
    setLoadingPage(true)
    axios
      .get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US&append_to_response=similar_movies`,
        {
          cancelToken: new CancelToken(function executor(c) {
            cancelRequest = c
          })
        }
      )
      .then(
        ({
          data,
          data: {
            poster_path,
            backdrop_path,
            original_title,
            title,
            release_date,
            runtime,
            status,
            genres,
            production_companies,
            vote_average,
            vote_count,
            overview,
            tagline,
            budget,
            imdb_id,
            similar_movies
          }
        }) => {
          const movieGenres = genres.map(item => item.name).join(", ")
          const genresIds = genres.map(item => item.id)

          const prodComp =
            production_companies.length === 0 || !production_companies ? "-" : production_companies[0].name

          const similarMovies = similar_movies.results.filter(item => item.poster_path)
          const similarMoviesSortByVotes = similarMovies.sort((a, b) => b.vote_count - a.vote_count)

          setInfoToPass([
            {
              title,
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

          setDetailes({
            poster: poster_path,
            posterMobile: backdrop_path,
            title: title || original_title || "-",
            releaseDate: release_date || "-",
            runtime: runtime || "-",
            status: status || "-",
            genres: movieGenres || "-",
            productionCompany: prodComp,
            rating: vote_average || "-",
            description: overview || "-",
            tagline: tagline || "-",
            budget: budget || "-",
            imdbId: imdb_id || ""
          })

          setSimilarContent(similarMoviesSortByVotes)
          setLoadingPage(false)
        }
      )
      .catch(err => {
        if (axios.isCancel(err)) return
        setError("Something went wrong, sorry. Try to reload the page.")
        setLoadingPage(false)
      })
  }

  const getShowInDatabase = () => {
    if (!authUser) return
    setLoadingFromDatabase(true)

    let counter = 0

    userContent.showsDatabases.forEach(database => {
      counter++

      firebase
        .userShows(authUser.uid, database)
        .child(Number(id))
        .on(
          "value",
          snapshot => {
            if (snapshot.val() !== null) {
              // const showInfo = {
              //   ...snapshot.val()
              // }
              // delete showInfo.episodes

              setShowInDatabase({ database, info: snapshot.val() })
              setShowEpisodesDatabase(snapshot.val().episodes)
              setShowDatabaseOnClient(database)
            }

            if (counter === userContent.showsDatabases.length) {
              setLoadingFromDatabase(false)
            }
          },
          error => {
            console.log(`Error in database occured. ${error}`)

            setShowDatabaseOnClient(showInDatabase.database)
          }
        )
    })
  }

  const changeShowDatabaseOnClient = database => {
    setShowDatabaseOnClient(database)
  }

  // useEffect(() => {
  //   if (!authUser) return

  //   console.log(showInDatabase)

  //   firebase.userShowAllEpisodes(authUser.uid, id, showInDatabase.database).once("value", snapshot => {
  //     console.log(snapshot.val())
  //     setShowEpisodesDatabase(snapshot.val())
  //   })

  //   setShowDatabaseOnClient(showInDatabase.database)
  // }, [showInDatabase])

  const getMovieInDatabase = () => {
    if (!authUser) return
    setLoadingFromDatabase(true)

    userContent.moviesDatabases.forEach(item => {
      firebase[item](authUser.uid)
        .child(Number(id))
        .on(
          "value",
          snapshot => {
            if (snapshot.val() !== null) {
              setMovieInDatabase(item)
            } else {
              setMovieInDatabase(null)
            }
            setLoadingFromDatabase(false)
          },
          error => {
            console.log(`Error in database occured. ${error}`)

            setMovieDatabaseOnClient(movieInDatabase)
          }
        )
    })
  }

  useEffect(() => {
    setMovieDatabaseOnClient(movieInDatabase)
  }, [movieInDatabase])

  const changeMovieDatabaseOnClient = database => {
    if (movieDatabaseOnClient === "watchLaterMovies") {
      setMovieDatabaseOnClient(null)
    } else {
      setMovieDatabaseOnClient(database)
    }
  }

  return (
    <>
      <Header isLogoVisible={false} />
      <div className="full-detailes-container">
        {error ? (
          <div className="full-detailes__error">
            <h1>{error}</h1>
          </div>
        ) : !loadingPage && !loadingFromDatabase ? (
          <div className="full-detailes">
            <PosterWrapper
              poster={detailes.poster}
              posterMobile={detailes.posterMobile}
              imdbId={detailes.imdbId}
              releaseDate={detailes.releaseDate}
              todayDate={todayDate}
              mediaType={mediaType}
            />

            <MainInfo
              title={detailes.title}
              mediaType={mediaType}
              releaseDate={detailes.releaseDate}
              lastAirDate={detailes.lastAirDate}
              status={detailes.status}
              genres={detailes.genres}
              network={detailes.network}
              productionCompany={detailes.productionCompany}
              rating={detailes.rating}
              runtime={detailes.runtime}
              tagline={detailes.tagline}
              budget={detailes.budget}
              imdbId={detailes.imdbId}
              id={id}
              infoToPass={infoToPass}
              showInDatabase={showInDatabase}
              showEpisodesDatabase={showEpisodesDatabase}
              getShowInDatabase={getShowInDatabase}
              changeShowDatabaseOnClient={changeShowDatabaseOnClient}
              changeMovieDatabaseOnClient={changeMovieDatabaseOnClient}
              showDatabaseOnClient={showDatabaseOnClient}
              movieDatabaseOnClient={movieDatabaseOnClient}
              movieInDatabase={movieInDatabase}
            />

            <div className="full-detailes__description">{detailes.description}</div>

            {mediaType === "show" && (
              <>
                <ShowsEpisodes
                  seasonsArr={detailes.seasonsArr}
                  showTitle={detailes.title}
                  todayDate={todayDate}
                  id={id}
                  showInDatabase={showInDatabase}
                  infoToPass={infoToPass}
                  showEpisodesDatabase={showEpisodesDatabase}
                />
              </>
            )}
            {similarContent.length > 0 && (
              <div className="full-detailes__slider">
                <div className="full-detailes__slider-title">
                  {mediaType === "movie" ? "Similar movies" : "Similar shows"}
                </div>

                <Slider listOfContent={similarContent} />
              </div>
            )}
          </div>
        ) : (
          <PlaceholderLoadingFullInfo delayAnimation="0.4s" />
        )}
      </div>
      <ScrollToTop />
    </>
  )
}

export default withUserContent(FullContentInfo, "FullContentInfo")
