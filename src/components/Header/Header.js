import React from 'react'
import PropTypes from 'prop-types'
import isEmpty from 'lodash/isEmpty'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'

const HeaderButton = (props) => {
  if (props.loading) {
    return null
  }

  return isEmpty(props.user)
    ? <Button color="contrast" onClick={props.login}>Авторизация</Button>
    : <Button color="contrast" onClick={props.logout}>Выйти</Button>
}

export const Header = (props) => (
  <AppBar position="static">
    <Toolbar>
      <Typography type="title" color="inherit" className={props.classes.flex}>
        Дневник астмы
      </Typography>
      <HeaderButton {...props}/>
    </Toolbar>
  </AppBar>
)

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired
}

Header.defaultProps = {
  loading: false
}