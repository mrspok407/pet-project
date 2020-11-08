import React, { useState, useEffect, useContext } from "react"
import { withRouter } from "react-router-dom"
import { AppContext } from "Components/AppContext/AppContextHOC"
import * as ROLES from "Utils/Constants/roles"
import * as ROUTES from "Utils/Constants/routes"

const LOCAL_STORAGE_KEY_WATCHING_SHOWS = "watchingShowsLocalS"
const LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES = "watchLaterMoviesLocalS"

const mobileLayout = 1000

const SignInWithGoogleBase = ({ history, closeNavMobile }) => {
  const [windowSize, setWindowSize] = useState(window.innerWidth)

  useEffect(() => {
    setWindowSize(window.innerWidth)
  }, [])

  const context = useContext(AppContext)

  const onSubmit = (provider) => {
    const signInType = windowSize < mobileLayout ? "signInWithRedirect" : "signInWithPopup"

    context.firebase.app
      .auth()
      [signInType](provider)
      .then((authUser) => {
        const userRole = authUser.user.email === "mr.spok407@gmail.com" ? ROLES.ADMIN : ROLES.USER

        context.firebase
          .user(authUser.user.uid)
          .update({
            username: authUser.user.displayName,
            email: authUser.user.email,
            role: userRole
          })
          .then(() => {
            if (!authUser.additionalUserInfo.isNewUser) return

            const watchingShows = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)) || []
            const watchLaterMovies =
              JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)) || []

            this.context.userContentHandler.addShowsToDatabaseOnRegister({ shows: watchingShows })

            watchLaterMovies.forEach((item) => {
              this.context.userContentHandler.handleMovieInDatabases({
                id: item.id,
                data: item
              })
            })
          })
          .then(() => {
            localStorage.removeItem(LOCAL_STORAGE_KEY_WATCHING_SHOWS)
            localStorage.removeItem(LOCAL_STORAGE_KEY_WATCH_LATER_MOVIES)

            context.userContentLocalStorage.clearContentState()

            if (closeNavMobile) closeNavMobile()
          })
      })
      .then(() => {
        history.push(ROUTES.HOME_PAGE)
      })
      .catch((error) => {
        console.log(error)
        // setError(error.message)
      })
  }

  return (
    <div className="auth__form--google">
      <button
        className="button button--auth__form"
        type="button"
        onClick={() => onSubmit(new context.firebase.app.auth.GoogleAuthProvider())}
      >
        <div className="auth__form--google-icon"></div>
        <div className="auth__form--google-title">Google Sign In</div>
      </button>
    </div>
  )
}

const SignInWithGoogleForm = withRouter(SignInWithGoogleBase)

export default SignInWithGoogleForm
