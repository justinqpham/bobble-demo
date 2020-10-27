export default (event: string, stateCb: (state: any) => void) => {
  const create = () => {
    const ws = new WebSocket(`wss://jsonws.bobblesport.com/${event}`);

    console.log("receiving");

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
};
