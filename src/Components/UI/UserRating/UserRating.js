import React, { Component } from "react"
import classNames from "classnames"
import { Link } from "react-router-dom"
import * as ROUTES from "Utils/Constants/routes"
import "./UserRating.scss"
import { AppContext } from "Components/AppContext/AppContextHOC"

const STAR_AMOUNT = 5

class UserRating extends Component {
  constructor(props) {
    super(props)

    this.state = {
      userRating: 0,
      nonAuthWarning: false
    }

    this.userRatingRef = React.createRef()
  }

  componentDidMount() {
    this.getRating()
    document.addEventListener("mousedown", this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside)
  }

  getRating = () => {
    if (this.context.authUser === null || this.props.toWatchPage) return

    this.context.firebase[this.props.firebaseRef]({
      uid: this.context.authUser.uid,
      key: Number(this.props.id),
      seasonNum: this.props.seasonNum,
      episodeNum: this.props.episodeNum
    }).once("value", (snapshot) => {
      if (snapshot.val() === null) return

      this.setState({
        userRating: snapshot.val().userRating
      })
    })
  }

  onMouseMoveHandler = (e) => {
    if (this.context.authUser === null || this.props.disableHover) return

    const buttonsNodeList = e.target.parentElement.getElementsByClassName("user-rating__button")
    const currentRating = e.target.dataset.rating

    Array.from(buttonsNodeList).forEach((star, index) => {
      if (index + 1 <= currentRating) {
        star.classList.add("user-rating__button-hovered")
      }
      if (index + 1 > currentRating) {
        star.classList.remove("user-rating__button-rated")
      }
    })
  }

  onMouseLeaveHandler = (e) => {
    if (this.context.authUser === null || this.props.disableHover) return

    const buttonsNodeList = e.target.parentElement.getElementsByClassName("user-rating__button")

    Array.from(buttonsNodeList).forEach((star, index) => {
      star.classList.remove("user-rating__button-hovered")

      if (index + 1 <= this.state.userRating) {
        star.classList.add("user-rating__button-rated")
      }
    })
  }

  onClickHandler = (e) => {
    if (this.context.authUser === null || this.props.disableHover) return
    if (this.props.toWatchPage) {
      this.props.handleFadeOut(this.props.episodeId, this.props.episodeNum)
    }

    const rating = e.target.dataset.rating

    this.context.firebase[this.props.firebaseRef]({
      uid: this.context.authUser.uid,
      key: Number(this.props.id),
      seasonNum: this.props.seasonNum,
      episodeNum: this.props.episodeNum
    }).once("value", (snapshot) => {
      console.log(snapshot.val())
      if (snapshot.val() === null) return

      this.setState({
        userRating: rating
      })

      this.context.firebase[this.props.firebaseRef]({
        uid: this.context.authUser.uid,
        key: Number(this.props.id),
        seasonNum: this.props.seasonNum,
        episodeNum: this.props.episodeNum
      }).update({
        userRating: rating,
        watched: this.props.toWatchPage ? snapshot.val().watched : this.props.episodeRating ? true : null
      })
    })
  }

  handleClickOutside = (e) => {
    if (this.userRatingRef.current && !this.userRatingRef.current.contains(e.target)) {
      this.setState({
        nonAuthWarning: false
      })
    }
  }

  render() {
    const disableRating =
      this.context.authUser === null ||
      this.props.disableRating ||
      (this.props.showDatabase === null && this.props.showRating && this.props.mediaType !== "movie")

    return (
      <div
        ref={this.userRatingRef}
        className="user-rating"
        onClick={() => {
          if (this.context.authUser !== null) return
          this.setState({ nonAuthWarning: !this.state.nonAuthWarning })
        }}
      >
        {[...Array(STAR_AMOUNT).keys()].map((n) => (
          <button
            key={n}
            data-rating={n + 1}
            type="button"
            className={classNames("user-rating__button", {
              "user-rating__button-rated": n + 1 <= this.state.userRating,
              "user-rating__button--disabled": disableRating
            })}
            onMouseMove={!disableRating ? this.onMouseMoveHandler : undefined}
            onMouseLeave={!disableRating ? this.onMouseLeaveHandler : undefined}
            onClick={!disableRating ? this.onClickHandler : undefined}
          ></button>
        ))}

        {this.state.nonAuthWarning && (
          <div className="user-rating__warning">
            To use full features please <Link to={ROUTES.LOGIN_PAGE}>register</Link>. Your allready selected
            shows will be saved.
          </div>
        )}
      </div>
    )
  }
}
export default UserRating
UserRating.contextType = AppContext