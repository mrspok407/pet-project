/* eslint-disable react/no-access-state-in-setstate */
import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import { compose } from "recompose"
import { withFirebase } from "Components/Firebase"
import { validEmailRegex } from "Utils"
import * as ROLES from "Utils/Constants/roles"
import classNames from "classnames"
import Input from "../Input/Input"

const INITIAL_STATE = {
  inputs: {
    login: ""
  },
  requiredInputs: {
    email: "",
    password: "",
    passwordConfirm: ""
  },
  errors: {
    emailError: "",
    emailOnBlur: false,
    passwordError: "",
    passwordOnBlur: false,
    passwordConfirmError: "",
    passwordConfirmOnblur: false,
    error: ""
  },
  isAdmin: false,
  submitClicked: false,
  submitRequestLoading: false
}

class RegisterBase extends Component {
  constructor(props) {
    super(props)

    this.state = { ...INITIAL_STATE }
  }

  onSubmit = event => {
    event.preventDefault()

    const { email, password } = this.state.requiredInputs
    const errors = { ...this.state.errors }
    const roles = {}

    if (!this.isFormValid(errors, this.state.requiredInputs)) {
      for (const [key, value] of Object.entries(this.state.requiredInputs)) {
        if (value.length === 0) {
          errors[`${key}Error`] = "Required"
        }
      }
      this.setState({
        errors,
        submitClicked: true
      })
      return
    }

    this.setState({ submitRequestLoading: true })

    this.props.firebase
      .createUserWithEmailAndPassword(email, password)
      .then(authUser => {
        if (email === "mr.spok407@gmail.com") roles[ROLES.ADMIN] = ROLES.ADMIN

        this.props.firebase
          .user(authUser.user.uid)
          .set({
            username: this.state.inputs.login,
            email,
            roles
          })
          .then(() => {
            console.log("sync ok")
          })
      })
      .then(() => {
        return this.props.firebase.sendEmailVerification()
      })
      .then(authUser => {
        this.setState({ ...INITIAL_STATE })
        this.props.history.push("/")
        console.log(`user created: ${authUser}`)
      })
      .catch(error => {
        errors.error = error
        this.setState({ errors, submitRequestLoading: false })
      })
  }

  handleOnChange = event => {
    event.preventDefault()
    const { value, name } = event.target

    const validation = () => {
      const { email, password, passwordConfirm } = this.state.requiredInputs
      const errors = { ...this.state.errors }

      if (errors[`${name}OnBlur`] || this.state.submitClicked) {
        if (name === "email") {
          errors[`${name}Error`] = validEmailRegex.test(email) ? "" : "Invalid email"
        }

        if (name === "password") {
          errors[`${name}Error`] = password.length >= 6 ? "" : "Password should be at least 6 characters"

          errors.passwordConfirmError =
            password !== passwordConfirm && password.length >= 6 ? "Passwords are not the same" : ""
        }

        if (name === "passwordConfirm") {
          if (password.length >= 6)
            errors[`${name}Error`] = password !== passwordConfirm ? "Passwords are not the same" : ""
        }
      }

      if (value === "") {
        errors[`${name}Error`] = ""
        errors[`${name}OnBlur`] = false
        errors.error = ""
      }

      this.setState({
        errors
      })
    }

    this.setState(
      prevState => ({
        requiredInputs: { ...prevState.requiredInputs, [name]: value },
        inputs: { ...prevState.inputs, [name]: value }
      }),
      validation
    )
  }

  handleValidationOnblur = event => {
    event.preventDefault()

    const { value, name } = event.target
    const { email, password, passwordConfirm } = this.state.requiredInputs
    const errors = { ...this.state.errors }

    errors[`${name}OnBlur`] = true

    if (!this.state.submitClicked) {
      if (name === "email") {
        errors[`${name}Error`] = validEmailRegex.test(email) ? "" : "Invalid email"
      }

      if (name === "password") {
        errors[`${name}Error`] = password.length >= 6 ? "" : "Password should be at least 6 characters"
      }

      if (name === "passwordConfirm") {
        if (password.length >= 6)
          errors[`${name}Error`] = password !== passwordConfirm ? "Passwords are not the same" : ""
      }

      if (value === "") {
        errors[`${name}Error`] = ""
        errors[`${name}OnBlur`] = false
      }
    }

    this.setState({
      errors
    })
  }

  handleKeyDown = e => e.which === 27 && this.resetInput(e.target.name)

  resetInput = name => {
    this.setState({
      inputs: { ...this.state.inputs, [`${name}`]: "" },
      requiredInputs: { ...this.state.requiredInputs, [`${name}`]: "" },
      errors: { ...this.state.errors, [`${name}Error`]: "" }
    })
  }

  isFormValid = (errors, requiredInputs) => {
    let isValid = true

    for (const value of Object.values(requiredInputs)) {
      if (value.length === 0) {
        isValid = false
      }
    }

    for (const value of Object.values(errors)) {
      if (value.length > 0) {
        isValid = false
      }
    }

    return isValid
  }

  render() {
    const { errors, requiredInputs } = this.state
    const { login } = this.state.inputs
    const { email, password, passwordConfirm } = this.state.requiredInputs
    const { error, emailError, passwordError, passwordConfirmError } = this.state.errors

    const isValid = this.isFormValid(errors, requiredInputs)

    return (
      <form className="auth__form" onSubmit={this.onSubmit}>
        <Input
          classNameInput="auth__form-input"
          classNameLabel="auth__form-label"
          name="login"
          value={login}
          handleOnChange={this.handleOnChange}
          handleKeyDown={this.handleKeyDown}
          type="text"
          placeholder="Login"
          labelText="Login"
          withLabel
        />

        <Input
          classNameInput={classNames("auth__form-input", {
            "auth__form-input--error": emailError
          })}
          classNameLabel="auth__form-label"
          name="email"
          value={email}
          handleOnChange={this.handleOnChange}
          handleValidation={this.handleValidationOnblur}
          handleKeyDown={this.handleKeyDown}
          type="text"
          placeholder="Email Address"
          labelText="Email"
          withLabel
        />
        <div className="auth__form-error">{emailError}</div>

        <Input
          classNameInput={classNames("auth__form-input", {
            "auth__form-input--error": passwordError
          })}
          classNameLabel="auth__form-label"
          name="password"
          value={password}
          handleOnChange={this.handleOnChange}
          handleValidation={this.handleValidationOnblur}
          handleKeyDown={this.handleKeyDown}
          type="password"
          placeholder="Password"
          labelText="Password"
          withLabel
        />
        <div className="auth__form-error">{passwordError}</div>

        <Input
          classNameInput={classNames("auth__form-input", {
            "auth__form-input--error": passwordConfirmError
          })}
          classNameLabel="auth__form-label"
          name="passwordConfirm"
          value={passwordConfirm}
          handleOnChange={this.handleOnChange}
          handleValidation={this.handleValidationOnblur}
          handleKeyDown={this.handleKeyDown}
          type="password"
          placeholder="Password"
          labelText="Confirm Password"
          withLabel
        />
        <div className="auth__form-error">{passwordConfirmError}</div>

        {error && <div className="auth__form-error">{error.message}</div>}

        <button
          className={classNames("button button--auth__form", {
            "button--disabled": !isValid
          })}
          type="submit"
        >
          {this.state.submitRequestLoading ? <span className="auth__form-loading"></span> : "Register"}
        </button>
      </form>
    )
  }
}

const Register = compose(withRouter, withFirebase)(RegisterBase)

export default Register