import * as React from 'react';

import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import * as actions from '../actions';
import { Attempt } from '../models/Attempt';
import { StoreState } from '../types';

interface Props {
  attempt?: Attempt;
  onRecordAttempt: () => void;
}

interface State {
  scramble: string | null;
}

class Measurer extends React.Component<Props, State> {
  private startTime: number | null = null;
  private animTimer?: number;
  private timerRef: React.RefObject<HTMLElement>;

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
        <code>{ this.state.scramble || 'Scrambling...' }</code>
        <code ref={this.timerRef} />
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
      window.cancelAnimationFrame(this.animTimer);
      this.props.onRecordAttempt();
    }
  }

  private invalidateAttempt() {
    this.startTime = null;
    if (this.props.attempt) {
        this.setState({ scramble: this.props.attempt.scramble }, () => {
            this.timerRef.current!.innerText = '';
        });
        this.props.attempt.doneScramble.then((scramble) => this.setState({ scramble }));
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

function mapDispatchToprops(dispatch: Dispatch) {
    return {
        onRecordAttempt: () => dispatch(actions.recordAttempt()),
    };
}

export default connect(mapStateToProps, mapDispatchToprops)(Measurer);
