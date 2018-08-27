import * as React from "react";
import { connect } from "react-redux";

import { PuzzleType, PuzzleConfiguration, StoreState } from "../../models";

interface Props {
  puzzleType: PuzzleType;
  scramble?: string;
}

class ScramblePreview extends React.Component<Props> {
  private ref: React.RefObject<HTMLDivElement> = React.createRef();

  constructor(props: Props) {
    super(props);
  }

  public componentDidMount() {
    this.updatePreview(this.props);
  }

  public componentWillReceiveProps({ puzzleType, scramble }: Props) {
    if (
      this.props.puzzleType === puzzleType &&
      this.props.scramble === scramble
    ) {
      return;
    }

    this.updatePreview({ scramble, puzzleType });
  }

  public render() {
    return <div ref={this.ref}>preview</div>;
  }

  private updatePreview({ scramble, puzzleType }: Props) {
    if (typeof tnoodlejs === "undefined") {
      return; // TODO
    }

    const svg = tnoodlejs.scrambleToSvg(
      scramble,
      new puzzle[PuzzleConfiguration[puzzleType].tnoodleImpl]()
    );
    this.ref.current!.innerHTML = svg;
    this.ref.current!.querySelector("svg")!.style.width = "100%";
    this.ref.current!.querySelector("svg")!.style.height = "auto";
  }
}

function mapStateToProps({
  current: {
    scramble,
    session: { puzzleType }
  }
}: StoreState) {
  return {
    puzzleType,
    scramble
  };
}

export default connect(mapStateToProps)(ScramblePreview);
