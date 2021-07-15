import { useContext, useState } from "react"
import { FirebaseContext } from "Components/Firebase"
import { AppContext } from "Components/AppContext/AppContextHOC"
// import { _handleContactRequest } from "firebaseHttpCallableFunctionsTests"

type Props = {
  contactUid: string
}

const INITIAL_LOADING_STATE = { accept: false, rejected: false }

const useResponseContactRequest = ({ contactUid }: Props) => {
  const { errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)

  const [responseContactRequestLoading, setResponseContactRequestLoading] = useState(INITIAL_LOADING_STATE)

  const handleContactRequest = async ({ status }: { status: string }) => {
    if (responseContactRequestLoading.accept || responseContactRequestLoading.rejected) return
    // const timeStamp = firebase.timeStamp()

    try {
      setResponseContactRequestLoading((prevState) => ({ ...prevState, [status]: true }))
      const handleContactRequestCloud = firebase.httpsCallable("handleContactRequest")
      await handleContactRequestCloud({ contactUid, status })
      // await _handleContactRequest({
      //   data: { contactUid, status },
      //   context: { authUser: authUser! },
      //   database: firebase.database(),
      //   timeStamp
      // })
    } catch (error) {
      errors.handleError({
        errorData: error,
        message: "There has been some error handling contact request. Please try again."
      })

      throw new Error(`There has been some error handling contact request: ${error}`)
    } finally {
      setResponseContactRequestLoading(INITIAL_LOADING_STATE)
    }
  }

  return { handleContactRequest, responseContactRequestLoading }
}

export default useResponseContactRequest
