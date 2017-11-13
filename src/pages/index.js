import React, { Component } from 'react'
import PropTypes from 'prop-types'
import isEmpty from 'lodash/isEmpty'
import withRoot from '../components/withRoot'
import classNames from 'classnames'
import { withStyles } from 'material-ui/styles'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { initializeApp, firestore, auth } from 'firebase'
import 'firebase/firestore'
import moment from 'moment'

const config = {
  apiKey: 'AIzaSyC4dR0mZ6eZ1aVs1EG4lPt22gcbS3QL_Rg',
  authDomain: 'astma-88894.firebaseapp.com',
  databaseURL: 'https://astma-88894.firebaseio.com',
  projectId: 'astma-88894',
  storageBucket: 'astma-88894.appspot.com',
  messagingSenderId: '241876833843'
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh'
  },
  flex: {
    flex: 1,
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  floatingButton: {
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed'
  },
  radioButtons: {
    flexDirection: 'row'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  }
}

const getDefaultState = () => ({
  value: 0,
  type: 'morning',
  date: moment().format('YYYY-MM-DD')
})

let db

class Index extends Component {
  state = {
    ui: {
      openAddDialog: false,
      loading: true
    },
    user: {},
    entries: [],
    form: getDefaultState()
  }

  componentDidMount () {
    initializeApp(config)

    auth().languageCode = 'ru'
    auth().onAuthStateChanged(async (user) => {
      const { state } = this

      if (!isEmpty(user)) {
        this.setState({
          user: {
            ...state.user,
            name: user.displayName,
            uid: user.uid
          }
        })

        db = firestore()
        let entries = []
        const docs = await db.collection(`users/${user.uid}/entries`)
          .orderBy('date')
          .get()
        docs.forEach(doc => {
          const data = doc.data()

          entries = [
            ...entries,
            {
              ...data,
              id: doc.id
            }
          ]
        })

        this.setState({
          entries
        })
      }

      this.setState({
        ui: {
          ...state.ui,
          loading: false
        }
      })
    })
  }

  showAddDialog = () => {
    const { state } = this

    this.setState({
      ui: {
        ...state.ui,
        openAddDialog: true
      }
    })
  }

  hideAddDialog = () => {
    const { state } = this

    this.setState({
      ui: {
        ...state.ui,
        openAddDialog: false
      }
    })
  }

  authenticate = async () => {
    const { state } = this

    try {
      await auth().setPersistence(auth.Auth.Persistence.LOCAL)

      const provider = new auth.GoogleAuthProvider()
      const { user } = await auth().signInWithPopup(provider)

      this.setState({
        user: {
          ...state.user,
          name: user.displayName,
          uid: user.uid
        }
      })
    } catch (e) {
      console.warn(e)
    }
  }

  addEntry = async (e) => {
    e.preventDefault()

    const {
      form,
      user,
      entries,
      ui
    } = this.state
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

    try {
      let entry = {
        value: form.value,
        date: date
      }

      const docDef = await db.collection(`users/${user.uid}/entries`).add(entry)

      entry = Object.assign({}, entry, {
        id: docDef.id
      })

      this.setState({
        form: getDefaultState(),
        entries: [
          ...entries,
          entry
        ],
        ui: {
          ...ui,
          openAddDialog: false
        }
      })
    } catch (e) {
      console.warn(e)
    }
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

  render () {
    const { classes } = this.props
    const { openAddDialog: open } = this.state.ui
    const { user, form, entries } = this.state
    const authorized = !isEmpty(user)
    const data = isEmpty(entries)
      ? []
      : entries.map(entry => ({
        ...entry,
        date: moment(entry.date).format('DD.MM')
      }))

    const HeaderButton = authorized
      ? <Button color="contrast" onClick={() => console.log('user auth')}>{user.name}</Button>
      : <Button color="contrast" onClick={this.authenticate}>Авторизация</Button>
    const AddButton = authorized
      ? <Button fab color="accent" className={classes.floatingButton} onClick={this.showAddDialog}>
        <AddIcon/>
      </Button>
      : null

    return (
      <div className={classes.root}>
        <Dialog open={open}>
          <DialogTitle>
            Добавить запись
          </DialogTitle>
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
              <RadioGroup className={classes.radioButtons} name="type" value={form.type} onChange={this.onInputChange('type')}>
                <FormControlLabel value="morning" control={<Radio/>} label="Утро"/>
                <FormControlLabel value="dinner" control={<Radio/>} label="День"/>
                <FormControlLabel value="evening" control={<Radio/>} label="Вечер"/>
              </RadioGroup>
            </form>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.hideAddDialog}>Закрыть</Button>
            <Button color="primary" onClick={this.addEntry} >Добавить</Button>
          </DialogActions>
        </Dialog>
        <AppBar position="static">
          <Toolbar>
            <Typography type="title" color="inherit" className={classes.flex}>
              Дневник астмы
            </Typography>
            {HeaderButton}
          </Toolbar>
        </AppBar>
        <div className={classNames(classes.flex, classes.content)}>
          <ResponsiveContainer width="95%" height="95%">
            <LineChart data={data}>
              <XAxis dataKey="date"/>
              <YAxis/>
              <Tooltip/>
              <CartesianGrid strokeDasharray="3 3"/>
              <Line dataKey="value" type="monotone" stroke="#8884d8"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        {AddButton}
      </div>
    )
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withRoot(withStyles(styles)(Index))
