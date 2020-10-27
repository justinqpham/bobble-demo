import React from "react";
import "./App.css";
import send, { Mode } from "./send";
import recv from "./recv";
import Moods from "./moods";
import manifest, { Manifest } from "./manifest";
import engine from "./engine";
import bufferedAudio from "./buffered_audio";
import fetch from "./fetch";
import resample from "./resample";
// COMPONENTS
import Phone from "./components/Phone";
import Game from "./components/Game";
import Start from "./components/Start";

export interface AppProps {}

interface AppState {
  sessionId: number;
  usercount: number;
  attendance: number;
  started: boolean;
  crowd: boolean;
  phone: string;
  start: boolean;
  game: boolean;
  begin: boolean;
  squish: boolean;
  squished: boolean;
  eventId: string;
}

type Props = AppProps;
type State = AppState;

const AudioContext =
  window.AudioContext || // Default
  (window as any).webkitAudioContext || // Safari and old versions of Chrome
  false;

class App extends React.Component<Props, State> {
  constructor(props: any, context?: any) {
    super(props, context);
    console.log(props);
    console.log(context);
    console.log(props.location.pathname.split("/")[2] || "Demo");

    this.state = {
      sessionId: Math.floor(Math.random() * 10000000),
      usercount: 1,
      attendance: 1,
      started: false,
      crowd: false,
      phone: "none",
      start: true,
      game: false,
      begin: false,
      squish: false,
      squished: false,
      eventId: props.location.pathname.split("/")[2] || "Demo",
    };
  }

  // The manifest containing raw audio data in array buffers.
  // Loaded in `componentWillMount`
  private loadedManifest_: Manifest.Context<ArrayBuffer>;

  // Call this to update the engine's state
  private engineCb_: (state: any) => void;

  private localMoods_ = new Moods();
  private remoteMoods_ = {
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
    Neutral: 1,
  };

  componentWillMount() {
    console.log("Loading the manifest");

    // Load the audio files into memory.
    // We map a manifest of URIs to a manifest of array buffers with `fetch`.
    Manifest.Context.map(manifest, fetch)
      .then((loaded) => {
        this.loadedManifest_ = loaded;
      })
      .catch((err) => {
        console.error("Failed to load audio!", err);
      });

    if (window.innerWidth > 420) {
      if (window.innerHeight < 903) {
        this.setState({ phone: "block", squish: true });
      } else {
        this.setState({ phone: "block" });
      }
    }
    console.log("will");
  }

  componentDidMount() {
    if (
      typeof Storage !== undefined &&
      localStorage.getItem("bobble_id") !== null
    ) {
      this.setState({ sessionId: parseInt(localStorage.getItem("bobble_id")) });
    } else {
      let session = Math.floor(Math.random() * 10000000);
      localStorage.setItem("bobble_id", session.toString());
      this.setState({ sessionId: session });
    }

    recv(this.state.eventId, this.onRecv_);
  }

  private onRecv_ = (state: any) => {
    let temp = {};
    // Calc positive mood swings
    for (let m in state.moods) {
      temp[m] = (state.moods[m] - this.remoteMoods_[m]) * state.watcherCount;
      if (temp[m] < 0) {
        temp[m] = 0;
      }
    }
    this.setState({
      usercount: state.userCount,
      attendance: state.watcherCount,
    });
    // Forward the message
    this.remoteMoods_ = state.moods;
    // console.log(this.remoteMoods_);
  };

  private gainNode_: GainNode;
  private context_: AudioContext;

