import * as React from 'react';

import { connect, DispatchProp } from 'react-redux';

import { Actions } from '../actions';
import { Attempt } from '../models/Attempt';
import { StoreState } from '../types';

interface OwnProps {
  attempt?: Attempt;
}

type Props = OwnProps & DispatchProp<Actions>;

interface State {
  scramble: string | null;
}

class Measurer extends React.Component<Props, State> {
  private startTime: number | null = null;
  private animTimer?: number;
  private timerRef: React.RefObject<HTMLPreElement>;

  constructor(props: Props) {
    super(props);
    this.timerRef = React.createRef();
  }

  public componentWillMount() {
    this.invalidateAttempt();
    document.body.addEventListener('keypress', this.keyPressHandler);
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.attempt !== this.props.attempt) {
      this.invalidateAttempt();
    }
  }

  public render() {
    return (
      <div>
        <pre>{ this.state && this.state.scramble || 'Scrambling...' }</pre>
        <pre ref={this.timerRef} />
      </div>
    );
  }

  private keyPressHandler = (ev: KeyboardEvent) => {
    if (ev.key !== ' ') {
      return;
    }

    if (this.startTime === null) {
      const step = () => {
        if (!this.startTime) {
          this.startTime = performance.now();
        }
        const elapsed = Math.floor(performance.now() - this.startTime) / 1000;
        this.timerRef.current!.innerText = this.formatNumber(elapsed);
        this.animTimer = window.requestAnimationFrame(step);
      };
      step();
    } else if (this.animTimer) {
      const elapsed = Math.floor(performance.now() - this.startTime) / 1000;
      window.cancelAnimationFrame(this.animTimer);
      // TODO: update attempt record
      this.props.dispatch(Actions.recordAttempt({ time: elapsed }));
    }
  }

  private invalidateAttempt() {
    this.startTime = null;

    const { attempt } = this.props;

    if (attempt) {
        this.setState({ scramble: attempt.scramble });
        attempt.doneScramble.then((scramble) => this.setState({ scramble }));
    } else {
        this.props.dispatch(Actions.resetAttempt());
    }
  }

  private formatNumber(n: number) {
    const [ x, y ] = n.toString().split(/\./);
    return x + '.' + ((y || '') + '000').substring(0, 3);
  }
}

function mapStateToProps({ currentAttempt }: StoreState) {
  return {
    attempt: currentAttempt,
  };
}

export default connect(mapStateToProps)(Measurer);
