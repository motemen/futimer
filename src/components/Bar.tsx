import * as React from 'react';
import { connect } from 'react-redux';

import { AppBar, Toolbar, Typography, Select } from '@material-ui/core';
import { PuzzleType, PuzzleConfiguration } from '../models';
import { StoreState } from '../types';

interface Props {
  puzzleType: PuzzleType;
}

class Bar extends React.Component<Props> {
  public render() {
    return <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography variant="title" color="inherit" style={{ textTransform: 'uppercase', marginRight: 20 }}>
          &#x25F3; fuTimer
        </Typography>
        <Select value={this.props.puzzleType} native={true}>
          {
            Object.keys(PuzzleConfiguration).sort().map((key) => {
              return <option value={key} key={key}>{PuzzleConfiguration[key].longName}</option>;
            })
          }
        </Select>
      </Toolbar>
    </AppBar>;
  }
}

function mapStateToProps({ current: { session: { puzzle } } }: StoreState) {
  return {
    puzzleType: puzzle
  };
}

export default connect(mapStateToProps)(Bar);