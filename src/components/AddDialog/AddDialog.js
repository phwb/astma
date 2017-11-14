import React, { Component } from 'react'
import PropTypes from 'prop-types'
import isEmpty from 'lodash/isEmpty'
import { withStyles } from 'material-ui/styles'
import Button from 'material-ui/Button'
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogActions
} from 'material-ui/Dialog'
import AddIcon from 'material-ui-icons/Add'
import TextField from 'material-ui/TextField'
import Radio, { RadioGroup } from 'material-ui/Radio'
import { FormControlLabel } from 'material-ui/Form'
import moment from 'moment'

const buttonStyles = {
  floating: {
    margin: 0,
    position: 'fixed',
    top: 'auto',
    left: 'auto',
    right: 20,
    bottom: 70
  }
}

const AddButton = withStyles(buttonStyles)((props) => (
  <Button fab color="accent" className={props.classes.floating} onClick={props.onClick}>
    <AddIcon/>
  </Button>
))

AddButton.propTypes = {
  user: PropTypes.object.isRequired
}

const dialogStyles = {
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  radios: {
    flexDirection: 'row'
  }
}

const getDefaultState = () => ({
  value: 0,
  type: 'morning',
  date: moment().format('YYYY-MM-DD')
})

class AddDialogComponent extends Component {
  state = {
    open: false,
    form: getDefaultState()
  }

  onInputChange = (name) => (e) => {
    const { state } = this
    let { value } = e.target

    if (name === 'value') {
      value = parseFloat(value)
    }

    this.setState({
      form: {
        ...state.form,
        [name]: value
      }
    })
  }

  showDialog = () => {
    this.setState({
      open: true
    })
  }

  hideDialog = () => {
    this.setState({
      open: false
    })
  }

  submitDialog = () => {
    const { form } = this.state
    const date = (function (d, t) {
      switch (t) {
        case 'morning':
          return `${d}T10:00`
        case 'dinner':
          return `${d}T14:00`
        default:
          return `${d}T18:00`
      }
    }(form.date, form.type))

    this.hideDialog()
    this.props.addEntry({
      value: form.value,
      date
    })
  }

  render () {
    const { classes, user } = this.props
    const { form, open } = this.state

    if (isEmpty(user)) {
      return null
    }

    return (
      <div>
        <AddButton user={user} onClick={this.showDialog}/>
        <Dialog open={open}>
          <DialogTitle>Добавить запись</DialogTitle>
          <DialogContent>
            <form className={classes.form}>
              <TextField
                label="Дата"
                margin="normal"
                type="date"
                value={form.date}
                onChange={this.onInputChange('date')}
              />
              <TextField
                label="Значение"
                margin="normal"
                type="number"
                step="any"
                min="0"
                value={form.value}
                onChange={this.onInputChange('value')}
              />
              <RadioGroup className={classes.radios} name="type" value={form.type} onChange={this.onInputChange('type')}>
                <FormControlLabel value="morning" control={<Radio/>} label="Утро"/>
                <FormControlLabel value="dinner" control={<Radio/>} label="День"/>
                <FormControlLabel value="evening" control={<Radio/>} label="Вечер"/>
              </RadioGroup>
            </form>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.hideDialog}>Закрыть</Button>
            <Button color="primary" onClick={this.submitDialog} >Добавить</Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

AddDialogComponent.propTypes = {
  addEntry: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired
}

export const AddDialog = withStyles(dialogStyles)(AddDialogComponent)
