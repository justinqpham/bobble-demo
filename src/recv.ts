export default (stateCb: (state: any) => void) => {
  const create = () => {
    const ws = new WebSocket("wss://demo.jsonws.bobblesport.com/");

    console.log('receiving');

    ws.onmessage = (ev) => {
      // console.log('Got message', ev.data);
      stateCb(JSON.parse(ev.data));
    };

    ws.onerror = (err) => {
      console.error(err);
    };

    ws.onclose = () => {
      setTimeout(create, 500);
    };
  };
  create();
}