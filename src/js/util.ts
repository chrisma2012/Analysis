export const ajax = async (method: string, url: string) => {
  if (typeof fetch === 'function') {
    // Default options are marked with *
    const response = await fetch(url, {
      method,
    })

    return response.json() // parses JSON response into native JavaScript objects
  }
  return new Promise((resolve, reject) => {
    const xhr = new window.XMLHttpRequest()
    xhr.open(method, url, true)
    xhr.send()
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.response))
        } else {
          reject('Wrong status code.')
        }
      }
    }
  })
}
