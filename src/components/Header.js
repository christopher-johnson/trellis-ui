import React from 'react';
import {AppBar, Divider, IconButton, Toolbar, Typography,InputBase, Paper} from '@material-ui/core';
import {EndAdornment, SearchIconButton} from "./SearchBoxInputAdornments";
import {createStyles, makeStyles} from '@material-ui/core/styles';
import {Home} from '@material-ui/icons';

const useStyles = makeStyles((theme) =>
  createStyles({
    appBar: {
      backgroundColor: '#050531',
      color: theme.palette.primary.contrastText,
      transition: theme.transitions.create(['width', 'margin'], {
        duration: theme.transitions.duration.leavingScreen,
        easing: theme.transitions.easing.sharp,
      }),
      zIndex: theme.zIndex.drawer + 1,
    },
    container: {
      display: 'flex',
      flex: '1',
      justifyContent: 'space-evenly',
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      maxHeight: '32px',
      position: 'relative',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
      },
      width: '100%'
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block',
      },
    },
    input: {
      backgroundColor: 'white', margin: 8
    },
    root: {
      alignItems: 'center',
      display: 'flex',
      padding: '2px 4px',
      width: '50%',
    },
  }),
);

export const Header = (props) => {
  const classes = useStyles();
  const [identifier, setIdentifier] = React.useState('')

  const handleChange = (evt) => {
    setIdentifier(evt.target.value)
  }

  const handleClear = () => {
    setIdentifier('')
  }

  const handleSubmit = (evt) => {
    props.onSubmit(identifier);
    evt.preventDefault();
    setIdentifier('');
  }

  return (
      <AppBar
        className={classes.appBar}
        position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="open drawer"
            onClick={handleSubmit}
          >
            <Home/>
          </IconButton>
          <Typography className={classes.title} variant="h6" noWrap>
            Trellis LDP
          </Typography>
          <form
            autoComplete="off"
            className={classes.container}
            data-testid='standard-searchform'
            noValidate
            onSubmit={handleSubmit}
          >
            <Paper className={classes.root}>
              <InputBase
                className={classes.input}
                fullWidth
                placeholder={'search'}
                id="standard-full-width"
                onChange={handleChange}
                type="search"
                value={identifier}
              />
              {identifier ?
                <>
                  <EndAdornment onClick={handleClear}/>

                </> : null
              }
              <Divider className={classes.divider} />
              <SearchIconButton onClick={handleSubmit}/>
            </Paper>
          </form>
        </Toolbar>
      </AppBar>
  )
}
