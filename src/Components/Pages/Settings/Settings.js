import React, { Component } from "react"
import { Helmet } from "react-helmet"
import * as _get from "lodash.get"
import axios from "axios"
import SignOutButton from "Components/UserAuth/SignOut/SignOutButton"
import WithAuthorization from "Components/UserAuth/Session/WithAuthorization/WithAuthorization"
import Header from "Components/UI/Header/Header"
import Footer from "Components/UI/Footer/Footer"
import { todayDate } from "Utils"
import { AppContext } from "Components/AppContext/AppContextHOC"
import PasswordUpdate from "Components/UserAuth/PasswordUpdate/PasswordUpdate"
import classNames from "classnames"
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator"
import { LoremIpsum } from "lorem-ipsum"
import "./Settings.scss"

class Profile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      verificationSent: false,
      loadingVerificationSent: false,
      errorMessage: null,
      passwordUpdate: "",
      copiedToClipboard: null,
      authUser: null,
      limitTo: 2,
      shows: [],
      chatBottomFire: false,
      pageInFocus: false,
      JSON: {}
    }

    this.authSubscriber = null
    this.clipboardTimeout = null
    this.fireListener = null
  }

  componentDidMount() {
    this.authUserListener()
    this.chatBottomListener()
  }

  componentWillUnmount() {
    this.authSubscriber()
    window.clearTimeout(this.clipboardTimeout)
  }

  sendEmailVerification = () => {
    this.setState({ loadingVerificationSent: true })
    this.context.firebase
      .sendEmailVerification()
      .then(() => {
        this.setState({ verificationSent: true, loadingVerificationSent: false, error: null })
      })
      .catch((err) => {
        this.setState({ loadingVerificationSent: false, error: err })
      })
  }

  authUserListener = () => {
    this.authSubscriber = this.context.firebase.onAuthUserListener(
      (authUser) => {
        this.setState({ authUser })
      },
      () => {
        this.setState({ authUser: null })
      }
    )
  }

  addNewMessageTopContact = async () => {
    const firebase = this.context.firebase
    const lorem = new LoremIpsum({
      sentencesPerParagraph: {
        max: 8,
        min: 4
      },
      wordsPerSentence: {
        max: 8,
        min: 4
      }
    })

    const authUid = "drv5lG97VxVBLgkdn8bMhdxmqQT2"

    for (let i = 1; i <= 10; i++) {
      const userKey = "-M_RA1TH89UezfmnVMzX"
      const chatKey = userKey < authUid ? `${userKey}_${authUid}` : `${authUid}_${userKey}`

      const randomMessage = lorem.generateSentences(1)
      const timeStampEpoch = new Date().getTime()

      const pushNewMessage = await firebase
        .privateChats()
        .child(`${chatKey}/messages`)
        .push({
          sender: userKey,
          // sender: Math.random() > 0.5 ? userKey : authUser?.uid,
          message: randomMessage,
          timeStamp: timeStampEpoch * 2
        })

      const contactStatus = await firebase.chatMemberStatus({ chatKey, memberKey: authUid }).once("value")

      console.log(contactStatus.val())

      if (!contactStatus.val().isOnline || !contactStatus.val().chatBottom || !contactStatus.val().pageInFocus) {
        firebase.privateChats().child(`${chatKey}/members/${authUid}/unreadMessages/${pushNewMessage.key}`).set(true)
      }
    }
  }

  test = async () => {
    const firebase = this.context.firebase
    const CONTACTS_TO_ADD = 3

    const authUid = "drv5lG97VxVBLgkdn8bMhdxmqQT2"

    const lorem = new LoremIpsum({
      sentencesPerParagraph: {
        max: 8,
        min: 4
      },
      wordsPerSentence: {
        max: 8,
        min: 4
      }
    })
    console.log("test")
    firebase
      .database()
      .ref("privateChats")
      .once("value", (snapshot) => {
        // console.log(snapshot.val())
        console.log(JSON.stringify(snapshot.val()))
      })

    // const userKey = "-MY_TPe9EW9TqCibVSop"
    const userKey = "-MY_R8wzzvABzB8OWakb"
    // const userKey = "-MY_R8pjpBQGf6RDAMTt"

    const chatKey = userKey < authUid ? `${userKey}_${authUid}` : `${authUid}_${userKey}`

    // firebase
    //   .contactsDatabase({ uid: "drv5lG97VxVBLgkdn8bMhdxmqQT2" })
    //   .child("contactsList")
    //   .once("value", (snapshot) => {
    //     const keysList = Object.entries(snapshot.val())
    //     const authUid = "drv5lG97VxVBLgkdn8bMhdxmqQT2"

    //     const timeStamp = new Date().getTime()

    //     keysList.forEach(([key, value], index) => {
    //       // const chatKey = key < authUid ? `${key}_${authUid}` : `${authUid}_${key}`

    //       const ts = value.pinned_lastActivityTS.slice(-13)

    //       firebase
    //         .contactsDatabase({ uid: "drv5lG97VxVBLgkdn8bMhdxmqQT2" })
    //         .child(`contactsList/${key}/pinned_lastActivityTS`)
    //         .set(`false_${ts}`)
    //     })
    //   })

    // for (let i = 1; i <= 2; i++) {
    //   const randomName = uniqueNamesGenerator({
    //     dictionaries: [animals],
    //     // separator: " ",
    //     style: "capital"
    //   })

    //   const timeStamp = firebase.timeStamp()
    //   const userKey = await firebase.users().push({ username: randomName }).key

    //   await Promise.all([
    //     firebase.contact({ authUid: userKey, contactUid: authUid }).set({
    //       receiver: true,
    //       status: true,
    //       pinned_lastActivityTS: "false",
    //       timeStamp,
    //       userName: "Johnny"
    //     }),
    //     firebase.contact({ authUid, contactUid: userKey }).set({
    //       status: true,
    //       receiver: false,
    //       userName: randomName,
    //       timeStamp,
    //       pinned_lastActivityTS: "true"
    //     })
    //     // firebase.contactsDatabase({ uid: authUid }).child(`newContactsRequests/${userKey}`).set(true)
    //   ])

    //   const timeStampEpoch = new Date().getTime()

    //   const chatKey = userKey < authUid ? `${userKey}_${authUid}` : `${authUid}_${userKey}`

    //   for (let i = 1; i <= 500; i++) {
    //     const randomMessage = lorem.generateSentences(Math.ceil(Math.random() * 2))

    //     const pushNewMessage = await firebase
    //       .privateChats()
    //       .child(`${chatKey}/messages`)
    //       .push({
    //         sender: Math.random() > 0.5 ? userKey : authUid,
    //         // sender: userKey,
    //         // sender: authUid,
    //         message: randomMessage,
    //         timeStamp: timeStampEpoch + i * 1800000
    //       })

    //     // if (i >= 25) {
    //     // firebase.privateChats().child(`${chatKey}/members/${userKey}/unreadMessages/${pushNewMessage.key}`).set(true)
    //     // }
    //   }
    // firebase
    //   .privateChats()
    //   .child(`${chatKey}`)
    //   .update({
    //     [`members/${userKey}/isOnline`]: true,
    //     [`members/${authUid}/isOnline`]: true
    //   })
    // }
  }

  chatBottomListener = () => {
    this.context.firebase
      .user(this.context.authUser?.uid)
      .child("content/chatAtTheBottom")
      .on("value", (snapshot) => {
        this.setState({ chatBottomFire: snapshot.val() })
      })
  }

  focusListener = () => {
    this.context.firebase
      .user(this.context.authUser?.uid)
      .child("content/pageInFocus")
      .on("value", (snapshot) => {
        this.setState({ pageInFocus: snapshot.val() })
      })
  }

  addNewMessage = () => {
    const messagesRef = this.context.firebase.user(this.state.authUser?.uid).child("content/messages")
    const newMessageRef = messagesRef.push()
    const randomNumber = Math.floor(Math.random() * Math.floor(201))
    newMessageRef.set(
      {
        timeStamp: this.context.firebase.timeStamp(),
        message: "some text",
        number: randomNumber
        // read: !chatBottomFire ? false : true
      },
      () => {
        // if (this.state.chatBottomFire) return

        if (!this.state.chatBottomFire || !this.state.pageInFocus) {
          this.context.firebase
            .user(this.state.authUser?.uid)
            .child(`content/unreadMessages_uid1/${newMessageRef.key}`)
            .set(true, () => {
              if (this.state.pageInFocus) return
              this.context.firebase.user(this.state.authUser?.uid).child(`content/chatAtTheBottom`).set(false)
            })
        }
      }
    )
  }

  incr = () => {
    // this.context.firebase.userAllShows(this.state.authUser.uid).off()
    this.context.firebase.userEpisodes(this.state.authUser.uid).off()
    this.setState({ limitTo: this.state.limitTo + 1 }, () => {
      this.test()
    })
  }

  databaseModify = () => {
    // this.context.firebase.userAllShows("I9OcmC25eKfieOWppn6Pqr1sVj02").once("value", (snapshot) => {
    //   const modified = Object.entries(snapshot.val()).reduce((acc, [key, value]) => {
    //     return { ...acc, [key]: { lastUpdatedInUser: value.timeStamp } }
    //   }, {})
    //   this.context.firebase.userShowsLastUpdateList("I9OcmC25eKfieOWppn6Pqr1sVj02").set(modified)

    //   // Object.keys(snapshot.val()).forEach((key) => {
    //   //   this.context.firebase.userShow({ uid: this.context.authUser.uid, key }).update({ lastUpdatedInUser: null })
    //   // })
    // })

    const todayConverted = `${todayDate.getDate()}-${todayDate.getMonth() + 1}-${todayDate.getFullYear()}`
    const threeDaysBefore = new Date(todayDate.getTime() - 259200000)

    // const threeDaysBeforeConverted = `${threeDaysBefore.getDate()}-${
    //   threeDaysBefore.getMonth() + 1
    // }-${threeDaysBefore.getFullYear()}`

    axios
      .get(
        `https://api.themoviedb.org/3/tv/changes?api_key=${process.env.REACT_APP_TMDB_API}&end_date=${todayConverted}&start_date=${threeDaysBefore}`
      )
      .then(async ({ data }) => {
        // const tempData = [{ id: 1396 }]
        // const allShowsIds = await this.context.firebase
        //   .allShowsList()
        //   .once("value")
        //   .then((snapshot) =>
        //     Object.keys(snapshot.val()).map((id) => {
        //       return { id }
        //     })
        //   )

        data.results.forEach((show) => {
          this.context.firebase
            .showInDatabase(show.id)
            .child("id")
            .once("value", (snapshot) => {
              if (snapshot.val() !== null) {
                axios
                  .get(
                    `https://api.themoviedb.org/3/tv/${show.id}?api_key=${process.env.REACT_APP_TMDB_API}&language=en-US`
                  )
                  .then(({ data: { number_of_seasons } }) => {
                    console.log(show.id)
                    const maxSeasonsInChunk = 20
                    const allSeasons = []
                    const seasonChunks = []
                    const apiRequests = []
                    for (let i = 1; i <= number_of_seasons; i += 1) {
                      allSeasons.push(`season/${i}`)
                    }
                    for (let i = 0; i <= allSeasons.length; i += maxSeasonsInChunk) {
                      const chunk = allSeasons.slice(i, i + maxSeasonsInChunk)
                      seasonChunks.push(chunk.join())
                    }
                    seasonChunks.forEach((item) => {
                      const request = axios.get(
                        `https://api.themoviedb.org/3/tv/${show.id}?api_key=${process.env.REACT_APP_TMDB_API}&append_to_response=${item}`
                      )
                      apiRequests.push(request)
                    })
                    return axios.all([...apiRequests])
                  })
                  .then(
                    axios.spread((...responses) => {
                      const rowData = []
                      const seasonsData = []
                      responses.forEach((item) => {
                        rowData.push(item.data)
                      })
                      const mergedRowData = Object.assign({}, ...rowData)
                      Object.entries(mergedRowData).forEach(([key, value]) => {
                        if (!key.indexOf("season/")) {
                          seasonsData.push({ [key]: { ...value } })
                        }
                      })
                      const allEpisodes = []
                      seasonsData.forEach((data, index) => {
                        const season = data[`season/${index + 1}`]
                        if (!Array.isArray(season.episodes) || season.episodes.length === 0) return
                        const episodes = []
                        season.episodes.forEach((item) => {
                          const updatedEpisode = {
                            air_date: item.air_date || "",
                            episode_number: item.episode_number || null,
                            name: item.name || null,
                            season_number: item.season_number || null,
                            id: item.id
                          }
                          episodes.push(updatedEpisode)
                        })
                        const updatedSeason = {
                          air_date: season.air_date || "",
                          season_number: season.season_number || null,
                          id: season._id,
                          poster_path: season.poster_path || null,
                          name: season.name || null,
                          episodes
                        }
                        allEpisodes.push(updatedSeason)
                      })
                      const dataToPass = {
                        episodes: allEpisodes,
                        status: mergedRowData.status,
                        name: mergedRowData.name
                      }
                      return dataToPass
                    })
                  )
                  .then((data) => {
                    this.context.firebase
                      .showInDatabase(show.id)
                      .update({
                        episodes: data.episodes,
                        status: data.status
                      })
                      .catch((err) => {
                        console.log(err)
                      })
                    this.context.firebase.showInfo(show.id).update({
                      status: data.status,
                      name: data.name
                    })
                    this.context.firebase
                      .showInfo(show.id)
                      .child("lastUpdatedInDatabase")
                      .set(this.context.firebase.timeStamp())
                  })
                  .catch((err) => {
                    console.log(err)
                  })
              }
            })
        })
      })
  }

  handleOnChange = (e) => {
    e.preventDefault()

    this.setState({
      passwordUpdate: e.target.value
    })
  }

  copyToClipboard = (text) => {
    clearTimeout(this.clipboardTimeout)
    navigator.clipboard.writeText(text)
    this.setState({ copiedToClipboard: true })
    this.clipboardTimeout = setTimeout(() => {
      this.setState({ copiedToClipboard: false })
    }, 3000)
  }

  render() {
    return (
      <>
        <Helmet>
          <title>Settings | TV Junkie</title>
        </Helmet>
        <Header />
        <div className="user-settings">
          <div className="user-settings__email">
            Sign in with <span>{this.context.authUser.email}</span>
          </div>
          <div className="user-settings__verified">
            {this.context.authUser.emailVerified ? (
              "Email verified"
            ) : (
              <>
                Email not verified{" "}
                {this.state.verificationSent ? (
                  <div className="user-settings__sent-message">Verification sent</div>
                ) : (
                  <button onClick={this.sendEmailVerification} className="button button--profile" type="button">
                    {this.state.loadingVerificationSent ? (
                      <span className="auth__form-loading"></span>
                    ) : (
                      "Send email verification"
                    )}
                  </button>
                )}
              </>
            )}
            {this.state.error && (
              <div className="user-settings__error-email-verification">{this.state.error.message}</div>
            )}
          </div>
          <PasswordUpdate />
          {_get(this.state.authUser, "email", "") === process.env.REACT_APP_TEST_EMAIL ||
            _get(this.state.authUser, "email", "") === process.env.REACT_APP_ADMIN_EMAIL ||
            (_get(this.state.authUser, "email", "") === "test2@test.com" && (
              <>
                <div className="update-database">
                  <button onClick={() => this.databaseModify()} className="button button--profile" type="button">
                    Update Database
                  </button>
                </div>
              </>
            ))}
          <div className="user-settings__copy-user-link">
            <div
              className={classNames("button", {
                "button--clipboard-copied": this.state.copiedToClipboard
              })}
              onClick={() =>
                this.copyToClipboard(
                  `${
                    process.env.NODE_ENV === "production" ? "https://www.tv-junkie.com" : "http://localhost:3000"
                  }/user/${this.state.authUser.uid}`
                )
              }
            >
              {!this.state.copiedToClipboard ? (
                <span
                  className={classNames("clipboard-message", {
                    "clipboard-message__not-copied": this.state.copiedToClipboard === false
                  })}
                >
                  Copy profile link
                </span>
              ) : (
                <span
                  className={classNames("clipboard-message", {
                    "clipboard-message__copied": this.state.copiedToClipboard
                  })}
                >
                  Copied
                </span>
              )}
            </div>
          </div>
          <button className="button" onClick={() => this.addNewMessageTopContact()}>
            topContact
          </button>
          <button className="button" onClick={() => this.test()}>
            test
          </button>
          <button className="button" onClick={() => this.incr()}>
            increase number {this.state.limitTo}
          </button>
          <button className="button" onClick={() => this.addNewMessage()}>
            Add new message
          </button>
          <div className="user-settings__signout">
            <SignOutButton />
          </div>
        </div>
        <Footer />
      </>
    )
  }
}

const condition = (authUser) => authUser !== null

export default WithAuthorization(condition)(Profile)
Profile.contextType = AppContext