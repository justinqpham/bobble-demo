// Fetches an array buffer from a given URI. Used for loading audio.
export default (uri: string) => new Promise<ArrayBuffer>((resolve, reject) => {
  const request = new XMLHttpRequest();
  request.open('GET', uri, true);
  request.responseType = 'arraybuffer';

  request.onload = () => resolve(request.response);
  request.onerror = (ev) => reject("Request failed!");
  request.send();
});
