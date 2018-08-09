import * as React from 'react';
import { connect } from 'react-redux';

import * as keycode from 'keycode';

import classNames from 'classnames';

import { ButtonBase, createStyles, Theme, WithStyles, withStyles } from '@material-ui/core';
import { green, red } from '@material-ui/core/colors';

import { ButtonBaseActions } from '@material-ui/core/ButtonBase';
import { AsyncActions } from '../actions';
import { formatDuration } from '../models';
import { StoreState } from '../types';

interface OwnProps {
  scramble?: string;
}

type Props = OwnProps & { dispatch: any; } & WithStyles<typeof Styles>;

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

  private focusVisible?: () => void;

  constructor(props: Props) {
    super(props);
    this.timerRef = React.createRef();
  }

  public componentWillMount() {
    this.props.dispatch(AsyncActions.resetScramble());
  }

  public componentDidMount() {
    this.timerRef.current!.innerText = formatDuration(0);
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
          AsyncActions.commitRecord({
            record: {
              scramble: this.props.scramble!,
              time: elapsed,
              timestamp: performance.timing.navigationStart + startTime,
            }
          })
        );
      },
      550,
    );

    this.animTimer = null;
    this.startTime = null;
  }
}

function mapStateToProps({ current: { scramble } }: StoreState) {
  return {
    scramble,
  };
}

export default connect(mapStateToProps)(withStyles(Styles)(Measurer));
