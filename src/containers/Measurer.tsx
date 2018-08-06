import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';

import * as keycode from 'keycode';

import classNames from 'classnames';

import { ButtonBase, createStyles, Theme, WithStyles, withStyles } from '@material-ui/core';
import { green, red } from '@material-ui/core/colors';

import { ButtonBaseActions } from '@material-ui/core/ButtonBase';
import { Actions } from '../actions';
import { Attempt, formatDuration } from '../models';
import { StoreState } from '../types';

interface OwnProps {
  attempt?: Attempt;
}

type Props = OwnProps & DispatchProp<Actions> & WithStyles<typeof Styles>;

interface State {
  scramble: string | null;
  isHolding?: boolean;
}

const HOLD_DURATION = 550;

const Styles = (theme: Theme) => createStyles({
  '@keyframes holding-color-change': {
    from: { color: red.A700 },
    to: { color: green.A700 },
  },
  button: {
    '&:focus': {
      backgroundColor: '#eee',
    },
  },
  buttonChildPulsate: {
    animation: 'none',
    display: 'none',
  },
  isHolding: {
    animation: `${HOLD_DURATION}ms step-end holding-color-change both`,
  },
});

class Measurer extends React.Component<Props, State> {
  private startTime: number | null = null;
  private animTimer: number | null = null;
  private timerRef: React.RefObject<HTMLPreElement>;

  constructor(props: Props) {
    super(props);
    this.timerRef = React.createRef();
  }

  public componentWillMount() {
    this.invalidateAttempt();
  }

  public componentDidMount() {
    this.timerRef.current!.innerText = formatDuration(0);
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.attempt !== this.props.attempt) {
      // tslint:disable-next-line
      console.log('invalidate attempt');
      this.invalidateAttempt();
    }
  }

  public render() {
    return (
      <div>
        <div style={{ fontSize: 20, margin: '2em 1em', textAlign: 'center' }}>
          <code>{this.state && this.state.scramble || 'Scrambling...'}</code>
        </div>
        <ButtonBase
          action={this.handleButtonMount}
          onKeyDown={this.handleHoldStart}
          onTouchStart={this.handleHoldStart}
          onTouchEnd={this.handleHoldEnd}
          onKeyUp={this.handleHoldEnd}
          component="button"
          focusRipple={true}
          style={{ fontSize: 64, padding: 40, textAlign: 'center', width: '100%' }}
          classes={{
            root: classNames({
              [this.props.classes.isHolding]: this.state && this.state.isHolding,
            }, this.props.classes.button)
          }}
          TouchRippleProps={{
            classes: {
              childPulsate: this.props.classes.buttonChildPulsate
            }
          }}
        >
          <pre ref={this.timerRef}>{' '}</pre>
        </ButtonBase>
      </div>
    );
  }

  private handleButtonMount = (actions: ButtonBaseActions) => {
    actions.focusVisible();
  }

  // TODO: be keydown & keyup (touchstart & touchend)
  private handleHoldStart = (ev: React.SyntheticEvent) => {
    if (ev.type === 'keydown') {
      if (keycode(ev.nativeEvent) !== 'space') {
        return;
      }
    }

    if (this.startTime === null) {
      this.setState({ isHolding: true });
    }
  }

  private handleHoldEnd = (ev: React.SyntheticEvent) => {
    this.setState({ isHolding: false });

    if (ev.type === 'keyup') {
      if (keycode(ev.nativeEvent) !== 'space') {
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

      // this dispatch could be heavy (as it involves generating scrambles),
      // we prefer rendering elapsed time by delaying dispatch
      const startTime = this.startTime;
      setTimeout(
        () => {
          this.props.dispatch(
            Actions.recordAttempt({
              time: elapsed,
              timestamp: performance.timing.navigationStart + startTime,
            })
          );
        },
        50,
      );

      this.animTimer = null;
      this.startTime = null;
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

export default connect(mapStateToProps)(withStyles(Styles)(Measurer));
