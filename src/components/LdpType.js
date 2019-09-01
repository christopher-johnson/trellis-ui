import React from 'react'
import { LDP } from '../utils/Vocab'
import Chip from '@material-ui/core/Chip';
import { createStyles, makeStyles } from '@material-ui/core/styles';

const ldpTypes = [LDP.IndirectContainer, LDP.DirectContainer, LDP.BasicContainer,
                  LDP.Container, LDP.RDFSource, LDP.NonRDFSource, LDP.Resource];

const mostSpecificType = (types = []) => {
  const all = {};
  types.forEach(type => all[type] = 1);
  return ldpTypes.find(type => all[type])
}

const useStyles = makeStyles((theme) =>
  createStyles({
    chip: {
      margin: theme.spacing(1),
    },
  }),
);

export const LdpType = ({types = []}) => {
  const type = mostSpecificType(types);
  const classes = useStyles();

  if (type) {
    return (
      <Chip variant="outlined" size="small" label={type.replace(LDP.getNs(), "")} className={classes.chip} />
    )
  } else {
    return (<section id="ldpResourceTypes"/>);
  }
}
