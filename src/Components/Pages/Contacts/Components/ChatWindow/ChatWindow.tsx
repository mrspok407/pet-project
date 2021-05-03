import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactsContext } from "../Context/ContactsContext"
import useElementScrolledDown from "Components/Pages/Movies/useElementScrolledDown"
// import useRecipientNotified from "Components/Pages/UserProfile/Hooks/UseRecipientNotified"
import useResponseContactRequest from "Components/Pages/UserProfile/Hooks/UseResponseContactRequest"
import React, { useEffect, useContext, useState, useRef, useCallback, useLayoutEffect } from "react"
import { isUnexpectedObject } from "Utils"
import { CONTACT_INFO_INITIAL_DATA, MessageInterface, MESSAGE_INITIAL_DATA } from "../../Types"
import ContactPopup from "../ContactList/Contact/ContactPopup"
import MessageInfo from "./Components/MessageInfo"
import "./ChatWindow.scss"
import useGetInitialMessages from "./FirebaseHelpers/UseGetInitialMessages"
import { MESSAGES_TO_RENDER, UNREAD_MESSAGES_TO_RENDER } from "../Context/Constants"
import { throttle } from "throttle-debounce"
import debounce from "debounce"
import useLoadTopMessages from "./FirebaseHelpers/UseLoadTopMessages"
import useIntersectionObserver from "./Hooks/UseIntersectionObserver"

