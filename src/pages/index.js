import React, { Component } from 'react'
import PropTypes from 'prop-types'
import isEmpty from 'lodash/isEmpty'
import withRoot from '../components/withRoot'
import { withStyles } from 'material-ui/styles'
import { initializeApp, firestore, auth } from 'firebase'
import 'firebase/firestore'
import moment from 'moment'
import Header from '../components/Header'
import Chart from '../components/Chart'
import AddDialog from '../components/AddDialog'

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
  chart: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  }
}

class Index extends Component {
  state = {
    ui: {
      openAddDialog: false,
      loadingUser: true,
      loadingData: false
    },
    user: {},
    entries: []
  }

  constructor () {
    super()

    initializeApp(config)
    this.db = firestore()
  }

  componentDidMount () {
    auth().languageCode = 'ru'
    auth().onAuthStateChanged(async (user) => {
      const { state, db } = this

      if (!isEmpty(user)) {
        this.setState({
          user: {
            name: user.displayName,
            uid: user.uid
          },
          ui: {
            ...state.ui,
            loadingUser: false,
            loadingData: true
          }
        })

        let entries = []
        const docs = await db.collection(`users/${user.uid}/entries`).orderBy('date').get()
        console.log(docs)
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

        this.setState((prevState) => ({
          entries,
          ui: {
            ...prevState.ui,
            loadingData: false
          }
        }))

        return
      }

      this.setState({
        ui: {
          ...state.ui,
          loadingUser: false
        }
      })
    })
  }

  login = async () => {
    try {
      await auth().setPersistence(auth.Auth.Persistence.LOCAL)

      const provider = new auth.GoogleAuthProvider()
      const { user } = await auth().signInWithPopup(provider)

      this.setState({
        user: {
          name: user.displayName,
          uid: user.uid
        }
      })
    } catch (e) {
      console.info(e)
    }
  }

  logout = async () => {
    try {
      await auth().signOut()

      this.setState({
        user: {},
        entries: []
      })
    } catch (e) {
      console.info(e)
    }
  }

  addEntry = async (entry) => {
    const { state } = this

    this.setState({
      ui: {
        ...state.ui,
        loadingData: true
      }
    })

    try {
      const docDef = await this.db.collection(`users/${state.user.uid}/entries`).add(entry)

      entry = Object.assign({}, entry, {
        id: docDef.id
      })

      this.setState((prevState) => ({
        entries: [
          ...prevState.entries,
          entry
        ]
      }))
    } catch (e) {
      console.warn(e)
    }

    this.setState((prevState) => ({
      ui: {
        ...prevState.ui,
        loadingData: false
      }
    }))
  }

  render () {
    const { classes } = this.props
    const { state } = this
    const data = isEmpty(state.entries)
      ? []
      : state.entries.map(entry => ({
        ...entry,
        date: moment(entry.date).format('DD.MM')
      }))

    return (
      <div className={classes.root}>
        <Header
          loading={state.ui.loadingUser}
          user={state.user}
          login={this.login}
          logout={this.logout}
        />
        <div className={classes.chart}>
          <Chart data={data} loading={state.ui.loadingData}/>
        </div>
        <AddDialog user={state.user} addEntry={this.addEntry}/>
      </div>
    )
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withRoot(withStyles(styles)(Index))
