// Fetches an array buffer from a given URI. Used for loading audio.
export function fetchArrayBuffer(uri: string) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", uri, true);
    request.responseType = "arraybuffer";

    request.onload = () => resolve(request.response);
    request.onerror = (ev) => reject("Request failed!");
    request.send();
  });
}
export function fetchJson(uri: string) {
  return new Promise<any>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", uri, true);
    request.responseType = "json";

    request.onload = () => resolve(request.response);
    request.onerror = (ev) => reject("Request failed!");
    request.send();
  });
}