const ChatWindow: React.FC = () => {
  const { authUser, newContactsActivity, errors } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)

  const {
    activeChat,
    messages,
    contacts,
    renderedMessagesList,
    authUserUnreadMessages,
    lastScrollPosition
  } = context?.state!
  const contactInfo = contacts[activeChat.contactKey] || {}

  const { handleContactRequest } = useResponseContactRequest({ userUid: activeChat.contactKey })

  const { loadTopMessages, loading } = useLoadTopMessages()

  const contactOptionsRef = useRef<HTMLDivElement>(null!)
  const chatContainerRef = useRef<HTMLDivElement>(null!)

  const [popupOpen, setPopupOpen] = useState(false)

  let prevScrollTop: any

  useGetInitialMessages()
  useIntersectionObserver({ chatContainerRef: chatContainerRef.current })

  // const observer = useRef<any>()

  const getContainerRect = () => {
    const height = chatContainerRef.current.getBoundingClientRect().height
    const scrollHeight = chatContainerRef.current.scrollHeight
    const scrollTop = chatContainerRef.current.scrollTop

    const thresholdTopLoad = scrollHeight * 0.35
    const thresholdTopRender = scrollHeight * 0.2
    const thresholdBottomRender = scrollHeight * 0.2

    return { height, scrollHeight, scrollTop, thresholdTopLoad, thresholdTopRender, thresholdBottomRender }
  }

  const scrollPositionHandler = useCallback(
    debounce(() => {
      if (!chatContainerRef.current) return
      const { scrollTop, scrollHeight, height } = getContainerRect()
      console.log({ scrollTop })
      console.log({ scrollHandHeight: scrollTop + height })
      console.log({ scrollHeight })
      context?.dispatch({ type: "updateLastScrollPosition", payload: { scrollTop, chatKey: activeChat.chatKey } })
    }, 150),
    [activeChat]
  )

  const handleScroll = useCallback(
    throttle(200, () => {
      if (messages[activeChat.chatKey] === undefined) return
      if (!chatContainerRef.current) return
      const {
        height,
        scrollHeight,
        scrollTop,
        thresholdTopRender,
        thresholdTopLoad,
        thresholdBottomRender
      } = getContainerRect()!

      const firstRenderedMessageIndex = messages[activeChat.chatKey].findIndex(
        (item) => item.key === renderedMessagesList[activeChat.chatKey][0]?.key
      )
      const lastRenderedMessageIndex = messages[activeChat.chatKey].findIndex(
        (item) =>
          item.key ===
          renderedMessagesList[activeChat.chatKey][renderedMessagesList[activeChat.chatKey].length - 1]?.key
      )

      if (scrollHeight <= height) return
      if (scrollTop < 1 && firstRenderedMessageIndex !== 0) {
        chatContainerRef.current.scrollTop = 1
      }
      if (scrollHeight <= scrollTop + height && lastRenderedMessageIndex !== messages[activeChat.chatKey].length - 1) {
        console.log("test")
        chatContainerRef.current.scrollTop = scrollHeight - height - 1
      }

      if (scrollTop < prevScrollTop || prevScrollTop === undefined) {
        if (scrollTop <= thresholdTopRender) context?.dispatch({ type: "renderTopMessages" })
        if (scrollTop <= thresholdTopLoad) {
          if (loading) return
          loadTopMessages()
        }
      } else {
        if (scrollHeight <= scrollTop + height + thresholdBottomRender) {
          context?.dispatch({ type: "renderBottomMessages" })
        }
      }
      prevScrollTop = scrollTop
    }),
    [chatContainerRef, activeChat, loadTopMessages]
  )

  useEffect(() => {
    if (messages[activeChat.chatKey] === undefined) return
    if (
      messages[activeChat.chatKey][messages[activeChat.chatKey].length - 1].key !==
      renderedMessagesList[activeChat.chatKey][renderedMessagesList[activeChat.chatKey].length - 1].key
    ) {
      return
    }

    console.log({ lastScrollPosition })

    let startIndexRender: number = 0
    let endIndexRender: number = 0

    if (messages[activeChat.chatKey].length <= MESSAGES_TO_RENDER) {
      startIndexRender = 0
      endIndexRender = messages[activeChat.chatKey].length
    } else {
      if (authUserUnreadMessages[activeChat.chatKey].length! <= UNREAD_MESSAGES_TO_RENDER) {
        console.log("unreadMsg less than max")
        startIndexRender = Math.max(messages[activeChat.chatKey].length - MESSAGES_TO_RENDER, 0)
        endIndexRender = messages[activeChat.chatKey].length
      } else {
        console.log("unreadMsg more than max")
        endIndexRender =
          messages[activeChat.chatKey].length -
          (authUserUnreadMessages[activeChat.chatKey].length! - UNREAD_MESSAGES_TO_RENDER)
        startIndexRender = Math.max(endIndexRender - MESSAGES_TO_RENDER, 0)
      }
    }

    context?.dispatch({
      type: "renderMessagesOnLoad",
      payload: {
        startIndex: startIndexRender,
        endIndex: endIndexRender,
        chatKey: activeChat.chatKey
      }
    })
  }, [messages, activeChat])

  useLayoutEffect(() => {
    if (!messages[activeChat.chatKey]?.length) return
    const { scrollHeight, height } = getContainerRect()
    const firstUnreadMessageRef = document.querySelector(
      `.chat-window__message--${authUserUnreadMessages[activeChat.chatKey][0]}`
    )

    const isScrollBottom = !!(
      !lastScrollPosition[activeChat.chatKey] || scrollHeight <= lastScrollPosition[activeChat.chatKey] + height
    )

    if (authUserUnreadMessages[activeChat.chatKey].length !== 0) {
      if (isScrollBottom) {
        firstUnreadMessageRef?.scrollIntoView({ block: "start", inline: "start" })
      } else {
        chatContainerRef.current.scrollTop = lastScrollPosition[activeChat.chatKey]
      }
    }
  }, [activeChat, messages])

  // const observerCallback = useCallback(
  //   (entries: any) => {
  //     console.log("observer callback")
  //     entries.forEach((entry: any) => {
  //       if (entry.isIntersecting) {
  //         const messageKey = entry.target.dataset.key
  //         const messageRef: any = document.querySelector(`.chat-window__message--${messageKey}`)
  //         observer.current.unobserve(messageRef)

  //         console.log("intersected")

  //         firebase
  //           .unreadMessages({ uid: authUser?.uid!, chatKey: activeChat.chatKey })
  //           .orderByKey()
  //           .endAt(`${messageKey}`)
  //           .once("value", (snapshot: any) => {
  //             if (snapshot.val() === null) return
  //             console.log({ keys: Object.keys(snapshot.val()) })
  //             Object.keys(snapshot.val()).forEach((key: string) => {
  //               firebase.unreadMessages({ uid: authUser?.uid!, chatKey: activeChat.chatKey }).child(key).set(null)
  //             })
  //           })
  //       }
  //     })
  //   },
  //   [activeChat]
  // )

  // const observerOptions: any = {
  //   root: chatContainerRef.current,
  //   rootMargin: "0px",
  //   threshold: 1.0
  // }

  // useEffect(() => {
  //   observer.current = new IntersectionObserver(observerCallback, observerOptions)
  // }, [activeChat])

  // useEffect(() => {
  //   if (!renderedMessagesList[activeChat.chatKey]?.length) return
  //   if (!authUserUnreadMessages[activeChat.chatKey]?.length) return
  //   if (contactInfo.status !== true) return

  //   renderedMessagesList[activeChat.chatKey].forEach((message) => {
  //     if (!authUserUnreadMessages[activeChat.chatKey].includes(message.key)) return
  //     const unreadMessage = document.querySelector(`.chat-window__message--${message.key}`)
  //     observer.current.observe(unreadMessage)
  //   })
  // }, [activeChat, renderedMessagesList, authUserUnreadMessages, contactInfo.status])

  useLayoutEffect(() => {
    console.log({ authUserUnreadMessages })
    // chatContainerRef.current.scrollTop = lastScrollPosition[activeChat.chatKey]
    chatContainerRef.current.addEventListener("scroll", scrollPositionHandler)
    return () => {
      scrollPositionHandler.flush()
      chatContainerRef.current.removeEventListener("scroll", scrollPositionHandler)
    }
  }, [activeChat])

  useEffect(() => {
    if (!chatContainerRef) return
    const chatContainer = chatContainerRef.current
    chatContainer.addEventListener("scroll", handleScroll)
    return () => {
      console.log("unmount scroll")
      chatContainer.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  useEffect(() => {
    if (activeChat.chatKey) return
    context?.dispatch({ type: "updateActiveChat", payload: { chatKey: "", contactKey: "" } })
  }, [activeChat])

  const messagesSlice = renderedMessagesList[activeChat.chatKey]
  console.log({ messagesSlice })
  console.log({ messages })

  return (
    <div className="chat-window-container">
      <div className="chat-window__contact-info">
        <div
          className={classNames("contact-info__close-chat", {
            "contact-info__close-chat--new-activity": newContactsActivity
          })}
        >
          <button
            className="contact-info__close-chat-btn"
            type="button"
            onClick={() => context?.dispatch({ type: "updateActiveChat", payload: { chatKey: "", contactKey: "" } })}
          ></button>
        </div>
        <div className="contact-info__username">{contactInfo.userName}</div>
        <div ref={contactOptionsRef} className="contact-item__options contact-info__options">
          <button
            type="button"
            className={classNames("contact-item__open-popup-btn", {
              "contact-item__open-popup-btn--open": popupOpen
            })}
            onClick={(e) => setPopupOpen(!popupOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {popupOpen && (
            <ContactPopup
              contactOptionsRef={contactOptionsRef.current}
              contactInfo={contactInfo}
              action={setPopupOpen}
            />
          )}
        </div>
        <div className="contact-info__status">Online</div>
      </div>
      <div className="chat-window__messages-list-container" ref={chatContainerRef}>
        {contactInfo.status === true &&
          (messages[activeChat.chatKey] === undefined ? (
            <div className="chat-window__loader-container">
              <span className="chat-window__loader"></span>
            </div>
          ) : (
            <>
              {/* <div className="chat-window__unread-messages">{context?.state.authUserUnreadMessages}</div> */}
              <div className="chat-window__messages-list">
                {messagesSlice?.map((messageData, index, array) => {
                  const nextMessage = array[index + 1]
                  return (
                    <div
                      key={messageData.key}
                      className={classNames(`chat-window__message chat-window__message--${messageData.key}`, {
                        "chat-window__message--send": messageData.sender === authUser?.uid,
                        "chat-window__message--receive": messageData.sender === activeChat.contactKey,
                        "chat-window__message--last-in-bunch": messageData.sender !== nextMessage?.sender
                      })}
                      data-key={messageData.key}
                    >
                      <div className="chat-window__message-text">{messageData.message}</div>

                      <MessageInfo messageData={messageData} />
                    </div>
                  )
                })}
              </div>
            </>
          ))}

        {!contactInfo.receiver && contactInfo.status === false && (
          <div className="chat-window chat-window--request">
            <div className="new-request">
              <div className="new-request__message">
                {<span className="new-request__name">{contactInfo.userName}</span>} wants to connect
              </div>
              <div className="new-request__actions--receiver">
                <button className="button" onClick={() => handleContactRequest({ status: "accept" })}>
                  Accept
                </button>
                <button
                  className="button"
                  onClick={() => {
                    handleContactRequest({ status: "rejected" })
                    context?.dispatch({ type: "updateActiveChat", payload: { chatKey: "", contactKey: "" } })
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {contactInfo.receiver &&
          (contactInfo.status === false ? (
            <div className="new-request__message">
              The invitation to connect has been sent to{" "}
              {<span className="new-request__name">{contactInfo.userName}</span>}
            </div>
          ) : (
            contactInfo.status === "rejected" && (
              <div className="new-request__message">
                {<span className="new-request__name">{contactInfo.userName}</span>} rejected you connect request{" "}
              </div>
            )
          ))}
      </div>
    </div>
  )
}

export default ChatWindow
