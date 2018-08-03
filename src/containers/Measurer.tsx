import * as React from 'react';

import { connect, DispatchProp } from 'react-redux';

import { Actions } from '../actions';
import { Attempt, formatDuration } from '../models';
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
    document.body.addEventListener('keyup', this.handleKeyUp);
    document.body.addEventListener('touchend', this.handleTouchEnd);
  }

  public componentWillUnmount() {
    document.body.removeEventListener('keyup', this.handleKeyUp);
    document.body.removeEventListener('touchend', this.handleTouchEnd);
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.attempt !== this.props.attempt) {
      this.invalidateAttempt();
    }
  }

  public render() {
    return (
      <div>
        <div style={{ fontSize: 20, padding: '2em 1em', textAlign: 'center' }}>
          <code>{this.state && this.state.scramble || 'Scrambling...'}</code>
        </div>
        <div style={{ fontSize: 64, textAlign: 'center' }}>
          <pre ref={this.timerRef}>{' '}</pre>
        </div>
      </div>
    );
  }

  private handleKeyUp = (ev: KeyboardEvent) => {
    if (ev.key !== ' ') {
      return;
    }

    this.handleHandUp(ev);
  }

  private handleTouchEnd = (ev: TouchEvent) => {
    this.handleHandUp(ev);
  }

  // TODO: be keydown & keyup (touchstart & touchend)
  private handleHandUp = (ev: Event) => {
    for (let el = ev.srcElement; el; el = el.parentElement) {
      if ('tabIndex' in el && (el as any).tabIndex !== -1) {
        return;
      }
    }

    if (this.startTime === null) {
      const step = () => {
        if (!this.startTime) {
          this.startTime = performance.now();
        }
        const elapsed = Math.floor(performance.now() - this.startTime) / 1000;
        this.timerRef.current!.innerText = formatDuration(elapsed);
        this.animTimer = window.requestAnimationFrame(step);
      };
      step();
    } else if (this.animTimer) {
      window.cancelAnimationFrame(this.animTimer);

      const elapsed = Math.floor(performance.now() - this.startTime) / 1000;
      this.timerRef.current!.innerText = formatDuration(elapsed);

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
}

function mapStateToProps({ currentAttempt }: StoreState) {
  return {
    attempt: currentAttempt,
  };
}

export default connect(mapStateToProps)(Measurer);
