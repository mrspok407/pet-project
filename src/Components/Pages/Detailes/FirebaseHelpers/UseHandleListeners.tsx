import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import {
  SeasonEpisodesFromDatabaseInterface,
  SingleEpisodeInterface
} from "Components/UserContent/UseUserShows/UseUserShows"
import { useState, useEffect } from "react"
import { releasedEpisodesToOneArray } from "Utils"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"

export interface HandleListenersArg {
  id: number
  status: string
  firebase: FirebaseInterface
  authUser: AuthUserInterface | null
  handleLoading?: (isLoading: boolean) => void
}

const useHandleListeners = () => {
  const [episodesFromDatabase, setEpisodesFromDatabase] = useState<
    SeasonEpisodesFromDatabaseInterface[] | null
  >()
  const [releasedEpisodes, setReleasedEpisodes] = useState<SingleEpisodeInterface[] | null>()

  const handleListeners = ({ id, status, handleLoading, firebase, authUser }: HandleListenersArg) => {
    if (status === "-" || !authUser) return

    const statusDatabase = status === "Ended" || status === "Canceled" ? "ended" : "ongoing"
    firebase
      .showEpisodes(id)
      .once("value", (snapshot: { val: () => SeasonEpisodesFromDatabaseInterface[] }) => {
        if (snapshot.val() === null) {
          if (handleLoading) handleLoading(false)
          console.log("early return showsEpisodes")
          return
        }

        const releasedEpisodes: SingleEpisodeInterface[] = releasedEpisodesToOneArray({
          data: snapshot.val()
        })

        firebase
          .userShowAllEpisodes(authUser.uid, id)
          .on("value", (snapshot: { val: () => SeasonEpisodesFromDatabaseInterface[] }) => {
            if (snapshot.val() === null) {
              if (handleLoading) handleLoading(false)
              return
            }

            console.log("detailes Listener")

            const userEpisodes = snapshot.val()
            const allEpisodes = userEpisodes.reduce((acc: SingleEpisodeInterface[], item) => {
              acc.push(...item.episodes)
              return acc
            }, [])

            allEpisodes.splice(releasedEpisodes.length)

            const allEpisodesWatched = !allEpisodes.some((episode) => !episode.watched)
            const finished = statusDatabase === "ended" && allEpisodesWatched ? true : false

            firebase
              .userShowAllEpisodesInfo(authUser.uid, id)
              .child("database")
              .once("value", (snapshot: { val: () => string }) => {
                firebase.userShowAllEpisodesInfo(authUser.uid, id).update({
                  allEpisodesWatched,
                  finished,
                  isAllWatched_database: `${allEpisodesWatched}_${snapshot.val()}`
                })
              })

            firebase.userShow({ uid: authUser.uid, key: id }).update({ finished, allEpisodesWatched })

            setEpisodesFromDatabase(userEpisodes)
            setReleasedEpisodes(releasedEpisodes)
            if (handleLoading) handleLoading(false)
          })
      })
  }

  useEffect(() => {
    return () => {
      setEpisodesFromDatabase(null)
      setReleasedEpisodes(null)
    }
  }, [])

  return { episodesFromDatabase, releasedEpisodes, handleListeners } as const
}

export default useHandleListeners
