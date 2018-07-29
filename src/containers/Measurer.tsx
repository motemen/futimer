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
        <div style={{ fontSize: 36, padding: '1em' }}>
          <code>{this.state && this.state.scramble || 'Scrambling...'}</code>
        </div>
        <div style={{ fontSize: 72, textAlign: 'center' }}>
          <pre ref={this.timerRef}>{' '}</pre>
        </div>
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
      this.props.dispatch(Actions.recordAttempt({ time: elapsed, timestamp: performance.timing.navigationStart + this.startTime }));
    }
  }

  private invalidateAttempt() {
    this.startTime = null;

    const { attempt } = this.props;

    if (attempt) {
        this.setState({ scramble: attempt.scramble });
        attempt.getScramble().then((scramble) => this.setState({ scramble }));
    } else {
        this.props.dispatch(Actions.resetAttempt());
    }
  }

  private formatNumber(n: number) {
    const [ x, y ] = n.toString().split(/\./);
    return (x.length === 1 ? ` ${x}` : x) + '.' + ((y || '') + '000').substring(0, 3);
  }
}

function mapStateToProps({ currentAttempt }: StoreState) {
  return {
    attempt: currentAttempt,
  };
}

export default connect(mapStateToProps)(Measurer);
