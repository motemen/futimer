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
  holdStarted?: number;
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
  scramble: {
    fontSize: theme.typography.headline.fontSize,
    marginTop: theme.spacing.unit * 3,
    textAlign: 'center',
  },
  timer: {
    [theme.breakpoints.down('xs')]: {
      fontSize: theme.typography.display3.fontSize,
    },
    fontSize: theme.typography.display4.fontSize,
    padding: theme.spacing.unit * 2,
    margin: `${theme.spacing.unit * 3}pt 0`,
    textAlign: 'center',
    width: '100%',
  },
});

class Measurer extends React.Component<Props, State> {
  private startTime: number | null = null;
  private animTimer: number | null = null;
  private timerRef: React.RefObject<HTMLPreElement>;

  private focusVisible?: () => void;

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
        <div className={this.props.classes.scramble}>
          <code>{this.state && this.state.scramble || 'Scrambling...'}</code>
        </div>
        <ButtonBase
          action={this.handleButtonMount}
          onTouchStart={this.handleHoldStart}
          onTouchEnd={this.handleHoldEnd}
          onKeyDown={this.handleHoldStart}
          onKeyUp={this.handleHoldEnd}
          onMouseDown={this.handleHoldStart}
          onMouseUp={this.handleHoldEnd}
          component="button"
          focusRipple={true}
          classes={{
            root: classNames(
              { [this.props.classes.isHolding]: this.state && Boolean(this.state.holdStarted), },
              this.props.classes.button,
              this.props.classes.timer,
            )
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
    this.focusVisible = actions.focusVisible;
  }

  // TODO: be keydown & keyup (touchstart & touchend)
  private handleHoldStart = (ev: React.SyntheticEvent) => {
    if (this.startTime) {
      // any key is accepted
      this.stopTimer();
      return;
    }

    if (ev.type === 'keydown') {
      if (keycode(ev.nativeEvent) !== 'space') {
        return;
      }
    }

    if (!this.startTime && !this.state.holdStarted) {
      this.setState({ holdStarted: performance.now() });
    }
  }

  private handleHoldEnd = (ev: React.SyntheticEvent) => {
    if (ev.type === 'keyup') {
      if (keycode(ev.nativeEvent) !== 'space') {
        return;
      }
    }

    const { holdStarted } = this.state;

    this.setState({ holdStarted: undefined });

    if (!holdStarted) {
      return;
    }
    console.log(performance.now(), holdStarted, performance.now() - holdStarted);
    if (performance.now() - holdStarted <= HOLD_DURATION) {
      return;
    }

    if (this.startTime === null) {
      this.startTimer();
    }
  }

  private startTimer() {
    const step = () => {
      if (!this.startTime) {
        this.startTime = performance.now();
      }
      const elapsed = Math.floor(performance.now() - this.startTime) / 1000;
      this.timerRef.current!.innerText = formatDuration(elapsed);
      this.animTimer = window.requestAnimationFrame(step);
    };
    step();
  }

  private stopTimer() {
    if (!this.animTimer || !this.startTime) {
      throw new Error('stopTimer: invalid state');
    }

    window.cancelAnimationFrame(this.animTimer);

    const elapsed = Math.floor(performance.now() - this.startTime) / 1000;
    this.timerRef.current!.innerText = formatDuration(elapsed);

    // this dispatch could be heavy (as it involves generating scrambles),
    // we prefer rendering elapsed time by delaying dispatch
    const startTime = this.startTime;
    setTimeout(
      () => {
        this.focusVisible!();

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

function mapStateToProps({ current: { attempt } }: StoreState) {
  return {
    attempt,
  };
}

export default connect(mapStateToProps)(withStyles(Styles)(Measurer));