  private started_ = false;
  private onStart_ = async (buffer, finalize, context) => {
    if (this.started_) return;
    if (!this.loadedManifest_) return;

    this.started_ = true;

    this.context_ = context;

    this.setState({ started: true, crowd: true }, async () => {
      try {
        // Transform a manifest of array buffers into a manifest of audio buffers.
        const audioManifest = await Manifest.Context.map(
          this.loadedManifest_,
          (buffer) =>
            new Promise<AudioBuffer>((resolve, reject) => {
              this.context_.decodeAudioData(buffer, resolve, reject);
            })
        );

        // Transform a manifest of audio buffers of arbitrary sampleRate into a manifest of audio buffers of uniform sampleRate.
        // This is necessary because not every browser respects the `sampleRate` set for the `AudioContext`.
        const resampledManifest = await Manifest.Context.map(
          audioManifest,
          (buffer) =>
            Promise.resolve(
              resample(this.context_, buffer, this.context_.sampleRate)
            )
        );

        // Initialize the engine.
        this.engineCb_ = await engine(this.context_, buffer, resampledManifest);

        // Begins receiving state from the server.
        // Passes that state regularly to `onRecv_`.
        setInterval(() => {
          // let v = this.localMoods_.getMoods(this.remoteMoods_);
          // console.log(v);
          this.engineCb_(this.localMoods_.getMoods(this.remoteMoods_));
          // this.engineCb_(v);
        }, 100);

        this.gainNode_ = this.context_.createGain();
        this.setState({ crowd: true });
        this.gainNode_.gain.value = 1;

        buffer.node.connect(this.gainNode_);
        this.gainNode_.connect(this.context_.destination);

        finalize();
      } catch (e) {
        console.error(e);
        this.started_ = false;
      }
    });

    console.log("Started");
  };

  // Returns a function that handles cheer events of type `mode`.
  private sendCheer_ = (mode: Mode) => async () => {
    this.localMoods_.cheer(mode);

    return send(mode, this.state.sessionId, this.state.eventId);
  };

  // Our actual onClick handlers for cheers.
  // private onCheer_ = this.sendCheer_('Cheering');
  // private onClap_ = this.sendCheer_('Clapping');
  // private onBoo_ = this.sendCheer_('Booing');
  // private onDown_ = this.sendCheer_('LetDown');
  // private onBuild_ = this.sendCheer_('BuildUp');
  private CMD = {
    A_Cheering: this.sendCheer_("A_Cheering"),
    A_Clapping: this.sendCheer_("A_Clapping"),
    A_Booing: this.sendCheer_("A_Booing"),
    A_LetDown: this.sendCheer_("A_LetDown"),
    A_BuildUp: this.sendCheer_("A_BuildUp"),
    B_Cheering: this.sendCheer_("B_Cheering"),
    B_Clapping: this.sendCheer_("B_Clapping"),
    B_Booing: this.sendCheer_("B_Booing"),
    B_LetDown: this.sendCheer_("B_LetDown"),
    B_BuildUp: this.sendCheer_("B_BuildUp"),
  };

  // mote = [away:boolean,home:boolean,emote:string]
  private emote_ = (mote) => {
    if (mote[0]) {
      console.log(`Away ${mote[2]}`);
      this.CMD[mote[2]]();
    } else {
      console.log(`Home ${mote[2]}`);
      this.CMD[mote[2]]();
    }
  };

  private tog = async () => {
    if (this.state.crowd) {
      this.setState({ crowd: false });
      this.gainNode_.gain.value = 0;
    } else {
      this.setState({ crowd: true });
      this.gainNode_.gain.value = 1;
    }
  };

  private forward = () => {
    this.setState({ game: true, start: false, crowd: true });
    if (!!this.gainNode_) {
      this.gainNode_.gain.value = 1;
    }
  };

  private back = () => {
    this.setState({ game: false, start: true, crowd: false });
    this.gainNode_.gain.value = 0;
  };

  private renderStart = () => {
    this.setState({ squished: true });
  };

  render() {
    return (
      <div className="App">
        <div style={{ display: this.state.phone }} id="phone">
          <div id="speaker"></div>
          <div id="camera"></div>
        </div>
        <Phone trigger={this.renderStart} squish={this.state.squish}>
          <Start
            context_={this.context_}
            onStart_={this.onStart_}
            change={this.forward}
            display={this.state.start}
          />
          <Game
            emote={this.emote_}
            tog={this.tog}
            mood={this.remoteMoods_}
            display={this.state.game}
            state={this.state}
            back={this.back}
          />
        </Phone>
      </div>
    );
  }
}

export default App;
