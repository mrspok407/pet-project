import React, { Component } from "react"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import { Helmet } from "react-helmet"
import ScrollToTop from "Utils/ScrollToTopBar"
import HeaderBase from "Components/UI/Header/Header"
import ToWatchEpisodesContent from "./ToWatchEpisodesContent"
import WithAuthorization from "Components/UserAuth/Session/WithAuthorization/WithAuthorization"
import Footer from "Components/UI/Footer/Footer"
import "./ToWatchEpisodes.scss"

const Header = withFirebase(HeaderBase)

class ToWatchEpisodesPage extends Component {
  render() {
    return (
      <>
        <Helmet>
          <title>Shows to watch | TV Junkie</title>
        </Helmet>
        <Header />
        <ToWatchEpisodesContent />
        <Footer />
        <ScrollToTop />
      </>
    )
  }
}

const condition = (authUser) => authUser !== null

export default WithAuthorization(condition)(ToWatchEpisodesPage)
