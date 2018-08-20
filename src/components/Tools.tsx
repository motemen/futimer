import * as React from 'react';
import { connect } from 'react-redux';

import { Select, Paper, Typography, Toolbar, createStyles, Theme, withStyles, WithStyles } from '@material-ui/core';

import { StoreState } from '../types';
import VideoRecorder from './VideoRecorder';
import ScramblePreview from './tools/ScramblePreview';

const Styles = (theme: Theme) => createStyles({
  root: {
    marginRight: theme.spacing.unit * 2,
  },
  content: {
    padding: theme.spacing.unit,
  }
});

enum ToolType {
  Recorder = 'recorder',
  Stats = 'stats',
  Preview = 'preview',
}

interface OwnProps {
  selected: ToolType
}

type Props = OwnProps & WithStyles<typeof Styles>

class Tools extends React.Component<Props> {
  public render() {
    return <Paper elevation={1} className={this.props.classes.root}>
      <Toolbar>
        <Typography variant="headline" style={{ marginRight: 10 }}>Tools</Typography>
        <Select native value={this.props.selected}>
          {
            Object.keys(ToolType).sort().map((key) => {
              return <option value={key} key={key}>{key}</option>;
            })
          }
        </Select>
      </Toolbar>
      <div className={this.props.classes.content}>
        {
          {
            [ToolType.Recorder]: () => <VideoRecorder />,
            [ToolType.Stats]: () => <span>stats</span>,
            [ToolType.Preview]: () => <ScramblePreview />
          }[this.props.selected]()
        }
      </div>
    </Paper>;
  }
}

function mapStateToProps(state: StoreState) {
  return { selected: ToolType.Preview };
}

export default connect(mapStateToProps)(withStyles(Styles)(Tools));