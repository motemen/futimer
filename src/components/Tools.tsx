import * as React from "react";
import { connect } from "react-redux";

import {
  Select,
  Paper,
  Typography,
  Toolbar,
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core";

import VideoRecorder from "./tools/VideoRecorder";
import ScramblePreview from "./tools/ScramblePreview";
import Stats from "./tools/Stats";
import { ToolType, StoreState } from "../models";
import { Dispatch, Actions } from "../actions";

const Styles = (theme: Theme) =>
  createStyles({
    root: {
      marginRight: theme.spacing.unit * 2
    },
    content: {
      padding: theme.spacing.unit
    }
  });

interface OwnProps {
  selected: ToolType;
}

type Props = OwnProps & WithStyles<typeof Styles> & { dispatch: Dispatch };

class Tools extends React.Component<Props> {
  public render() {
    return (
      <Paper elevation={1} className={this.props.classes.root}>
        <Toolbar>
          <Typography variant="headline" style={{ marginRight: 20 }}>
            Tools
          </Typography>
          <Select
            native
            value={this.props.selected}
            onChange={this.handleTypeChange}
          >
            {Object.keys(ToolType)
              .sort()
              .map(key => {
                return (
                  <option value={ToolType[key]} key={key}>
                    {key}
                  </option>
                );
              })}
          </Select>
        </Toolbar>
        <div className={this.props.classes.content}>{this.renderContent()}</div>
      </Paper>
    );
  }

  private handleTypeChange = (ev: React.ChangeEvent<any>) => {
    this.props.dispatch(Actions.changeToolType({ toolType: ev.target.value }));
  };

  private renderContent(): React.ReactNode {
    const builder =
      {
        [ToolType.Recorder]: () => <VideoRecorder />,
        [ToolType.Stats]: () => <Stats />,
        [ToolType.Preview]: () => <ScramblePreview />
      }[this.props.selected] || (() => <span>stats</span>);
    return builder();
  }
}

function mapStateToProps({ tool: { selected } }: StoreState) {
  return { selected };
}

export default connect(mapStateToProps)(withStyles(Styles)(Tools));
