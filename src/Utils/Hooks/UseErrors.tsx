import { useRef, useState } from "react"

const useErrors = () => {
  const [error, setError] = useState<any>()
  const modalContainerRef = useRef<HTMLDivElement>(null!)

  const timeoutRef = useRef<number | null>(null)
  const fadeOutTimeout = useRef<number | null>(null)

  const handleError = ({ errorData, message }: { errorData: any; message: string }) => {
    setError({ errorData, message })

    modalContainerRef.current?.classList.remove("modal-fade-out")
    window.clearTimeout(timeoutRef.current || 0)
    window.clearTimeout(fadeOutTimeout.current || 0)

    fadeOutTimeout.current = window.setTimeout(() => {
      const modalContainer = document.querySelector(".modal-container") as HTMLDivElement
      modalContainerRef.current = modalContainer
      modalContainer?.classList.add("modal-fade-out")
    }, 9700)
    timeoutRef.current = window.setTimeout(() => {
      setError(null)
    }, 10000)
  }

  return { error, handleError }
}

export default useErrors