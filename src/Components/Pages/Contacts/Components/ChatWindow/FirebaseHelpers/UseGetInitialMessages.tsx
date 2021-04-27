import React, { useState, useEffect, useContext } from "react"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactsContext } from "../../Context/ContactsContext"
import { MessageInterface, MESSAGE_INITIAL_DATA, SnapshotStringBooleanInterface } from "Components/Pages/Contacts/Types"
import { isUnexpectedObject } from "Utils"
import { setMessagesSnapshot } from "./setMessagesSnapshot"
import { MESSAGES_TO_RENDER } from "../../Context/Constants"

const useGetInitialMessages = () => {
  const { authUser, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { activeChat } = context?.state!

  const messagesRef = firebase.messages({ chatKey: activeChat.chatKey })

  useEffect(() => {
    if (context?.state.messages[activeChat.chatKey] !== undefined) return

    console.log("useEffect in useGetInitialMessages")

    const getMessages = async () => {
      let messagesSnapshot: any

      try {
        messagesSnapshot = await setMessagesSnapshot({ chatKey: activeChat.chatKey, authUser, messagesRef, firebase })
      } catch (error) {
        errors.handleError({
          message: "There were a problem loading messages. Please try to reload the page."
        })
        context?.dispatch({ type: "setInitialMessages", payload: { messagesData: [], chatKey: activeChat.chatKey } })
        throw new Error("There were a problem loading messages. Please try to reload the page.")
      }

      if (messagesSnapshot.val() === null) {
        context?.dispatch({ type: "setInitialMessages", payload: { messagesData: [], chatKey: activeChat.chatKey } })
      }

      let firstMessageTimeStamp = 0
      let lastMessageTimeStamp = 0

      if (messagesSnapshot.val() !== null) {
        let messagesData: MessageInterface[] = []
        messagesSnapshot.forEach((message: any) => {
          if (isUnexpectedObject({ exampleObject: MESSAGE_INITIAL_DATA, targetObject: message.val() })) {
            errors.handleError({
              message: "Some of the messages were hidden, because of the unexpected error."
            })
            return
          }
          messagesData.push({ ...message.val(), key: message.key })
        })

        firstMessageTimeStamp = messagesData[0].timeStamp
        lastMessageTimeStamp = messagesData[messagesData.length - 1].timeStamp

        context?.dispatch({
          type: "setInitialMessages",
          payload: {
            messagesData,
            loadedMessages: messagesData.length > MESSAGES_TO_RENDER ? 125 : messagesData.length,
            chatKey: activeChat.chatKey
          }
        })
      }

      messagesRef
        .orderByChild("timeStamp")
        .startAfter(lastMessageTimeStamp)
        .on("child_added", (snapshot: { val: () => MessageInterface; key: string }) => {
          if (isUnexpectedObject({ exampleObject: MESSAGE_INITIAL_DATA, targetObject: snapshot.val() })) {
            errors.handleError({
              message: "New message were hidden, because of the unexpected error. Please reload the page."
            })
            return
          }

          const newMessage = { ...snapshot.val(), key: snapshot.key }
          context?.dispatch({ type: "addNewMessage", payload: { newMessage, chatKey: activeChat.chatKey } })
          console.log({ addedChild: newMessage })
        })

      messagesRef
        .orderByChild("timeStamp")
        .startAt(firstMessageTimeStamp)
        .on("child_changed", (snapshot: { val: () => MessageInterface; key: string }) => {
          if (isUnexpectedObject({ exampleObject: MESSAGE_INITIAL_DATA, targetObject: snapshot.val() })) {
            errors.handleError({
              message: "Message hasn't been changed, because of the unexpected error. Please reload the page."
            })
            return
          }

          const changedMessage = { ...snapshot.val(), key: snapshot.key }
          context?.dispatch({ type: "changeMessage", payload: { changedMessage, chatKey: activeChat.chatKey } })
          console.log({ changedChild: changedMessage })
        })

      messagesRef
        .orderByChild("timeStamp")
        .startAt(firstMessageTimeStamp)
        .on("child_removed", (snapshot: { val: () => MessageInterface; key: string }) => {
          if (isUnexpectedObject({ exampleObject: MESSAGE_INITIAL_DATA, targetObject: snapshot.val() })) {
            errors.handleError({
              message: "Message hasn't been deleted, because of the unexpected error. Please reload the page."
            })
            return
          }
          const removedMessage = { ...snapshot.val(), key: snapshot.key }
          context?.dispatch({ type: "removeMessage", payload: { removedMessage, chatKey: activeChat.chatKey } })
          console.log({ removedMessage })
        })
    }

    getMessages()
  }, [activeChat.chatKey, messagesRef])

  return <></>
}

export default useGetInitialMessages