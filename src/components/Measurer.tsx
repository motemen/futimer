import * as React from 'react';
import { SyntheticEvent } from 'react';
import { connect } from 'react-redux';

import * as keycode from 'keycode';
import classNames from 'classnames';

import { ButtonBase, createStyles, Theme, WithStyles, withStyles } from '@material-ui/core';
import { green, red } from '@material-ui/core/colors';

import { ButtonBaseActions } from '@material-ui/core/ButtonBase';
import { Actions, AsyncAction, Dispatch } from '../actions';
import { formatDuration, Record, StoreState } from '../models';

interface OwnProps {
  scramble?: string;
}

type Props = OwnProps & { dispatch: Dispatch } & WithStyles<typeof Styles>;

interface State {
  holdStarted?: number;
}

const HOLD_DURATION = 550;

const Styles = (theme: Theme) => createStyles({
  '@keyframes holding-color-change': {
    from: { color: red.A700 },
    to: { color: green.A700 },
  },
  button: {
    color: theme.palette.grey["300"],
    transition: 'color 0.25s',
    '&:focus': {
      backgroundColor: '#eee',
      color: theme.palette.text.primary,
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
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    textAlign: 'center',
    transition: 'color 0.5s',
  },
  timer: {
    [theme.breakpoints.down('xs')]: {
      fontSize: theme.typography.display3.fontSize,
    },
    fontSize: theme.typography.display4.fontSize,
    padding: theme.spacing.unit * 2,
    margin: `${theme.spacing.unit * 3}px 0`,
    textAlign: 'center',
    width: '100%',
    touchAction: 'none',
    WebkitTouchCallout: 'none',
    userSelect: 'none',
  },
  isLoading: {
    color: theme.palette.grey["300"]
  },
});

class Measurer extends React.Component<Props, State> {
  public state: State = {};

  private startTime: number | null = null;
  private animTimer: number | null = null;
  private timerRef: React.RefObject<HTMLPreElement>;
  private prevScramble?: string;
  private record: Record | null;

  private focusVisible?: () => void;

  constructor(props: Props) {
    super(props);
    this.timerRef = React.createRef();
  }

  public handleWindowFocus = () => {
    this.focusVisible!();
  }

  public componentWillMount() {
    this.props.dispatch(AsyncAction.resetScramble());
  }

  public componentWillUnmount() {
    window.removeEventListener('focus', this.handleWindowFocus);
  }

  public componentDidMount() {
    this.timerRef.current!.innerText = formatDuration(0);
    window.addEventListener('focus', this.handleWindowFocus, { passive: true });
  }

  public componentWillReceiveProps() {
    this.prevScramble = this.props.scramble;
  }

  public render() {
    return (
      <div>
        <div className={classNames(this.props.classes.scramble, { [this.props.classes.isLoading]: !this.props.scramble })}>
          <code>{this.props.scramble || this.prevScramble || 'Generating…'}</code>
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
              this.props.classes.button,
              this.props.classes.timer,
              { [this.props.classes.isHolding]: this.state && Boolean(this.state.holdStarted), },
            )
          }}
          TouchRippleProps={{
            classes: {
              childPulsate: this.props.classes.buttonChildPulsate
            }
          }}
          onContextMenuCapture={this.handleTimerContextMenu}
        >
          <pre ref={this.timerRef}>{' '}</pre>
        </ButtonBase>
      </div>
    );
  }

  private handleTimerContextMenu = (ev: SyntheticEvent) => {
    ev.preventDefault();
  }

  private handleButtonMount = (actions: ButtonBaseActions) => {
    actions.focusVisible();
    this.focusVisible = actions.focusVisible;
  }

  private handleHoldStart = (ev: React.SyntheticEvent) => {
    if (this.startTime) {
      // any key is accepted
      this.stopTimer();
      return;
    }

    if (this.record) {
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

    if (this.record) {
      const record = { ...this.record };
      this.props.dispatch(AsyncAction.commitRecord({ record }));
      this.record = null;
      return;
    }

    const { holdStarted } = this.state;
    if (!holdStarted) {
      return;
    }

    this.setState({ holdStarted: undefined });

    if (performance.now() - holdStarted <= HOLD_DURATION) {
      return;
    }

    if (this.startTime === null) {
      this.startTimer();
    }
  }

  private startTimer() {
    this.record = null;

    const step = () => {
      if (!this.startTime) {
        this.startTime = performance.now();
      }
      const elapsed = Math.floor(performance.now() - this.startTime) / 1000;
      this.timerRef.current!.innerText = formatDuration(elapsed);
      this.animTimer = window.requestAnimationFrame(step);
    };
    step();

    this.props.dispatch(Actions.changeIsPlaying({ isPlaying: true }));
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
    this.record = {
      scramble: this.props.scramble!,
      time: elapsed,
      timestamp: performance.timing.navigationStart + this.startTime,
    };

    this.animTimer = null;
    this.startTime = null;

    this.props.dispatch(Actions.changeIsPlaying({ isPlaying: false }));
  }
}

function mapStateToProps({ current: { scramble } }: StoreState) {
  return {
    scramble,
  };
}

export default connect(mapStateToProps)(withStyles(Styles)(Measurer));
