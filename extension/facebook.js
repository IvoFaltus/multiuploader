let initialized = false

const init = (data) => {
  if (!data) {
  console.log("payload missing")
  return
}
  console.log("init before")
  if (initialized) return
  initialized = true
  console.log("init")

  const i = setInterval(() => {

    const title = [...document.querySelectorAll('span')]
      .find(e => e.textContent.trim() === 'Název')
      ?.closest('label')
      ?.querySelector('input')

    const price = [...document.querySelectorAll('span')]
      .find(e => e.textContent.trim() === 'Cena')
      ?.closest('label')
      ?.querySelector('input')

    const desc = [...document.querySelectorAll('span')]
      .find(e => e.textContent.trim() === 'Popis')
      ?.closest('label')
      ?.querySelector('textarea')

    const email = document.querySelector('input[type="email"]')

    const photos = document.querySelector('input[type="file"][multiple]')

    const condition = [...document.querySelectorAll('span')]
      .find(e => e.textContent.trim() === 'Stav')
      ?.closest('[role="combobox"]')

    if (title && data.title) title.value = data.title
    if (price && data.price) price.value = data.price
    if (desc && data.description) desc.value = data.description
    if (email && data.email) email.value = data.email

      if (!title) console.log("title not found")
    if (!price) console.log("price not found")
    if (!desc) console.log("description not found")
    if (!email) console.log("email not found")
    if (!photos) console.log("photos not found")
    if (!condition) console.log("condition not found")

    console.log("try")

    if (
      title?.value === data.title &&
      desc?.value === data.description &&
      price?.value === data.price
    ) {
      clearInterval(i)

      setTimeout(clearInterval(i),20000)
    }

  }, 1000)
}


chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action !== "syncFacebook") return

  let i = 0

  const timer = setInterval(() => {
    console.log(i + " debug")

    const btn = [...document.querySelectorAll("span")].find(
      el =>
        el.textContent?.includes("Vytvořit") ||
        el.textContent?.includes("Create")
    )

    if (btn) {
      btn.closest('[role="none"]')?.click()
      console.log("clicked")
      clearInterval(timer)
    }

    if (i > 30) clearInterval(timer)
    i++
  }, 100)


  const observer = new MutationObserver(() => {

    const el1 = [...document.querySelectorAll('span')]
      .find(e => e.textContent.trim() === 'Název')
      ?.closest('label')
      ?.querySelector('input')

    if (el1) {
      observer.disconnect()
      init(msg.payload)
    }

  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
})