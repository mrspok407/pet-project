import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { ContactInfoInterface } from "Components/Pages/Contacts/Types"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"

interface GetInitialInfoInfterface {
  firebase: FirebaseInterface
  contactsData: ContactInfoInterface[]
  authUser: AuthUserInterface | null
}

export const getInitialContactInfo = async ({ firebase, contactsData, authUser }: GetInitialInfoInfterface) => {
  return Promise.all(
    contactsData.map(async (contact) => {
      const chatKey =
        contact.key < authUser?.uid! ? `${contact.key}_${authUser?.uid}` : `${authUser?.uid}_${contact.key}`

      const [
        newContactsActivity,
        newContactsRequests,
        unreadMessagesAuth,
        unreadMessagesContact,
        lastMessage
      ] = await Promise.all([
        firebase.newContactsActivity({ uid: authUser?.uid! }).child(`${contact.key}`).once("value"),
        firebase.newContactsRequests({ uid: authUser?.uid! }).child(`${contact.key}`).once("value"),
        firebase.unreadMessages({ uid: authUser?.uid!, chatKey }).once("value"),
        firebase.unreadMessages({ uid: contact.key, chatKey }).orderByKey().limitToFirst(1).once("value"),
        firebase.messages({ chatKey }).orderByChild("timeStamp").limitToLast(1).once("value")
      ])

      return {
        ...contact,
        key: contact.key,
        newContactsActivity: !!newContactsActivity.val(),
        newContactsRequests: !!newContactsRequests.val(),
        unreadMessagesAuth: unreadMessagesAuth.numChildren(),
        unreadMessagesContact: !!unreadMessagesContact.val(),
        lastMessage: Object.values(lastMessage.val()).map((item) => item)[0]
      }
    })
  )
}
