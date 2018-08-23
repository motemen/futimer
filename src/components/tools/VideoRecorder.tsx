import * as React from "react";
import { connect } from "react-redux";
import { StoreState } from "../../types";

interface Props {
  isPlaying?: boolean;
}

class VideoRecorder extends React.Component<Props> {
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
    this.stop();
  }

  public async open() {
    this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.videoRef.current!.src = URL.createObjectURL(this.stream);
    this.videoRef.current!.play();
  }

  public close() {
    this.videoRef.current!.pause();
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
      this.close();
    }
  }

  public download() {
    const blob = new Blob(this.chunks) //  type : 'video/webm'
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'record.webm'; // TODO: name
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
  }

  public render() {
    return <div>
      <video ref={this.videoRef} style={{ maxWidth: '100%' }} />
    </div>
  }
}

function mapStateToProps({ isPlaying }: StoreState) {
  return { isPlaying };
}

export default connect(mapStateToProps)(VideoRecorder);