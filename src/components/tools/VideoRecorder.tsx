import * as React from "react";
import { connect } from "react-redux";
import { StoreState } from "../../types";

interface Props {
  isPlaying?: boolean;
  scramble?: string;
}

class VideoRecorder extends React.Component<Props> {
  public open = once(async () => {
    this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.videoRef.current!.src = URL.createObjectURL(this.stream);
    this.videoRef.current!.play();
  });

  private recorder?: MediaRecorder;
  private chunks?: BlobPart[];
  private videoRef: React.RefObject<HTMLVideoElement>;
  private stream?: MediaStream;

  constructor(props: {}) {
    super(props);
    this.videoRef = React.createRef();
  }

  public componentWillReceiveProps({ isPlaying }: Props) {
    if (!!this.props.isPlaying === !!isPlaying) {
      return;
    }

    if (isPlaying) {
      this.start();
    } else {
      this.stop();
    }
  }

  public componentDidMount() { 
    this.open();
  }

  public componentWillUnmount() {
    this.close();
  }

  public close() {
    if (this.stream) {
      for (const v of this.stream.getVideoTracks()) {
        v.stop();
      }
      this.stream = undefined;
    }
  }

  public async start() {
    if (!this.stream) {
      await this.open();
    }
    this.chunks = [];
    this.recorder = new MediaRecorder(this.stream!);
    this.recorder.ondataavailable = (e: any) => {
      this.chunks!.push(e.data);
    };
    this.recorder.onstop = (e: any) => {
      this.download();
    };
    this.recorder.start();
  }

  public stop() {
    if (this.recorder) {
      this.recorder.stop();
    }
  }

  public download() {
    const blob = new Blob(this.chunks);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.props.scramble || 'record'}.webm`;
    a.click();
  }

  public render() {
    return <div>
      <video muted ref={this.videoRef} style={{ maxWidth: '100%' }} />
    </div>
  }
}

function mapStateToProps({ isPlaying, current: { scramble } }: StoreState) {
  return { isPlaying, scramble };
}

function once<T>(func: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | null = null;

  return async () => {
    promise = promise || func();
    return await promise;
  };
}

export default connect(mapStateToProps)(VideoRecorder);