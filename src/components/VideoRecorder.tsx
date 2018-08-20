import * as React from "react";

export default class VideoRecorder extends React.Component {
  private recorder?: MediaRecorder;
  private chunks?: BlobPart[];
  private videoRef: React.RefObject<HTMLVideoElement>;
  private stream?: MediaStream;

  constructor(props: {}) {
    super(props);
    this.videoRef = React.createRef();
  }

  public componentDidMount() { 
    this.start();
  }

  public async open() {
    this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.videoRef.current!.src = URL.createObjectURL(this.stream);
    this.videoRef.current!.play();
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
    this.recorder.start();
  }

  public stop() {
    if (this.recorder) {
      this.recorder.stop();
      this.recorder = undefined;
    }
  }

  public download() {
    // TODO: https://developers.google.com/web/updates/2016/01/mediarecorder
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