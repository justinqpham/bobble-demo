// All valid cheer modes
export type Mode =
  | "A_Cheering"
  | "A_Booing"
  | "A_BuildUp"
  | "A_LetDown"
  | "A_Clapping"
  | "B_Cheering"
  | "B_Booing"
  | "B_BuildUp"
  | "B_LetDown"
  | "B_Clapping";

// Performs a POST on the given `uri` with the given JSON `body`.
const post = (uri: string, body: any) => {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.open("POST", uri);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(body));

    // console.log(JSON.stringify(body));

    req.onerror = (ev) => {
      reject(ev);
    };

    req.onreadystatechange = () => {
      if (req.readyState == XMLHttpRequest.DONE) {
        resolve();
      }
    };
  });
};

export let sendStream = async (streamName: string, event: string) =>
  post("https://audio.bobblesport.com/updateTwitchStream", {
    streamName,
    event,
  });

// Inform the server about a cheer the user has made
export default async (mode: Mode, sessionId: number, event: string) =>
  post("https://aggregator.bobblesport.com/", {
    buttonPresses: {
      A_Cheering: 0,
      A_Booing: 0,
      A_BuildUp: 0,
      A_LetDown: 0,
      A_Clapping: 0,
      B_Cheering: 0,
      B_Booing: 0,
      B_BuildUp: 0,
      B_LetDown: 0,
      B_Clapping: 0,
      [mode]: 1,
    },
    extra: {
      sessionId,
    },
    event: event,
  });
